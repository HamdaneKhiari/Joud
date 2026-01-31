# 🎨 Guide : Gérer les Thèmes et Identités (White Label)

Ce guide explique comment personnaliser l'apparence de l'application Joud selon différentes identités (primaire, collège, lycée, adulte).

---

## 🏷️ Qu'est-ce que le White Label ?

Le **White Label** permet d'avoir **une seule application** qui s'adapte à différentes audiences avec :
- Des **couleurs** différentes
- Des **textes** personnalisés
- Des **visuels** adaptés (emojis, illustrations)
- Des **tonalités** différentes (ludique pour primaire, sérieux pour adulte)

### Les 4 Identités

| Identité | Public cible | Couleur principale | Mood | Exemple de texte |
|----------|--------------|-------------------|------|------------------|
| `primary` | École primaire | Bleu/Violet ludique | Playful | "Bravo champion ! 🎉" |
| `college` | Collège | Vert/Bleu | Semi-playful | "Bien joué ! 👍" |
| `lycee` | Lycée | Bleu profond | Clean | "Correct ✓" |
| `adult` | Adultes | Bleu marine | Clean | "Well done." |

---

## 🔧 Changer d'Identité (Pour Tester)

### **Méthode 1 : Via l'onboarding**

Lors du premier lancement, l'app demande à l'utilisateur de choisir son niveau :
- **"Je suis à l'école"** → `primary`
- **"Je suis au collège"** → `college`
- **"Je suis au lycée"** → `lycee`
- **"Je suis adulte"** → `adult`

Ce choix est stocké dans `UserContext` et persiste dans AsyncStorage.

### **Méthode 2 : Modifier manuellement (développement)**

Ouvrez `src/contexts/UserContext.tsx` et changez la valeur par défaut :

```typescript
// Dans UserContext.tsx, ligne ~50
const [user, setUser] = useState<User | null>({
  id: 'dev-user',
  firstName: 'Test',
  audience: 'lycee', // ⬅️ Changer ici : 'primary', 'college', 'lycee', 'adult'
});
```

**Puis** : Redémarrez l'app avec `expo start -c` (clear cache).

---

## 🎨 Personnaliser les Couleurs

### **Étape 1 : Modifier la Table `branding`**

Les couleurs sont stockées dans la base de données SQLite.

**Fichier** : `src/database/migrations/004_seed_white_label.ts`

```sql
INSERT INTO branding (
  id,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  surface_color,
  error_color,
  success_color,
  warning_color,
  mood
) VALUES (
  'lycee',
  '#1E3A8A', -- Bleu marine foncé
  '#3B82F6', -- Bleu ciel
  '#F59E0B', -- Orange accent
  '#F9FAFB', -- Fond gris clair
  '#FFFFFF', -- Surface blanche
  '#EF4444', -- Rouge erreur
  '#10B981', -- Vert succès
  '#F59E0B', -- Orange warning
  'clean'    -- Mood : 'playful' ou 'clean'
);
```

**Après modification** :
1. Supprimer la base de données (reset app)
2. Relancer l'app pour recréer la DB avec les nouvelles couleurs

---

### **Étape 2 : Modifier les Tokens de Design**

**Fichier** : `src/themes/tokens.ts`

