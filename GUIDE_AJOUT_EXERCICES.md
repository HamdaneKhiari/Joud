# 📚 Guide : Ajouter des Exercices et du Contenu

Ce guide explique comment ajouter du contenu pédagogique (vocabulaire, exercices, jeux) dans l'application Joud.

---

## 🏗️ Architecture des Données

### Vue d'ensemble

L'application utilise **SQLite local** avec une structure en couches :

```
Database (SQLite)
    ↓
Queries (src/database/queries.ts)
    ↓
Hooks (src/hooks/...)
    ↓
Composants (src/screens/..., src/components/...)
```

### Tables principales

| Table | Description | Fichier de migration |
|-------|-------------|---------------------|
| `modules` | Modules pédagogiques (Vocabulary, Grammar, etc.) | `001_init_modules.ts` |
| `families` | Familles de contenu (Colors, Numbers, etc.) | `002_init_families.ts` |
| `content` | Contenu d'exercices (mots, phrases, questions) | `003_init_content.ts` |
| `levels` | Niveaux de difficulté (1, 2, 3, 4) | `001_init_modules.ts` |
| `progress` | Progression utilisateur | Auto-généré |
| `daily_words` | Mots du jour | `009_seed_dashboard_data.ts` |

---

## 📝 Ajouter du Contenu : 3 Étapes

### **Étape 1 : Créer une Migration**

Les migrations se trouvent dans `src/database/migrations/`.

#### Exemple : Ajouter des mots de vocabulaire

Créez un fichier `010_add_food_vocabulary.ts` :

```typescript
import { SQLiteDatabase } from 'expo-sqlite';

export const up = async (db: SQLiteDatabase) => {
  // 1. Créer une famille si elle n'existe pas
  await db.runAsync(
    `INSERT INTO families (module_slug, name, icon, emoji, description, order_index)
     VALUES ('vocabulary', 'Food', 'restaurant', '🍕', 'Common food and drinks', 5)`
  );

  // 2. Récupérer l'ID de la famille
  const family = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM families WHERE module_slug = 'vocabulary' AND name = 'Food'`
  );

  if (!family) throw new Error('Family not found');

  // 3. Ajouter le contenu (mots) pour les niveaux 1 et 2
  const words = [
    // Niveau 1 (débutant)
    { english: 'apple', french: 'pomme', emoji: '🍎', level: 1 },
    { english: 'bread', french: 'pain', emoji: '🍞', level: 1 },
    { english: 'water', french: 'eau', emoji: '💧', level: 1 },

    // Niveau 2 (intermédiaire)
    { english: 'vegetables', french: 'légumes', emoji: '🥗', level: 2 },
    { english: 'delicious', french: 'délicieux', emoji: '😋', level: 2 },
  ];

  for (const word of words) {
    const data = JSON.stringify({
      english: word.english,
      french: word.french,
      emoji: word.emoji,
      example: `I eat ${word.english} every day.`,
      phonetic: '', // Optionnel
    });

    await db.runAsync(
      `INSERT INTO content (family_id, level, content_type, data, difficulty, tags)
       VALUES (?, ?, 'word', ?, 'easy', 'food,vocabulary')`,
      [family.id, word.level, data]
    );
  }
};

