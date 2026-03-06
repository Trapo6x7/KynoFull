# 🧹 Nettoyage Front - Références aux Groupes

## 📋 Fichiers à SUPPRIMER

### 1. Écran groupe
- ✅ `app/group-detail.tsx` - Écran de détail d'un groupe

### 2. Service groupe
- ✅ `src/services/groupService.ts` - Service complet pour gérer les groupes

---

## 📝 Fichiers à MODIFIER

### 1. Types (`src/types/index.ts`)
**À supprimer :**
```typescript
// Interface User
createdGroups?: Group[];

// Interfaces complètes
export interface Group { ... }
export interface GroupMember { ... }
export interface GroupRole { ... }
export interface GroupRequest { ... }
```

### 2. Chat Service (`src/services/chatService.ts`)
**À supprimer :**
```typescript
async getOrCreateGroupConversation(groupId: number): Promise<Conversation> {
  // Méthode complète à supprimer
}
```

### 3. API Config (`src/config/api.ts`)
**À vérifier et supprimer si présent :**
```typescript
ENDPOINTS: {
  GROUPS: '/groups',
  GROUP_REQUESTS: '/group_requests',
  // ...
}
```

### 4. Services Index (`src/services/index.ts`)
**À supprimer si présent :**
```typescript
export { default as groupService } from './groupService';
```

---

## 🔍 Recherche de références restantes

### Commandes à exécuter :
```bash
# Rechercher "group" dans tous les fichiers TypeScript
findstr /S /I "group" *.ts *.tsx | findstr /V "background"

# Rechercher les imports de groupService
findstr /S "groupService" *.ts *.tsx

# Rechercher les types Group
findstr /S "Group" *.ts *.tsx | findstr /V "GroupMember GroupRole GroupRequest"
```

---

## ✅ Résultat attendu

Après nettoyage, le front ne doit plus avoir :
- ❌ Aucun écran de groupe
- ❌ Aucun service de groupe
- ❌ Aucun type lié aux groupes
- ❌ Aucune méthode de conversation de groupe
- ❌ Aucun endpoint API de groupe

---

## 🎯 Architecture Front finale (Kyno)

```
Screens:
├── (auth) - Authentification
├── (onboarding) - Onboarding utilisateur
├── (tabs)
│   ├── explore - Découvrir des profils
│   ├── likes - Matches
│   ├── messages - Conversations 1-à-1
│   ├── map - Spots de promenade
│   └── profile - Profil utilisateur
├── chat - Conversation 1-à-1
├── profile-detail - Détail d'un profil
└── settings - Paramètres

Services:
├── authService - Authentification
├── userService - Gestion utilisateurs
├── dogService - Gestion chiens
├── matchService - Système de matching
├── chatService - Conversations 1-à-1
├── spotService - Spots de promenade
├── keywordService - Keywords
└── raceService - Races de chiens
```

---

## 📊 Impact estimé

- **Fichiers à supprimer** : 2
- **Fichiers à modifier** : 4
- **Lignes à supprimer** : ~200
- **Temps estimé** : 15 minutes