Ce fichier contient les **valeurs par défaut** (utilisées si la DB n'est pas encore chargée).

```typescript
export const colorTokens = {
  primary: {
    main: '#1E3A8A',      // Couleur principale
    light: '#3B82F6',     // Version claire
    dark: '#1E40AF',      // Version foncée
    contrast: '#FFFFFF',  // Texte sur fond primary
  },
  secondary: {
    main: '#F59E0B',
    light: '#FCD34D',
    dark: '#D97706',
    contrast: '#000000',
  },
  // ...
};
```

**Note** : Ces valeurs sont **écrasées** par la DB dès que `ThemeContext` charge les données de `branding`.

---

## 📝 Personnaliser les Textes

### **Labels de Modules**

**Table** : `module_labels`

Permet de renommer les modules selon l'identité.

```sql
-- Vocabulaire pour primaire (ludique)
INSERT INTO module_labels (identity_id, module_slug, display_title, display_description, icon_name)
VALUES (
  'primary',
  'vocabulary',
  'Mes Mots Magiques ✨',
  'Apprends de nouveaux mots en t''amusant !',
  'stars'
);

-- Vocabulaire pour lycée (sérieux)
INSERT INTO module_labels (identity_id, module_slug, display_title, display_description, icon_name)
VALUES (
  'lycee',
  'vocabulary',
  'Vocabulaire Essentiel',
  'Enrichis ton lexique en anglais',
  'book-open'
);
```

**Fichier** : `src/database/migrations/004_seed_white_label.ts`

---

### **Labels de Niveaux**

**Table** : `level_labels`

Permet de personnaliser les titres de niveaux.

```sql
-- Niveau 1 pour primaire
INSERT INTO level_labels (identity_id, level_number, display_title, badge_text, display_description)
VALUES ('primary', 1, 'Les Aventuriers 🚀', '1', 'Débute ton aventure en anglais !');

-- Niveau 1 pour adulte
INSERT INTO level_labels (identity_id, level_number, display_title, badge_text, display_description)
VALUES ('adult', 1, 'Fondamentaux', 'A1', 'Maîtrise les bases essentielles');
```

**Fichier** : `src/database/migrations/004_seed_white_label.ts`

---

### **Messages de Feedback**

**Table** : `feedback_messages`

Permet de personnaliser les messages de succès/erreur.

```sql
-- Feedback pour primaire (enthousiaste)
INSERT INTO feedback_messages (identity_id, context, state, icon, title, message)
VALUES (
  'primary',
  'wordgames',
  'correct',
  '🎉',
  'Bravo champion !',
  'Tu as trouvé la bonne réponse ! Continue comme ça !'
);

-- Feedback pour lycée (sobre)
INSERT INTO feedback_messages (identity_id, context, state, icon, title, message)
VALUES (
  'lycee',
  'wordgames',
  'correct',
  '✓',
  'Correct',
  'Bonne réponse.'
);
```

**Fichier** : `src/database/migrations/008_seed_feedback_messages.ts`

**Contextes disponibles** :
- `wordgames` : Jeux de mots
- `exercise` : Exercices classiques
- `vocabulary` : Apprentissage de vocabulaire
- `dialogue` : Exercices de dialogue

**États disponibles** :
- `correct` : Bonne réponse du premier coup
- `incorrect_attempt_1` : Première erreur
- `incorrect_attempt_2` : Deuxième erreur
- `skip` : Utilisateur passe la question

---

## 🖼️ Personnaliser le Mood (Playful vs Clean)

### **Qu'est-ce que le Mood ?**

Le `mood` définit le style visuel global :

| Mood | Description | Bordures | Ombres | Emojis |
|------|-------------|----------|--------|--------|
| `playful` | Ludique, enfantin | Arrondies | Colorées | Nombreux 🎨 |
| `clean` | Professionnel, sobre | Moins arrondies | Subtiles | Rares ✓ |

### **Modifier le Mood**

**Dans la table `branding`** :

```sql
UPDATE branding SET mood = 'clean' WHERE id = 'lycee';
UPDATE branding SET mood = 'playful' WHERE id = 'primary';
```

**Impact dans le code** :

```typescript
// ThemeContext fournit identity.mood
const { identity } = useTheme();

// Exemple dans un style
const styles = StyleSheet.create({
  card: {
    borderRadius: identity.mood === 'playful' ? 24 : 12,
    shadowColor: identity.mood === 'playful' ? identity.palette.primary : '#000',
  },
});
```

---

## 📂 Fichiers Clés pour les Thèmes

### **1. Base de Données**

| Fichier | Description |
|---------|-------------|
| `src/database/migrations/004_seed_white_label.ts` | Données de branding (couleurs, mood) |
| `src/database/migrations/008_seed_feedback_messages.ts` | Messages de feedback par identité |
| `src/database/schema.ts` | Types TypeScript (Branding, ModuleLabel, etc.) |

### **2. Contexte et Hooks**

| Fichier | Description |
|---------|-------------|
| `src/themes/ThemeContext.tsx` | Context provider qui charge le thème depuis la DB |
| `src/contexts/UserContext.tsx` | Stocke l'identité de l'utilisateur (`user.audience`) |
| `src/hooks/exercises/useFeedbackMessages.ts` | Hook pour récupérer les feedbacks |

### **3. Tokens de Design**

| Fichier | Description |
|---------|-------------|
| `src/themes/tokens.ts` | Valeurs par défaut (spacing, fontSize, shadows, etc.) |
| `src/themes/types.ts` | Types TypeScript pour Identity, Palette, etc. |

### **4. Composants Utilisant le Thème**

Tous les composants utilisent `useTheme()` pour accéder au thème :

```typescript
import { useTheme } from '@/themes/ThemeContext';

const MyComponent = () => {
  const { identity } = useTheme();

  return (
    <View style={{ backgroundColor: identity.palette.surface }}>
      <Text style={{ color: identity.text.primary }}>
        {identity.mood === 'playful' ? 'Salut ! 👋' : 'Bonjour.'}
      </Text>
    </View>
  );
};
```

---

## 🚀 Ajouter une Nouvelle Identité

### **Exemple : Ajouter "university" (niveau universitaire)**

#### **Étape 1 : Ajouter le Branding en DB**

Dans `src/database/migrations/004_seed_white_label.ts` :

```sql
INSERT INTO branding (
  id,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  surface_color,
  error_color,
  success_color,
  warning_color,
  mood
) VALUES (
  'university',
  '#0F172A', -- Bleu très foncé (professionnel)
  '#475569', -- Gris bleuté
  '#F59E0B', -- Orange accent
  '#F8FAFC', -- Fond clair
  '#FFFFFF', -- Surface blanche
  '#DC2626', -- Rouge
  '#16A34A', -- Vert
  '#F59E0B', -- Orange
  'clean'
);
```

#### **Étape 2 : Ajouter les Labels de Modules**

```sql
INSERT INTO module_labels (identity_id, module_slug, display_title, display_description, icon_name)
VALUES
  ('university', 'vocabulary', 'Academic Vocabulary', 'Master advanced English terms', 'graduation-cap'),
  ('university', 'wordgames', 'Language Challenges', 'Test your linguistic skills', 'puzzle');
```

#### **Étape 3 : Ajouter les Feedbacks**

```sql
INSERT INTO feedback_messages (identity_id, context, state, icon, title, message)
VALUES
  ('university', 'wordgames', 'correct', '✓', 'Excellent', 'Perfectly executed.'),
  ('university', 'wordgames', 'incorrect_attempt_1', '✗', 'Incorrect', 'Review the concept and try again.');
```

#### **Étape 4 : Ajouter un Niveau dans `levels`**

```sql
INSERT INTO levels (level, target_audience, title, description, badge, order_index)
VALUES
  (1, 'university', 'Advanced Fundamentals', 'Master complex grammatical structures', 'C1', 1),
  (2, 'university', 'Proficiency', 'Native-level fluency', 'C2', 2);
```

#### **Étape 5 : Permettre la Sélection dans l'Onboarding**

Dans `src/screens/Onboarding/AudienceSelectionScreen.tsx`, ajouter :

```typescript
const audiences = [
  // ... existants
  {
    id: 'university',
    title: 'Je suis à l\'université',
    description: 'Niveau avancé (C1-C2)',
    icon: 'graduation-cap',
    emoji: '🎓',
  },
];
```

---

## 🧪 Tester les Thèmes

### **1. Tester toutes les identités**

Créez un fichier `src/utils/testThemes.ts` :

```typescript
export const switchIdentity = async (audience: 'primary' | 'college' | 'lycee' | 'adult') => {
  const { setUser } = useUser();
  setUser((prev) => ({ ...prev!, audience }));
};
```

Puis dans n'importe quel écran :

```typescript
<Button title="Tester Primaire" onPress={() => switchIdentity('primary')} />
<Button title="Tester Lycée" onPress={() => switchIdentity('lycee')} />
```

### **2. Vérifier les Couleurs**

Afficher toutes les couleurs du thème actuel :

```typescript
const { identity } = useTheme();

console.log('Palette:', identity.palette);
console.log('Text:', identity.text);
console.log('Mood:', identity.mood);
```

---

## 📊 Tableau Récapitulatif

| Pour modifier... | Table DB | Fichier de migration |
|------------------|----------|---------------------|
| Couleurs principales | `branding` | `004_seed_white_label.ts` |
| Noms de modules | `module_labels` | `004_seed_white_label.ts` |
| Noms de niveaux | `level_labels` | `004_seed_white_label.ts` |
| Messages de feedback | `feedback_messages` | `008_seed_feedback_messages.ts` |
| Mots du jour | `daily_words` | `009_seed_dashboard_data.ts` |
| Mood (playful/clean) | `branding.mood` | `004_seed_white_label.ts` |

---

## ✅ Checklist Avant de Changer de Thème

- [ ] La nouvelle identité a une entrée dans `branding`
- [ ] Les `module_labels` sont définis pour tous les modules
- [ ] Les `level_labels` sont définis pour tous les niveaux
- [ ] Les `feedback_messages` sont complets (correct, incorrect_attempt_1, incorrect_attempt_2, skip)
- [ ] Les `daily_words` sont adaptés au niveau de l'audience
- [ ] Le `mood` est cohérent avec le public cible
- [ ] L'onboarding permet de sélectionner cette identité
- [ ] Testé sur iOS et Android
- [ ] Cache vidé (`expo start -c`) avant le test

---

## 🎯 Exemples Concrets

### **Exemple 1 : Changer la couleur principale de "lycee"**

```sql
-- Dans 004_seed_white_label.ts
UPDATE branding SET primary_color = '#1D4ED8' WHERE id = 'lycee';
```

Puis : Reset app → Relancer.

### **Exemple 2 : Rendre "college" plus ludique**

```sql
UPDATE branding SET mood = 'playful' WHERE id = 'college';

UPDATE feedback_messages
SET title = 'Super ! 🎉', message = 'Tu progresses bien !'
WHERE identity_id = 'college' AND state = 'correct';
```

### **Exemple 3 : Personnaliser le Dashboard pour "adult"**

```sql
-- Changer les mots du jour
UPDATE daily_words
SET english = 'perseverance', french = 'persévérance', emoji = '🏔️'
WHERE identity_id = 'adult' AND level = 1;

-- Changer le titre du niveau 1
UPDATE level_labels
SET display_title = 'Essential Skills', badge_text = 'A2'
WHERE identity_id = 'adult' AND level_number = 1;
```

---

## 🚀 Aller Plus Loin

- **Thème sombre (Dark Mode)** : Ajouter `theme_mode` dans `branding` (`light` ou `dark`)
- **Typographie personnalisée** : Ajouter `font_family` dans `branding`
- **Palettes dynamiques** : Utiliser `identity_palettes` pour des dégradés
- **A/B Testing** : Tester plusieurs variantes de couleurs pour une même identité

---

**Besoin d'ajouter du contenu ?** Consulte `GUIDE_AJOUT_EXERCICES.md`.