export const down = async (db: SQLiteDatabase) => {
  await db.runAsync(`DELETE FROM families WHERE name = 'Food'`);
};
```

#### Exemple : Ajouter un jeu de mots (WordGames)

```typescript
export const up = async (db: SQLiteDatabase) => {
  const family = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM families WHERE module_slug = 'wordgames' AND name = 'Definition'`
  );

  if (!family) throw new Error('Family not found');

  // Ajouter une question "Definition Game"
  const question = JSON.stringify({
    question: 'A large grey animal with a long trunk',
    answer: 'elephant',
    distractors: ['lion', 'tiger', 'giraffe'],
    hint: 'It never forgets!',
    emoji: '🐘',
  });

  await db.runAsync(
    `INSERT INTO content (family_id, level, content_type, data, difficulty)
     VALUES (?, 1, 'wordgame', ?, 'medium')`,
    [family.id, question]
  );
};
```

---

### **Étape 2 : Enregistrer la Migration**

Ouvrez `src/database/init.ts` et ajoutez votre migration :

```typescript
import * as migration010 from './migrations/010_add_food_vocabulary';

const MIGRATIONS: Migration[] = [
  // ... migrations existantes
  { version: 10, up: migration010.up, down: migration010.down },
];
```

---

### **Étape 3 : Tester**

1. **Supprimer l'ancienne base** (pour forcer la recréation) :
   - iOS Simulator : Reset Content and Settings
   - Android Emulator : Clear app data
   - Expo : `expo start -c` (clear cache)

2. **Lancer l'app** : La migration s'exécutera automatiquement au premier lancement.

3. **Vérifier dans l'app** : Allez dans le module correspondant pour voir le nouveau contenu.

---

## 🎯 Exemples par Type de Contenu

### 1️⃣ Vocabulaire (Module "Vocabulary")

**Table** : `content` avec `content_type = 'word'`

**Structure JSON** :
```json
{
  "english": "hello",
  "french": "bonjour",
  "emoji": "👋",
  "example": "Hello, how are you?",
  "phonetic": "/həˈloʊ/"
}
```

**Fichier de migration** : `src/database/migrations/003_seed_content.ts`

---

### 2️⃣ Jeux de Mots (Module "WordGames")

**Families** :
- `Definition` (Devine le mot à partir de sa définition)
- `Blanks` (Complète la phrase)
- `Detective` (Trouve le mot caché)
- `Idioms` (Expressions idiomatiques)
- `SyntaxMaster` (Réorganise les mots)

**Structure JSON (Definition)** :
```json
{
  "question": "A person who teaches students",
  "answer": "teacher",
  "distractors": ["doctor", "engineer", "lawyer"],
  "hint": "Works in a school",
  "emoji": "👨‍🏫"
}
```

**Fichier de migration** : `src/database/migrations/005_seed_wordgames.ts`

---

### 3️⃣ Dialogues (Module "Dialogue")

**Table** : `content` avec `content_type = 'dialogue'`

**Structure JSON** :
```json
{
  "title": "At the Restaurant",
  "emoji": "🍽️",
  "characters": [
    { "name": "Waiter", "avatar": "👨‍🍳" },
    { "name": "Customer", "avatar": "🙋" }
  ],
  "lines": [
    { "speaker": "Waiter", "text": "Good evening! How may I help you?", "translation": "Bonsoir ! Comment puis-je vous aider ?" },
    { "speaker": "Customer", "text": "I'd like a table for two, please.", "translation": "Je voudrais une table pour deux, s'il vous plaît." }
  ]
}
```

**Fichier de migration** : `src/database/migrations/006_seed_dialogues.ts`

---

### 4️⃣ Grammaire (Module "Grammar")

**Table** : `content` avec `content_type = 'grammar'`

**Structure JSON** :
```json
{
  "rule": "Present Simple",
  "explanation": "Use the base form of the verb for I/you/we/they. Add -s for he/she/it.",
  "examples": [
    { "english": "I play football.", "french": "Je joue au football." },
    { "english": "She plays tennis.", "french": "Elle joue au tennis." }
  ],
  "exercises": [
    {
      "question": "He ___ (go) to school every day.",
      "answer": "goes",
      "distractors": ["go", "going", "went"]
    }
  ]
}
```

---

### 5️⃣ Mots du Jour (Dashboard)

**Table** : `daily_words`

**Structure** :
```sql
INSERT INTO daily_words (identity_id, level, english, french, emoji, category, date)
VALUES ('primary', 1, 'happy', 'heureux', '😊', 'emotions', NULL);
```

**Fichier de migration** : `src/database/migrations/009_seed_dashboard_data.ts`

**Note** : Si `date = NULL`, le mot est dans le pool général (tirage aléatoire). Si `date = '2026-02-01'`, il s'affichera uniquement ce jour-là.

---

## 🔍 Vérifier les Données en DB

### Méthode 1 : Utiliser Expo SQLite Debugger

```typescript
// Dans n'importe quel composant
const { db } = useUser();

useEffect(() => {
  const checkData = async () => {
    const families = await db.getAllAsync('SELECT * FROM families');
    console.log('Families:', families);
  };
  checkData();
}, []);
```

### Méthode 2 : Utiliser un outil externe

- **DB Browser for SQLite** (https://sqlitebrowser.org/)
- Localiser le fichier DB :
  - iOS : `~/Library/Developer/CoreSimulator/Devices/.../Documents/SQLite/joud.db`
  - Android : `/data/data/com.yourapp/databases/joud.db`

---

## 🎨 White Label : Adapter le Contenu par Identité

### Personnaliser les Labels de Module

**Table** : `module_labels`

```sql
INSERT INTO module_labels (identity_id, module_slug, display_title, display_description, icon_name)
VALUES
  ('primary', 'vocabulary', 'Mes Mots Magiques', 'Apprends de nouveaux mots en t''amusant !', 'stars'),
  ('lycee', 'vocabulary', 'Vocabulaire Essentiel', 'Enrichis ton lexique en anglais', 'book-open');
```

**Fichier de migration** : `src/database/migrations/004_seed_white_label.ts`

### Personnaliser les Mots du Jour par Identité

```sql
-- Mots adaptés aux primaires
INSERT INTO daily_words (identity_id, level, english, french, emoji)
VALUES ('primary', 1, 'sunshine', 'soleil', '☀️');

-- Mots adaptés aux adultes
INSERT INTO daily_words (identity_id, level, english, french, emoji)
VALUES ('adult', 3, 'resilience', 'résilience', '🌱');
```

---

## 📊 Résumé des Fichiers Clés

| Quoi ajouter | Fichier à créer/modifier | Table affectée |
|--------------|--------------------------|----------------|
| Nouveau module | `001_init_modules.ts` | `modules` |
| Nouvelle famille | Migration personnalisée | `families` |
| Nouveau vocabulaire | Migration personnalisée | `content` |
| Nouveaux jeux | `005_seed_wordgames.ts` | `content` |
| Nouveaux dialogues | `006_seed_dialogues.ts` | `content` |
| Mots du jour | `009_seed_dashboard_data.ts` | `daily_words` |
| Labels personnalisés | `004_seed_white_label.ts` | `module_labels`, `level_labels` |

---

## ✅ Checklist Avant de Pousser du Contenu

- [ ] La migration a un numéro unique (ex: `010_...`)
- [ ] La migration est enregistrée dans `init.ts`
- [ ] Le JSON `data` est bien formaté (pas d'erreur de syntaxe)
- [ ] Les `family_id` et `level` sont corrects
- [ ] Le `content_type` correspond au type d'exercice (`word`, `wordgame`, `dialogue`, etc.)
- [ ] Les tags sont pertinents (`tags: 'food,vocabulary'`)
- [ ] Testé sur au moins une identité (primary, college, lycee, adult)
- [ ] Testé sur au moins un niveau (1, 2, 3, ou 4)

---

## 🚀 Prochaines Étapes

1. **Ajouter du contenu réel** : Créer une migration avec 50+ mots de vocabulaire
2. **Tester le système de révision** : Utiliser `spaced_repetition` table
3. **Ajouter des badges** : Compléter la table `user_badges`
4. **Optimiser les queries** : Ajouter des index si la base devient lourde

---

**Besoin d'aide ?** Consulte `GUIDE_THEMES.md` pour personnaliser l'apparence de l'app.
