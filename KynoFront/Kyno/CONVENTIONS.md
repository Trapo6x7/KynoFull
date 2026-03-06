# 📐 CONVENTIONS DE CODE - KYNO

## 🎯 Règles générales

### Naming
- **Composants**: PascalCase (ex: `ProfileHeader.tsx`)
- **Hooks**: camelCase avec préfixe `use` (ex: `useProfileData.ts`)
- **Types/Interfaces**: PascalCase avec suffix descriptif (ex: `ProfileProps`, `MessageViewModel`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_IMAGES`, `DEFAULT_REGION`)
- **Fonctions utilitaires**: camelCase (ex: `formatDate`, `getInitials`)

### Structure de fichier
```typescript
// 1. Imports externes
import React from 'react';
import { View, Text } from 'react-native';

// 2. Imports internes
import { Button } from '@/src/components/ui';
import Colors from '@/src/constants/colors';

// 3. Types/Interfaces
interface ComponentProps {
  name: string;
}

// 4. Constantes
const MAX_LENGTH = 100;

// 5. Composant
export function Component({ name }: ComponentProps) {
  return <View><Text>{name}</Text></View>;
}

// 6. Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

## 📏 Limites

- **Max 50 lignes** par composant (hors styles)
- **Max 3 props** pour composants atomiques
- **Max 5 props** pour composants composés
- **1 responsabilité** par composant

## 🎨 Composants

### Atomiques (ui/)
- Pas de logique métier
- Props simples et typées
- Réutilisables partout
- Exemples: Button, Avatar, Badge

### Composés (feature/)
- Orchestrent les atomiques
- Peuvent avoir de la logique
- Spécifiques à une feature
- Exemples: ProfileHeader, ChatInputBar

### Écrans (screens/)
- Orchestration uniquement
- Pas de JSX complexe
- Délèguent aux composants
- Max 100 lignes

## 🪝 Hooks

### Règles
- Préfixe `use` obligatoire
- 1 responsabilité par hook
- Retour typé explicitement
- Max 50 lignes

### Exemples
```typescript
// ✅ BON
export function useProfileData(userId: number) {
  const [data, setData] = useState<Profile | null>(null);
  // ...
  return { data, loading, error };
}

// ❌ MAUVAIS
export function useProfile(userId: number) {
  // Fait trop de choses: fetch, cache, validation, formatting
}
```

## 📦 Types

### Organisation
- Types partagés dans `src/types/`
- Types spécifiques dans le même fichier
- Préférer `interface` pour les objets
- Préférer `type` pour les unions

### Exemples
```typescript
// ✅ BON
export interface UserProfile {
  id: number;
  name: string;
}

export type ProfileMode = 'me' | 'preview' | 'match';

// ❌ MAUVAIS
export type UserProfile = {
  id: number;
  name: string;
}; // Utiliser interface
```

## 🎭 Props

### Unions discriminées
```typescript
// ✅ BON
type ProfileProps = 
  | { mode: 'me'; onEdit: () => void }
  | { mode: 'preview'; onLike: () => void };

// ❌ MAUVAIS
interface ProfileProps {
  mode: 'me' | 'preview';
  onEdit?: () => void;  // Optionnel = violation LSP
  onLike?: () => void;
}
```

## 🧪 Tests

### Naming
- Fichiers: `Component.test.tsx`
- Describe: nom du composant
- It: comportement attendu

### Structure
```typescript
describe('ProfileHeader', () => {
  it('should display user name', () => {
    // Arrange
    const props = { name: 'John' };
    
    // Act
    render(<ProfileHeader {...props} />);
    
    // Assert
    expect(screen.getByText('John')).toBeTruthy();
  });
});
```

## 📝 Commentaires

### Quand commenter
- Logique complexe non évidente
- Workarounds temporaires
- Décisions architecturales

### Quand NE PAS commenter
- Code auto-explicatif
- Répétition du code
- Commentaires obsolètes

```typescript
// ❌ MAUVAIS
// Incrémente le compteur
count++;

// ✅ BON
// Workaround: API retourne parfois null au lieu de []
const items = response.data ?? [];
```

## 🚀 Performance

### React.memo
```typescript
// Composants atomiques réutilisés souvent
export const Avatar = React.memo(({ uri, name }: AvatarProps) => {
  // ...
});
```

### useMemo / useCallback
```typescript
// Calculs coûteux
const sortedItems = useMemo(() => 
  items.sort((a, b) => a.date - b.date),
  [items]
);

// Callbacks passés en props
const handlePress = useCallback(() => {
  onPress(id);
}, [id, onPress]);
```

## ✅ Checklist avant commit

- [ ] Composant < 50 lignes
- [ ] 1 responsabilité unique
- [ ] Props typées
- [ ] Pas de logique métier dans la vue
- [ ] Nommage cohérent
- [ ] Tests passent
- [ ] Pas de console.log
- [ ] Imports organisés
