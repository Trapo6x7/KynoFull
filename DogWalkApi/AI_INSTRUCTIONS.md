# Instructions IA pour DogWalk API - Refactorisation SOLID

## 📋 Vue d'ensemble du projet

### Architecture actuelle
- **Framework**: Symfony 6 + API Platform
- **ORM**: Doctrine
- **Authentification**: JWT (Lexik)
- **Administration**: EasyAdmin
- **Base de données**: MySQL/PostgreSQL
- **Upload de fichiers**: Service FileUploader custom

### Structure des entités principales
```
User (Utilisateur principal)
├── Dog (Chiens possédés)
├── Group (Groupes créés)
├── GroupRole (Rôles dans les groupes)
├── GroupRequest (Demandes d'adhésion)
├── Walk (Promenades organisées)
├── Comment (Commentaires)
├── Review (Avis)
├── Report (Signalements)
└── BlockList (Liste de blocage)
```

## 🎯 Règles SOLID à respecter

### 1. Single Responsibility Principle (SRP)
**✅ À MAINTENIR** :
- Les entités ne gèrent QUE leurs données
- Les Voters se concentrent sur les autorisations spécifiques
- FileUploader se contente de l'upload de fichiers

**❌ VIOLATIONS IDENTIFIÉES** :
- **DataPersister trop complexes** : `UserUpdateDataPersister` gère 2 opérations distinctes (upload d'image + mise à jour profil)
- **Contrôleurs avec logique métier** : `DogController::deleteDog()` duplique la logique de `DogService::deleteDog()`

**🔧 ACTIONS DE REFACTORISATION** :
```php
// AVANT (violation SRP)
class UserUpdateDataPersister {
    public function process(...) {
        if (str_contains($operation->getName(), 'image_post')) {
            // Logique upload image
        }
        // Logique mise à jour profil
    }
}

// APRÈS (respect SRP)
class UserImageDataPersister implements ProcessorInterface {
    public function process(...) { /* Upload uniquement */ }
}

class UserProfileDataPersister implements ProcessorInterface {
    public function process(...) { /* Mise à jour profil uniquement */ }
}
```

### 2. Open/Closed Principle (OCP)
**✅ ARCHITECTURE EXTENSIBLE** :
- Utilisation d'interfaces Symfony (`ProcessorInterface`, `ProviderInterface`)
- Système de Voters extensible pour les autorisations

**🔧 AMÉLIORATION SUGGÉRÉE** :
```php
// Interface pour centraliser les opérations CRUD
interface EntityServiceInterface {
    public function create(array $data): object;
    public function update(object $entity, array $data): object;
    public function delete(object $entity): bool;
}

// Implémentation spécifique par entité
class DogService implements EntityServiceInterface {
    // Implementation spécifique aux chiens
}
```

### 3. Liskov Substitution Principle (LSP)
**✅ RESPECT ACTUEL** :
- Tous les DataPersister implémentent correctement `ProcessorInterface`
- Les Voters étendent correctement `Voter`

**⚠️ ATTENTION FUTURE** :
- S'assurer que les nouvelles implémentations respectent les contrats d'interface

### 4. Interface Segregation Principle (ISP)
**❌ VIOLATION POTENTIELLE** :
- Les repositories générés utilisent toutes les méthodes de `ServiceEntityRepository` même si non nécessaires

**🔧 REFACTORISATION RECOMMANDÉE** :
```php
// Interfaces spécialisées
interface ReadableRepositoryInterface {
    public function find($id);
    public function findAll();
}

interface WritableRepositoryInterface {
    public function save(object $entity): void;
    public function remove(object $entity): void;
}

// Usage selon les besoins
class DogReadService {
    public function __construct(private ReadableRepositoryInterface $repository) {}
}
```

### 5. Dependency Inversion Principle (DIP)
**✅ BONNES PRATIQUES ACTUELLES** :
- Injection de dépendances via constructeur
- Configuration via `services.yaml`

**🔧 AMÉLIORATION SUGGÉRÉE** :
```php
// Créer des interfaces pour les services métier
interface UserServiceInterface {
    public function updateProfile(User $user, array $data): User;
    public function uploadImage(User $user, UploadedFile $file): User;
}

class UserUpdateDataPersister {
    public function __construct(
        private UserServiceInterface $userService // Interface, pas classe concrète
    ) {}
}
```

## 🏗️ Patterns actuels et recommandations

### DataPersister Pattern (État actuel)
**Force** : Logique centralisée pour les opérations CRUD API Platform
**Faiblesse** : Certains sont trop complexes et violent SRP

### Repository Pattern
**Force** : Séparation claire entre logique métier et accès données
**Amélioration** : Ajouter des interfaces spécialisées

### Service Layer Pattern
**Exemple existant** : `DogService`, `FileUploader`
**Recommandation** : Étendre à toutes les entités principales

## 📝 Guide de développement pour l'IA

### 1. Création d'une nouvelle entité
```bash
# Ordre recommandé
1. php bin/console make:entity
2. Créer l'interface du service (ex: DogServiceInterface)
3. Créer le service concret (ex: DogService)
4. Créer le repository avec interface métier
5. Créer les DataPersister spécialisés (un par opération complexe)
6. Créer les Voters si nécessaire
7. Ajouter les tests unitaires
```

### 2. Règles de nommage
```php
// Services
interface {Entity}ServiceInterface
class {Entity}Service implements {Entity}ServiceInterface

// DataPersister
class {Entity}{Operation}DataPersister implements ProcessorInterface
// Exemples : UserImageDataPersister, DogCreationDataPersister

// Voters
class {Entity}Voter extends Voter
// Méthodes : supports(), voteOnAttribute()

// Repositories
interface {Entity}RepositoryInterface
class {Entity}Repository extends ServiceEntityRepository implements {Entity}RepositoryInterface
```

### 3. Structure de dossier recommandée pour la refactorisation
```
src/
├── Contract/           # Interfaces métier
│   ├── Service/
│   └── Repository/
├── Entity/             # Entités Doctrine (inchangé)
├── DataPersister/      # Un par opération spécifique
├── Service/            # Services métier
├── Repository/         # Repositories (inchangé)
├── Security/Voter/     # Autorisations (inchangé)
└── Controller/         # Contrôleurs légers uniquement
```

### 4. Checklist avant commit
- [ ] Chaque classe a UNE responsabilité claire
- [ ] Les dépendances sont injectées via des interfaces
- [ ] Les services métier sont testables unitairement
- [ ] Les DataPersister sont spécialisés par opération
- [ ] Les contrôleurs ne contiennent QUE la logique de présentation
- [ ] Les Voters gèrent les autorisations métier

### 5. Commandes utiles pour le développement
```bash
# Tests
php bin/phpunit                          # Tous les tests
php bin/phpunit tests/Service/          # Tests services

# Debug
php bin/console debug:container         # Services enregistrés
php bin/console debug:router           # Routes API
php bin/console debug:security         # Configuration sécurité

# Base de données
php bin/console doctrine:schema:validate # Validation schema
php bin/console doctrine:migrations:migrate --dry-run # Test migration
```

## 🚨 Points d'attention pour la refactorisation

### Priorité 1 - Violations critiques à corriger
1. **UserUpdateDataPersister** : Séparer en `UserImageDataPersister` et `UserProfileDataPersister`
2. **Contrôleurs avec logique métier** : Déplacer vers des services
3. **Duplication de code** : Entre contrôleurs et services

### Priorité 2 - Améliorations architecturales
1. Créer des interfaces pour tous les services métier
2. Standardiser les repositories avec des interfaces spécialisées
3. Ajouter une couche de validation métier

### Priorité 3 - Optimisations
1. Cache pour les données de référence (Race, etc.)
2. Optimisation des requêtes N+1
3. Amélioration de la gestion d'erreurs

## 🔒 Règles de sécurité

### Authentification & Autorisation
- Toujours utiliser les Voters pour les autorisations complexes
- JWT valide requis pour toutes les opérations sensibles
- Validation des données d'entrée via les contraintes Symfony

### Upload de fichiers
- Validation du type MIME
- Limitation de la taille
- Noms de fichiers sécurisés (déjà implémenté dans FileUploader)

## 📚 Documentation technique

### Configuration importante
- **JWT** : Clés dans `config/jwt/`
- **CORS** : Configuration dans `config/packages/nelmio_cors.yaml`
- **Upload** : Répertoire `public/uploads/images/`
- **Base de données** : Configuration dans `.env.local`

### API Platform
- Entités exposées via annotations `#[ApiResource]`
- Groupes de sérialisation pour contrôler les données exposées
- DataPersister pour la logique métier complexe
- Provider pour les données custom

## 🎯 Objectifs de la refactorisation

1. **Court terme** (3 mois) : Corriger les violations SOLID critiques
2. **Moyen terme** (6 mois) : Standardiser l'architecture avec des interfaces
3. **Long terme** (1 an) : Architecture hexagonale complète

Cette documentation servira de référence pour maintenir la cohérence architecturale lors de la refactorisation progressive du projet.