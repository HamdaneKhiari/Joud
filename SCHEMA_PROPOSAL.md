# 📋 Proposition de Schéma SQL - Architecture White Label

## 🎯 Objectif
Permettre la création de nouvelles identités (Business English, Espagnol Débutant, etc.) **uniquement via des INSERT dans init.ts**, sans modifier le code.

---

## 📊 Structure des Tables

### 1. Table `branding` - Identités Visuelles
Stocke toutes les configurations visuelles par identité.

```sql
CREATE TABLE IF NOT EXISTS branding (
  id TEXT PRIMARY KEY,                    -- 'primary', 'college', 'lycee', 'adult', 'business', etc.
  
  -- Couleurs principales
  primary_color TEXT NOT NULL,            -- '#FFCE00'
  accent_color TEXT NOT NULL,             -- '#FF5722'
  surface_color TEXT,                     -- Couleur de surface (nouveau)
  
  -- Branding général
  logo_name TEXT,                         -- Nom du logo/icône
  theme_mode TEXT DEFAULT 'light',        -- 'light' | 'dark'
  
  -- UI Configuration
  ui_has_gradient INTEGER DEFAULT 0,      -- 0 = false, 1 = true
  ui_gradient_colors TEXT,                -- JSON array: '["#2C3E50","#000000"]'
  ui_card_radius INTEGER DEFAULT 12,      -- 8, 12, 20, 24
  ui_show_decorative_shapes INTEGER DEFAULT 1, -- 0 = false, 1 = true
  
  -- AI Colors
  ai_accent_color TEXT,
  ai_error_color TEXT,
  ai_solution_bg TEXT,                   -- JSON array: '["#F3E5F5","#E1BEE7"]'
  
  -- Header Configuration
  header_bg_color TEXT NOT NULL,
  header_accent_color TEXT NOT NULL,
  header_emoji TEXT,                      -- '🎈', '🚀', '🎓', '💼'
  header_welcome_text TEXT,               -- 'Salut,', 'Ready,', 'Welcome,', 'Bonjour,'
  
  -- Daily Word Card
  daily_word_bg_color TEXT,               -- NULL si gradient utilisé
  daily_word_gradient TEXT,               -- JSON array ou NULL
  daily_word_decoration TEXT DEFAULT 'none', -- 'circles' | 'water-drop' | 'none'
  
  -- Dashboard
  dashboard_level_progress_color TEXT NOT NULL,
  
  -- Text Colors
  text_on_main_color TEXT NOT NULL
);
```

---

### 2. Table `module_labels` - Labels de Modules par Identité
Permet d'avoir des titres/descriptions différents selon l'identité.

```sql
CREATE TABLE IF NOT EXISTS module_labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_slug TEXT NOT NULL,              -- FK vers modules.slug
  identity_id TEXT NOT NULL,              -- FK vers branding.id
  display_title TEXT NOT NULL,            -- 'Mes Premiers Mots' (primary) vs 'Vocabulaire' (college)
  display_description TEXT NOT NULL,       -- 'Apprends des nouveaux mots'
  icon_name TEXT NOT NULL,                -- 'book-alphabet'
  
  UNIQUE(module_slug, identity_id),
  FOREIGN KEY (module_slug) REFERENCES modules(slug),
  FOREIGN KEY (identity_id) REFERENCES branding(id)
);
```

**Note** : Si un module n'a pas de label pour une identité, on utilise les colonnes par défaut de `modules`.

---

### 3. Table `level_labels` - Labels de Niveaux par Identité
Permet d'avoir des titres/badges différents selon l'identité.

```sql
CREATE TABLE IF NOT EXISTS level_labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level_number INTEGER NOT NULL,          -- 1, 2, 3, 4, 5, 6, 7
  identity_id TEXT NOT NULL,              -- FK vers branding.id
  display_title TEXT NOT NULL,            -- 'La Découverte' (primary) vs 'Foundations' (lycee)
  badge_text TEXT NOT NULL,               -- 'DÉCOUVERTE', 'FOUNDATIONS', 'N1'
  display_description TEXT NOT NULL,      -- 'Premier pas dans l'apprentissage'
  
  UNIQUE(level_number, identity_id),
  FOREIGN KEY (identity_id) REFERENCES branding(id)
);
```

**Note** : Si un niveau n'a pas de label pour une identité, on utilise les colonnes par défaut de `levels`.

---

### 4. Table `identity_palettes` - Palettes de Couleurs par Identité
Stocke les palettes de couleurs pour les modules (ordre important).

```sql
CREATE TABLE IF NOT EXISTS identity_palettes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identity_id TEXT NOT NULL,              -- FK vers branding.id
  color_index INTEGER NOT NULL,           -- 0, 1, 2, 3, 4, 5, 6 (position dans la palette)
  color_value TEXT NOT NULL,              -- '#FF5722'
  
  UNIQUE(identity_id, color_index),
  FOREIGN KEY (identity_id) REFERENCES branding(id)
);
```

