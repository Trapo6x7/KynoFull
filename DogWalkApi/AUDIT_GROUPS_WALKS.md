# 🔍 AUDIT COMPLET - Système Groups & Walks (DogWalk → Kyno)

## 📊 Résumé Exécutif

**Contexte** : Kyno est une app de rencontres entre propriétaires de chiens. Le système de groupes hérité de DogWalk est **incompatible** avec cette logique.

**Problème principal** : L'architecture actuelle force les utilisateurs à rejoindre des groupes pour interagir, alors que Kyno doit permettre des interactions directes 1-à-1 via matching.

---

## 🚨 VIOLATIONS CRITIQUES (À CORRIGER IMMÉDIATEMENT)

### 1. **Walk Entity - Confusion de responsabilités**

**Fichier** : `src/Entity/Walk.php`

**Problème** :
- La table `walk` sert maintenant à **noter les lieux OSM** (spots de promenade)
- Mais elle garde une FK `walk_group_id` et des permissions basées sur les groupes
- Les ApiResource operations utilisent encore `GROUP_VIEW`, `WALK_VIEW` avec sécurité groupe

```php
// ❌ PROBLÉMATIQUE
new GetCollection(
    uriTemplate: '/groups/{id}/walks',
    security: "is_granted('GROUP_VIEW', object)",
    securityMessage: "Seuls les membres du groupe peuvent voir les balades"
),
```

**Impact** : 
- Un utilisateur ne peut pas noter un lieu s'il n'est pas dans un groupe
- Logique métier incohérente : les spots sont personnels, pas liés aux groupes

**Solution recommandée** :
```php
// ✅ KYNO - Walks = Spots personnels
new GetCollection(
    uriTemplate: '/users/{userId}/walks', // Spots de l'utilisateur
    security: "is_granted('ROLE_USER')",
),
new Post(
    security: "is_granted('ROLE_USER')", // Tout user peut noter un spot
),
```

---

### 2. **WalkVoter - Logique hybride dangereuse**

**Fichier** : `src/Security/Voter/WalkVoter.php`

**Problème** :
```php
// ✅ Bon : basé sur user_id
self::EDIT   => $walk->getUser()?->getId() === $user->getId(),

// ❌ Mais le voter injecte GroupMembershipChecker (inutilisé maintenant)
public function __construct(
    private readonly GroupMembershipChecker $membershipChecker
) {}
```

**Impact** : Code mort, dépendance inutile, confusion pour les devs

**Solution** : Supprimer `GroupMembershipChecker` du constructeur

---

### 3. **Review Entity - Liée aux groupes**

**Fichier** : `src/Entity/Review.php`

**Problème** :
```php
#[ORM\ManyToOne(inversedBy: 'reviews')]
#[ORM\JoinColumn(nullable: false)]
private ?Group $walkGroup = null; // ❌ Pourquoi un avis sur un groupe ?
```

**Impact** : 
- Dans Kyno, les avis devraient être sur les **utilisateurs** (après une rencontre)
- Ou sur les **spots** (lieux de promenade)
- Pas sur des groupes qui n'existent plus conceptuellement

**Solution** :
- Soit supprimer `Review` complètement
- Soit la transformer en `UserReview` (avis sur un user après match)
- Soit la lier aux `Walk` (avis sur un spot OSM)

---

### 4. **Comment Entity - Polymorphique mais orienté groupes**

**Fichier** : `src/Entity/Comment.php`

**Problème** :
```php
public const TYPE_GROUP = 'group'; // ❌ Pourquoi commenter un groupe ?
public const TYPE_WALK = 'walk';   // ❌ Walk = spot personnel maintenant
```

**Impact** : 
- Les commentaires sur groupes n'ont plus de sens dans Kyno
- Les commentaires sur walks sont ambigus (spot ou promenade ?)

**Solution** :
- Garder `TYPE_USER` (commenter un profil)
- Garder `TYPE_DOG` (commenter un chien)
- **Supprimer** `TYPE_GROUP` et `TYPE_WALK`

---

### 5. **Conversation Entity - Support groupes inutile**

**Fichier** : `src/Entity/Conversation.php`

**Problème** :
```php
#[ORM\ManyToOne(targetEntity: Group::class)]
private ?Group $group = null; // ❌ Conversations de groupe dans une app de rencontres ?

public function isGroupConversation(): bool { 
    return $this->type === 'group'; 
}
```

**Impact** : 
- Complexité inutile : Kyno = conversations 1-à-1 uniquement
- Risque de bugs si un dev essaie de créer une conversation de groupe

**Solution** :
- Supprimer le champ `group_id` et `type`
- Simplifier : `Conversation` = toujours entre 2 users
- Supprimer `ConversationDataPersister::handleGroupConversation()`

