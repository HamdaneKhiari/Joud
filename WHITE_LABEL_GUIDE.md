# 🎨 Guide White Label - Architecture 100% Pilotée par la Base de Données

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture des Tables](#architecture-des-tables)
3. [Comment Créer une Nouvelle Identité](#comment-créer-une-nouvelle-identité)
4. [Exemples Concrets](#exemples-concrets)
5. [Fonctions Disponibles](#fonctions-disponibles)
6. [Bonnes Pratiques](#bonnes-pratiques)

---

## 🎯 Vue d'Ensemble

L'architecture est **100% White Label** : toute la configuration visuelle, les labels, et la logique métier sont stockés dans la base de données SQLite. **Aucun hardcoding** dans le code.

### Principe Fondamental

**Pour créer une nouvelle identité (ex: "Business English", "Espagnol Débutant") :**
- ✅ Ajouter des INSERT dans `init.ts`
- ❌ **AUCUNE modification de code nécessaire**

---

## 📊 Architecture des Tables

### 1. Table `branding` - Identités Visuelles

Stocke toutes les configurations visuelles par identité.

```sql
CREATE TABLE branding (
  id TEXT PRIMARY KEY,                    -- 'primary', 'college', 'lycee', 'adult', 'business', etc.
  primary_color TEXT NOT NULL,            -- Couleur principale
  accent_color TEXT NOT NULL,             -- Couleur d'accent
  surface_color TEXT,                     -- Couleur de surface
  logo_name TEXT,                         -- Nom du logo/icône
  theme_mode TEXT DEFAULT 'light',        -- 'light' | 'dark'
  ui_has_gradient INTEGER DEFAULT 0,      -- 0 = false, 1 = true
  ui_gradient_colors TEXT,                -- JSON array: '["#2C3E50","#000000"]'
  ui_card_radius INTEGER DEFAULT 12,      -- 8, 12, 20, 24
  ui_show_decorative_shapes INTEGER DEFAULT 1,
  ai_accent_color TEXT,
  ai_error_color TEXT,
  ai_solution_bg TEXT,                    -- JSON array
  header_bg_color TEXT NOT NULL,
  header_accent_color TEXT NOT NULL,
  header_emoji TEXT,                      -- '🎈', '🚀', '🎓', '💼'
  header_welcome_text TEXT,               -- 'Salut,', 'Ready,', etc.
  daily_word_bg_color TEXT,
  daily_word_gradient TEXT,               -- JSON array ou NULL
  daily_word_decoration TEXT DEFAULT 'none', -- 'circles' | 'water-drop' | 'none'
  dashboard_level_progress_color TEXT NOT NULL,
  text_on_main_color TEXT NOT NULL
);
```

### 2. Table `module_labels` - Labels de Modules par Identité

Permet d'avoir des titres/descriptions différents selon l'identité.

```sql
CREATE TABLE module_labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_slug TEXT NOT NULL,              -- FK vers modules.slug
  identity_id TEXT NOT NULL,              -- FK vers branding.id
  display_title TEXT NOT NULL,            -- Titre affiché
  display_description TEXT NOT NULL,      -- Description affichée
  icon_name TEXT NOT NULL,                -- Nom de l'icône MaterialCommunityIcons
  UNIQUE(module_slug, identity_id)
);
```

**Fallback** : Si pas de label spécifique, utilise `modules.display_title`, `modules.display_description`, `modules.icon_name`

### 3. Table `level_labels` - Labels de Niveaux par Identité

Permet d'avoir des titres/badges différents selon l'identité.

```sql
CREATE TABLE level_labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level_number INTEGER NOT NULL,          -- 1, 2, 3, 4, etc.
  identity_id TEXT NOT NULL,              -- FK vers branding.id
  display_title TEXT NOT NULL,            -- Titre affiché
  badge_text TEXT NOT NULL,               -- Texte du badge
  display_description TEXT NOT NULL,      -- Description
  UNIQUE(level_number, identity_id)
);
```

**Fallback** : Si pas de label spécifique, utilise `levels.display_title`, `levels.badge`, `levels.display_description`

### 4. Table `identity_palettes` - Palettes de Couleurs

Stocke les palettes de couleurs pour les modules (ordre important).

```sql
CREATE TABLE identity_palettes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identity_id TEXT NOT NULL,              -- FK vers branding.id
  color_index INTEGER NOT NULL,           -- 0, 1, 2, 3, 4, 5, 6 (position)
  color_value TEXT NOT NULL,              -- '#FF5722'
  UNIQUE(identity_id, color_index)
);
```

**Usage** : La couleur d'un module est déterminée par sa position dans `module_availability` → index dans la palette

### 5. Table `module_availability` - Disponibilité des Modules

**Remplace toute la logique hardcodée** de `getAvailableModules()`.

```sql
CREATE TABLE module_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_slug TEXT NOT NULL,              -- FK vers modules.slug
  identity_id TEXT NOT NULL,              -- FK vers branding.id
  level_number INTEGER,                   -- NULL = tous les niveaux
  is_available INTEGER DEFAULT 1,        -- 0 = masqué, 1 = disponible
  UNIQUE(module_slug, identity_id, level_number)
);
```

**Logique** :
- `level_number IS NULL` → Module disponible pour **tous les niveaux** de cette identité
- `level_number = 7` → Module disponible **uniquement pour le niveau 7**
- `is_available = 0` → Module **masqué** pour cette combinaison

---

## 🚀 Comment Créer une Nouvelle Identité

### Exemple : Créer "Business English"

#### Étape 1 : Ajouter l'Identité Visuelle dans `branding`

```typescript
// Dans init.ts, section "SEED BRANDING"
await db.runAsync(`
  INSERT OR IGNORE INTO branding (
    id, primary_color, accent_color, surface_color, logo_name, theme_mode,
    ui_has_gradient, ui_gradient_colors, ui_card_radius, ui_show_decorative_shapes,
    ai_accent_color, ai_error_color, ai_solution_bg,
    header_bg_color, header_accent_color, header_emoji, header_welcome_text,
    daily_word_bg_color, daily_word_gradient, daily_word_decoration,
    dashboard_level_progress_color, text_on_main_color
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  'business',                              // id
  '#1E3A8A',                               // primary_color (bleu marine)
  '#3B82F6',                               // accent_color (bleu clair)
  '#F8FAFC',                               // surface_color
  'briefcase',                             // logo_name
  'light',                                 // theme_mode
  0,                                       // ui_has_gradient
  null,                                    // ui_gradient_colors
  12,                                      // ui_card_radius
  0,                                       // ui_show_decorative_shapes (sérieux)
  '#3B82F6',                               // ai_accent_color
  '#DC2626',                               // ai_error_color
  JSON.stringify(['#EFF6FF', '#DBEAFE']), // ai_solution_bg
  '#FFFFFF',                               // header_bg_color
  '#1E3A8A',                               // header_accent_color
  '💼',                                    // header_emoji
  'Hello,',                                // header_welcome_text
  '#F1F5F9',                               // daily_word_bg_color
  null,                                    // daily_word_gradient
  'none',                                  // daily_word_decoration
  '#1E3A8A',                               // dashboard_level_progress_color
  '#1E2937'                                // text_on_main_color
]);
```

#### Étape 2 : Ajouter les Labels de Modules

```typescript
// Dans init.ts, section "SEED MODULE_LABELS"
const businessModuleLabels = [
  ['vocab', 'business', 'Business Vocabulary', 'Professional terms and jargon', 'book-alphabet'],
  ['grammar', 'business', 'Professional Grammar', 'Formal structures and conventions', 'format-list-bulleted'],
  ['phrases', 'business', 'Business Phrases', 'Common expressions in meetings', 'format-quote-close'],
  ['reading', 'business', 'Business Reading', 'Reports and professional documents', 'text-box'],
  ['conversation', 'business', 'Business Conversations', 'Meetings and negotiations', 'chat'],
  ['assessment', 'business', 'Skills Assessment', 'Evaluate your business English', 'clipboard-check']
];

for (const label of businessModuleLabels) {
  await db.runAsync(
    `INSERT OR IGNORE INTO module_labels (module_slug, identity_id, display_title, display_description, icon_name) VALUES (?, ?, ?, ?, ?)`,
    label
  );
}
```

#### Étape 3 : Ajouter les Labels de Niveaux

```typescript
// Dans init.ts, section "SEED LEVEL_LABELS"
const businessLevelLabels = [
  [1, 'business', 'Beginner', 'BEG', 'Basic business communication'],
  [2, 'business', 'Elementary', 'ELE', 'Everyday business situations'],
  [3, 'business', 'Intermediate', 'INT', 'Professional interactions'],
  [4, 'business', 'Advanced', 'ADV', 'Complex business scenarios'],
  [5, 'business', 'Expert', 'EXP', 'Executive-level communication']
];

for (const label of businessLevelLabels) {
  await db.runAsync(
    `INSERT OR IGNORE INTO level_labels (level_number, identity_id, display_title, badge_text, display_description) VALUES (?, ?, ?, ?, ?)`,
    label
  );
}
```

#### Étape 4 : Définir la Disponibilité des Modules

```typescript
// Dans init.ts, section "SEED MODULE_AVAILABILITY"
const businessModules = ['vocab', 'grammar', 'phrases', 'reading', 'conversation', 'assessment'];

// Tous les modules disponibles pour tous les niveaux
for (const moduleSlug of businessModules) {
  await db.runAsync(
    `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
    [moduleSlug, 'business', null, 1]  // null = tous les niveaux
  );
}
```

#### Étape 5 : Ajouter la Palette de Couleurs

```typescript
// Dans init.ts, section "SEED IDENTITY_PALETTES"
const businessPalette = [
  ['business', 0, '#1E3A8A'],  // Bleu marine
  ['business', 1, '#3B82F6'],  // Bleu clair
  ['business', 2, '#2563EB'],  // Bleu moyen
  ['business', 3, '#1D4ED8'],  // Bleu foncé
  ['business', 4, '#60A5FA'],  // Bleu très clair
  ['business', 5, '#93C5FD'],  // Bleu pastel
  ['business', 6, '#DBEAFE']   // Bleu très pastel
];

for (const palette of businessPalette) {
  await db.runAsync(
    `INSERT OR IGNORE INTO identity_palettes (identity_id, color_index, color_value) VALUES (?, ?, ?)`,
    palette
  );
}
```

#### Étape 6 : Ajouter les Niveaux dans la Table `levels`

```typescript
// Dans init.ts, section "SEED DES NIVEAUX"
const businessLevels = [
  [501, 1, 'Beginner', '🌱', 'Basic business communication', 'BEG', 'business', 'Beginner', 'Basic business communication', '🌱'],
  [502, 2, 'Elementary', '📊', 'Everyday business situations', 'ELE', 'business', 'Elementary', 'Everyday business situations', '📊'],
  [503, 3, 'Intermediate', '💼', 'Professional interactions', 'INT', 'business', 'Intermediate', 'Professional interactions', '💼'],
  [504, 4, 'Advanced', '🎯', 'Complex business scenarios', 'ADV', 'business', 'Advanced', 'Complex business scenarios', '🎯'],
  [505, 5, 'Expert', '🏆', 'Executive-level communication', 'EXP', 'business', 'Expert', 'Executive-level communication', '🏆']
];

for (const lvl of businessLevels) {
  await db.runAsync(
    `INSERT OR IGNORE INTO levels VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    lvl
  );
}
```

**C'est tout !** Aucune modification de code nécessaire. L'identité "Business English" est maintenant disponible.

---

## 📝 Exemples Concrets

### Exemple 1 : Module Disponible Uniquement pour un Niveau Spécifique

```typescript
// Module "Slang" uniquement pour le niveau 7 Adult
await db.runAsync(
  `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
  ['slang', 'adult', 7, 1]  // Disponible uniquement niveau 7
);
```

### Exemple 2 : Masquer un Module pour une Identité

```typescript
// Masquer "word_games" pour Adult
await db.runAsync(
  `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
  ['word_games', 'adult', null, 0]  // 0 = masqué pour tous les niveaux
);
```

### Exemple 3 : Module Disponible pour Plusieurs Niveaux Spécifiques

```typescript
// Module "advanced_grammar" pour niveaux 3 et 4 uniquement
await db.runAsync(
  `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
  ['advanced_grammar', 'lycee', 3, 1]
);
await db.runAsync(
  `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available) VALUES (?, ?, ?, ?)`,
  ['advanced_grammar', 'lycee', 4, 1]
);
```

---

## 🔧 Fonctions Disponibles

### Dans `queries.ts`

#### `getBrandingById(db, identityId)`
Récupère la configuration visuelle complète d'une identité.

#### `getModuleLabelWithFallback(db, moduleSlug, identityId)`
Récupère le label d'un module avec fallback automatique.

#### `getLevelLabelWithFallback(db, levelNumber, identityId)`
Récupère le label d'un niveau avec fallback automatique.

#### `getIdentityPalette(db, identityId)`
Récupère la palette de couleurs d'une identité.

#### `getAvailableModules(db, identityId, levelNumber)`
Récupère la liste des modules disponibles pour une identité/niveau (100% SQL).

### Dans `labelMapper.ts`

#### `getModuleLabel(moduleSlug, identityId, db)` (async)
Récupère le label d'un module.

#### `getLevelLabel(levelNumber, identityId, db)` (async)
Récupère le label d'un niveau.

#### `getAvailableModules(identityId, levelNumber, db)` (async)
Récupère les modules disponibles.

### Dans `moduleHelper.ts`

#### `getModuleColor(moduleSlug, identityId, db, availableModules)` (async)
Récupère la couleur d'un module basée sur sa position dans la palette.

#### `getModuleIcon(moduleSlug, identityId, db)` (async)
Récupère l'icône d'un module.

---

## ✅ Bonnes Pratiques

### 1. Ordre des Couleurs dans la Palette

Les couleurs sont assignées selon l'ordre des modules dans `module_availability` :
- Module à l'index 0 → `color_index 0` de la palette
- Module à l'index 1 → `color_index 1` de la palette
- etc.

**Conseil** : Organisez vos palettes avec des couleurs cohérentes et contrastées.

### 2. Fallback Automatique

Le système utilise automatiquement les valeurs par défaut si aucun label spécifique n'existe :
- `module_labels` → fallback vers `modules.display_title`
- `level_labels` → fallback vers `levels.display_title`

**Conseil** : Remplissez toujours les colonnes par défaut dans `modules` et `levels` pour un fallback propre.

### 3. Performance

Les index SQL sont déjà en place :
- `idx_modules_slug`
- `idx_module_labels_slug_identity`
- `idx_level_labels_level_identity`
- `idx_module_availability_slug_identity`

**Conseil** : Les requêtes sont optimisées, mais évitez de charger les labels un par un dans une boucle. Utilisez `Promise.all()`.

### 4. JSON dans les Colonnes

Certaines colonnes stockent du JSON :
- `ui_gradient_colors` : `'["#2C3E50","#000000"]'`
- `ai_solution_bg` : `'["#F3E5F5","#E1BEE7"]'`
- `daily_word_gradient` : `'["#2C3E50","#000000"]'`

**Conseil** : Utilisez `JSON.stringify()` lors de l'insertion et `JSON.parse()` lors de la lecture.

---

## 🎯 Résumé : Ce qui est en Place

### ✅ Architecture Complète

1. **5 Tables White Label** : `branding`, `module_labels`, `level_labels`, `identity_palettes`, `module_availability`
2. **Index SQL** : Performance optimisée
3. **Fallback Automatique** : Système robuste avec valeurs par défaut
4. **Queries Optimisées** : Toutes les fonctions nécessaires dans `queries.ts`

### ✅ Code Nettoyé

1. **`identities.ts` supprimé** : Plus de hardcoding
2. **`labelMapper.ts` transformé** : Utilise la DB
3. **`moduleHelper.ts` transformé** : Utilise la DB
4. **`ThemeContext.tsx` mis à jour** : Charge depuis la DB avec fallback

### ✅ Composants Adaptés

1. **`ExerciceSelectionScreen`** : Charge les modules depuis la DB
2. **`Dashboard`** : Charge les labels depuis la DB
3. **Tous les imports** : Corrigés vers `ThemeContext`

### 🎨 Pour Créer une Nouvelle Identité

**Uniquement des INSERT dans `init.ts` :**
1. INSERT dans `branding` (identité visuelle)
2. INSERT dans `module_labels` (labels des modules)
3. INSERT dans `level_labels` (labels des niveaux)
4. INSERT dans `identity_palettes` (palette de couleurs)
5. INSERT dans `module_availability` (disponibilité)
6. INSERT dans `levels` (niveaux avec target_audience)

**Aucune modification de code nécessaire !** 🎉

---

## 📚 Structure du Fichier `init.ts`

Le fichier `init.ts` est organisé en sections claires :

1. **Création des Tables** (avec index)
2. **SEED DES MODULES** (avec colonnes par défaut)
3. **SEED DES NIVEAUX** (avec colonnes par défaut)
4. **SEED BRANDING** (identités visuelles)
5. **SEED MODULE_LABELS** (labels par identité)
6. **SEED LEVEL_LABELS** (labels par identité)
7. **SEED IDENTITY_PALETTES** (palettes de couleurs)
8. **SEED MODULE_AVAILABILITY** (disponibilité)
9. **DONNÉE DE TEST** (content de test)

Chaque section est bien commentée et facile à étendre.

---

## 🚨 Points de Vigilance

1. **Ordre des Modules** : L'ordre dans `module_availability` détermine la couleur (via l'index de la palette)
2. **JSON Arrays** : N'oubliez pas `JSON.stringify()` lors des INSERT
3. **NULL vs Valeurs** : `level_number = NULL` signifie "tous les niveaux"
4. **Fallback** : Remplissez toujours les colonnes par défaut dans `modules` et `levels`

---

**L'architecture est prête pour la production !** 🚀