**Usage** : Pour obtenir la couleur d'un module, on utilise `color_index` basé sur l'ordre du module dans la liste.

---

### 5. Table `module_availability` - Disponibilité des Modules par Identité/Niveau
Remplace la logique hardcodée de `getAvailableModules()`.

```sql
CREATE TABLE IF NOT EXISTS module_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_slug TEXT NOT NULL,              -- FK vers modules.slug
  identity_id TEXT NOT NULL,              -- FK vers branding.id
  level_number INTEGER,                   -- NULL = disponible pour tous les niveaux
  is_available INTEGER DEFAULT 1,        -- 0 = non disponible, 1 = disponible
  
  UNIQUE(module_slug, identity_id, level_number),
  FOREIGN KEY (module_slug) REFERENCES modules(slug),
  FOREIGN KEY (identity_id) REFERENCES branding(id)
);
```

**Logique** :
- Si `level_number IS NULL` : module disponible pour tous les niveaux de cette identité
- Si `level_number = 7` : module disponible uniquement pour le niveau 7
- Si `is_available = 0` : module masqué pour cette combinaison

**Exemple** :
- `('fast_vocab', 'adult', NULL, 1)` → FastVocab disponible pour tous les niveaux Adult
- `('fast_vocab', 'college', NULL, 0)` → FastVocab masqué pour College
- `('vocab', 'adult', 7, 1)` → Vocab disponible pour le niveau 7 Adult
- `('fast_vocab', 'adult', 7, 0)` → FastVocab masqué pour le niveau 7 Adult

---

### 6. Modifications aux Tables Existantes

#### Table `modules` - Ajouter colonnes par défaut
```sql
ALTER TABLE modules ADD COLUMN display_title TEXT;
ALTER TABLE modules ADD COLUMN display_description TEXT;
ALTER TABLE modules ADD COLUMN icon_name TEXT;
```

**Usage** : Si `module_labels` n'a pas d'entrée pour une identité, on utilise ces valeurs par défaut.

#### Table `levels` - Ajouter colonnes par défaut
```sql
ALTER TABLE levels ADD COLUMN display_title TEXT;
ALTER TABLE levels ADD COLUMN display_description TEXT;
ALTER TABLE levels ADD COLUMN icon_name TEXT;
```

**Usage** : Si `level_labels` n'a pas d'entrée pour une identité, on utilise ces valeurs par défaut.

---

## 🔄 Logique de Résolution

### Pour un Module :
1. Chercher dans `module_labels` avec `(module_slug, identity_id)`
2. Si trouvé → utiliser ces valeurs
3. Sinon → utiliser `modules.display_title`, `modules.display_description`, `modules.icon_name`

### Pour un Niveau :
1. Chercher dans `level_labels` avec `(level_number, identity_id)`
2. Si trouvé → utiliser ces valeurs
3. Sinon → utiliser `levels.display_title`, `levels.display_description`, `levels.icon_name`

### Pour les Modules Disponibles :
```sql
SELECT DISTINCT m.slug
FROM modules m
INNER JOIN module_availability ma ON m.slug = ma.module_slug
WHERE ma.identity_id = ?
  AND ma.is_available = 1
  AND (ma.level_number = ? OR ma.level_number IS NULL)
ORDER BY m.order_index;
```

---

## ✅ Avantages de ce Schéma

1. **100% White Label** : Créer une nouvelle identité = INSERT dans `branding` + `module_labels` + `level_labels` + `module_availability`
2. **Flexibilité** : Labels différents par identité sans duplication de modules
3. **Pas de Hardcoding** : Toute la logique métier devient des requêtes SQL
4. **Extensibilité** : Facile d'ajouter de nouvelles propriétés (ex: `branding.font_family`)
5. **Performance** : Index sur les clés étrangères pour des requêtes rapides

---

## 📝 Exemple : Créer "Business English"

```sql
-- 1. Créer l'identité visuelle
INSERT INTO branding (id, primary_color, accent_color, ...) 
VALUES ('business', '#1E3A8A', '#3B82F6', ...);

-- 2. Ajouter les labels de modules
INSERT INTO module_labels (module_slug, identity_id, display_title, ...)
VALUES 
  ('vocab', 'business', 'Business Vocabulary', ...),
  ('grammar', 'business', 'Professional Grammar', ...);

-- 3. Ajouter les labels de niveaux
INSERT INTO level_labels (level_number, identity_id, display_title, ...)
VALUES 
  (1, 'business', 'Beginner', 'BEG', ...);

-- 4. Définir la disponibilité des modules
INSERT INTO module_availability (module_slug, identity_id, level_number, is_available)
VALUES 
  ('vocab', 'business', NULL, 1),
  ('grammar', 'business', NULL, 1);

-- 5. Ajouter la palette de couleurs
INSERT INTO identity_palettes (identity_id, color_index, color_value)
VALUES 
  ('business', 0, '#1E3A8A'),
  ('business', 1, '#3B82F6'),
  ...
```

**Résultat** : Aucune modification de code nécessaire ! 🎉