---

## ⚠️ VIOLATIONS MOYENNES (À planifier)

### 6. **User Entity - Relations groupes obsolètes**

**Fichier** : `src/Entity/User.php`

**Problème** :
```php
#[ORM\OneToMany(targetEntity: Group::class, mappedBy: 'creator')]
private Collection $createdGroups; // ❌ Inutile dans Kyno

#[ORM\OneToMany(targetEntity: GroupMembership::class, mappedBy: 'user')]
private Collection $memberships; // ❌ Inutile dans Kyno

public function getActiveGroups(): array { ... } // ❌ Méthode morte
```

**Impact** : 
- Pollution du modèle User
- Confusion pour les nouveaux devs
- Sérialisation inutile (`me:read` inclut les groupes)

**Solution** :
- Supprimer `createdGroups`, `memberships`, `reviews`
- Nettoyer les groupes de sérialisation

---

### 7. **GroupMembershipChecker Service - Code mort**

**Fichier** : `src/Service/GroupMembershipChecker.php`

**Problème** : Service entier dédié aux groupes, mais plus utilisé (sauf dans WalkVoter qui ne l'utilise pas)

**Solution** : **Supprimer complètement**

---

### 8. **Controllers Admin - Gestion groupes inutile**

**Fichiers** :
- `src/Controller/Admin/GroupCrudController.php`
- `src/Controller/Admin/GroupMembershipCrudController.php`
- `src/Controller/Admin/ReviewCrudController.php`

**Impact** : Interface admin polluée avec des entités obsolètes

**Solution** : Supprimer ces controllers admin

---

### 9. **WalkController - Route groupes**

**Fichier** : `src/Controller/WalkController.php`

**Problème** :
```php
#[Route('/groups/{id}/walks', name: 'get_group_walks', methods: ['GET'])]
public function getGroupWalks(int $id): JsonResponse
```

**Impact** : Route morte, ne devrait plus exister

**Solution** : Supprimer ce controller ou le transformer en `/users/{id}/spots`

---

## 📋 ENTITÉS À SUPPRIMER COMPLÈTEMENT

| Entité | Raison | Impact |
|--------|--------|--------|
| **Group** | Concept inexistant dans Kyno | Cascade sur GroupMembership, Review, Comment |
| **GroupMembership** | Dépend de Group | Simplifie User |
| **Review** | Liée aux groupes, pas aux users | À remplacer par UserReview si besoin |

---

## 🔧 PLAN DE MIGRATION RECOMMANDÉ

### Phase 1 : Découplage Walk des Groupes (URGENT)
1. Rendre `walk_group_id` nullable dans Walk
2. Supprimer les permissions basées sur groupes dans WalkVoter
3. Changer les routes API : `/groups/{id}/walks` → `/users/me/spots`
4. Mettre à jour SpotsController pour gérer les spots personnels

### Phase 2 : Nettoyage Conversation
1. Supprimer le support des conversations de groupe
2. Simplifier ConversationDataPersister
3. Supprimer `group_id`, `type` de Conversation

### Phase 3 : Suppression Comment/Review sur groupes
1. Supprimer `TYPE_GROUP` et `TYPE_WALK` de Comment
2. Supprimer Review ou la transformer en UserReview
3. Nettoyer les migrations

### Phase 4 : Suppression complète des groupes
1. Supprimer Group, GroupMembership entities
2. Supprimer tous les controllers/services/voters liés
3. Nettoyer User des relations groupes
4. Migration SQL pour drop tables

---

## 📊 STATISTIQUES

- **Fichiers impactés** : ~25 fichiers
- **Entités à supprimer** : 3 (Group, GroupMembership, Review)
- **Controllers à supprimer** : 5
- **Services à supprimer** : 2
- **Migrations à créer** : 4

---

## ✅ CE QUI FONCTIONNE DÉJÀ POUR KYNO

- ✅ UserMatch (système de like/dislike)
- ✅ Conversation 1-à-1 (si on supprime le support groupe)
- ✅ Walk avec user_id (spots personnels)
- ✅ Dog, Keyword, UserModeration
- ✅ Matching service

---

## 🎯 RECOMMANDATION FINALE

**Priorité CRITIQUE** : Découpler Walk des groupes (Phase 1) car cela bloque la fonctionnalité principale de notation des spots.

**Priorité HAUTE** : Supprimer le support conversations de groupe (Phase 2) pour éviter les bugs.

**Priorité MOYENNE** : Nettoyer les entités mortes (Phases 3-4) pour réduire la dette technique.

**Estimation** : 3-5 jours de dev + tests pour les phases 1-2, 2-3 jours pour les phases 3-4.
