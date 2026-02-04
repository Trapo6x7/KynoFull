# Refactorisation du Polymorphisme - DogWalkApi

## Modifications effectuées

### 1. **Keywordables** - Système polymorphique pour les keywords
- ✅ Nouvelle entité `Keywordable` avec `keyword_id`, `keywordable_type`, `keywordable_id`
- ✅ Repository `KeywordableRepository` avec méthodes de requête
- ✅ Service `KeywordService` pour gérer les associations
- ✅ Normalizer `KeywordableNormalizer` pour charger automatiquement les keywords
- ✅ Mise à jour des entités `User`, `Dog`, `Group` pour utiliser le système polymorphique
- ✅ Mise à jour des DataPersisters pour synchroniser les keywords

**Migration:** `Version20260204100000.php`
- Crée la table `keywordables`
- Migre les données de `user_keyword` et `dog_keyword`
- Supprime les anciennes tables

### 2. **Comments** - Système polymorphique pour les commentaires
- ✅ Refactorisation de `Comment` avec `commented_type` et `commented_id`
- ✅ Support pour commenter: Group, Walk, Dog, User
- ✅ Ajout de constantes `TYPE_GROUP`, `TYPE_WALK`, `TYPE_DOG`, `TYPE_USER`
- ✅ Méthodes deprecated pour la compatibilité ascendante

**Migration:** `Version20260204110000.php`
- Ajoute `commented_type` et `commented_id` à la table `comment`
- Migre les données existantes (commentaires sur les groupes)
- Supprime la colonne `group_id` et sa clé étrangère
- Crée l'index `idx_commented`

### 3. **GroupMembership** - Fusion de GroupRole et GroupRequest
- ✅ Nouvelle entité `GroupMembership` qui remplace `GroupRole` et `GroupRequest`
- ✅ Repository `GroupMembershipRepository` avec méthodes spécialisées
- ✅ Status possibles: `invited`, `requested`, `active`, `banned`
- ✅ Rôles possibles: `CREATOR`, `ADMIN`, `MEMBER`
- ✅ Méthodes helper: `accept()`, `isActive()`, `isCreator()`, `isAdminOrCreator()`
- ✅ Mise à jour de `User` et `Group` pour utiliser `memberships` au lieu de `groupRoles` et `groupRequests`
- ✅ Mise à jour de `GroupDataPersister`

**Migration:** `Version20260204120000.php`
- Crée la table `group_membership`
- Migre les données de `group_role` (→ status='active')
- Migre les données de `group_request` (→ status='requested')
- Supprime les anciennes tables `group_role` et `group_request`

## Ordre d'application des migrations

```bash
# Appliquer toutes les migrations
php bin/console doctrine:migrations:migrate

# Ou une par une:
php bin/console doctrine:migrations:execute --up DoctrineMigrations\\Version20260204100000
php bin/console doctrine:migrations:execute --up DoctrineMigrations\\Version20260204110000
php bin/console doctrine:migrations:execute --up DoctrineMigrations\\Version20260204120000
```

## Avantages de la refactorisation

### 1. Keywords polymorphiques
- ✅ Une seule table pour tous les types d'entités
- ✅ Facile d'ajouter des keywords à de nouvelles entités
- ✅ Moins de tables, schéma plus simple
- ✅ Requêtes plus flexibles

### 2. Comments polymorphiques
- ✅ Permet de commenter n'importe quelle entité (Group, Walk, Dog, User)
- ✅ Une seule logique de commentaires à maintenir
- ✅ Évolutif: ajouter de nouveaux types commentables facilement

### 3. GroupMembership unifié
- ✅ Une seule table au lieu de deux (group_role + group_request)
- ✅ Gestion claire des états: invited, requested, active, banned
- ✅ Historique complet de l'appartenance
- ✅ Simplifie la logique métier
- ✅ Évite les incohérences (un user ne peut avoir qu'un seul statut par groupe)

## Compatibilité

Les anciennes méthodes sont maintenues temporairement avec `@deprecated`:
- `Comment::setGroup()` / `Comment::getGroup()`

Ces méthodes peuvent être supprimées dans une version future après mise à jour du code client.

## Tests recommandés

1. ✅ Créer un groupe (vérifie la création du membership)
2. ✅ Demander à rejoindre un groupe (status=requested)
3. ✅ Accepter une demande (status=active)
4. ✅ Ajouter des keywords à User, Dog, Group
5. ✅ Créer des commentaires sur différentes entités
6. ✅ Vérifier la sérialisation API (keywords chargés automatiquement)

## Structure de la base de données

### Avant
- `user_keyword` (user_id, keyword_id)
- `dog_keyword` (dog_id, keyword_id)
- `group_role` (id, user_id, walk_group_id, role)
- `group_request` (id, user_id, walk_group_id, status, created_at, updated_at)
- `comment` (id, user_id, group_id, content)

### Après
- `keywordables` (id, keyword_id, keywordable_type, keywordable_id, created_at)
- `group_membership` (id, user_id, group_id, status, role, created_at, updated_at)
- `comment` (id, user_id, commented_type, commented_id, content, created_at)

**Réduction**: 5 tables → 3 tables (40% de réduction)
