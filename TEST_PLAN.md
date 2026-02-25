# Plan de Test — Joud

> Feuille de route complète pour la mise en place des tests de l'application.
> État au : février 2026 — Expo SDK 54 / Jest 30 / @testing-library/react-native 13

---

## 1. État Actuel

### Infrastructure disponible
| Outil | Version | État |
|-------|---------|------|
| Jest | 30.2.0 | ✅ Configuré |
| jest-expo | 54.0.0 | ✅ Installé |
| @testing-library/react-native | 13.3.3 | ✅ Installé |
| Mocks natifs | 5 fichiers | ✅ `src/__mocks__/` |
| CI/CD | — | ❌ Aucun pipeline |
| E2E (Maestro/Detox) | — | ❌ Non installé |

### Couverture actuelle (4 fichiers, ~226 lignes)
| Fichier | Ce qui est testé |
|---------|-----------------|
| `tokens.test.ts` | `withOpacity()` (hex → rgba) |
| `moduleConfig.test.ts` | `moduleHasSubfamilies()`, liste des 8 modules |
| `logUtils.test.ts` | Niveaux de log (info/warn/debug/error) |
| `feedback.test.ts` | `generateFeedbackMessage()` — correct / skip / retry |

### Ce qui n'est pas testé
- ❌ Hooks (20+) — zéro test
- ❌ Contextes (ProgressContext, UserContext, AIContext, CurrentLevelContext)
- ❌ Composants React Native (LevelCard, WordCard, ExerciceNavBar…)
- ❌ Écrans (26+ screens)
- ❌ Requêtes SQLite (`queries.ts`)
- ❌ Migrations de base de données
- ❌ Flux utilisateur complets (E2E)

---

## 2. Pyramide de Test

```
          ▲
         /E2E\          Phase 4 — Maestro (2–4 flux critiques)
        /------\
       /Intégra-\       Phase 3 — Contextes + composants composés
      /  tion    \
     /------------\
    / Composants   \    Phase 2 — @testing-library/react-native
   /----------------\
  / Unitaires        \  Phase 1 — Jest pur (hooks, utils, DB queries)
 /____________________\
```

**Règle :** 70% unitaires → 20% composants/intégration → 10% E2E

---

## 3. Phase 1 — Tests Unitaires (Jest pur)

> Objectif : couvrir toute la logique métier sans rendu React.
> Durée estimée : 3–4 jours
> Dossier cible : `src/**/__tests__/`

### 3.1 Base de données — `src/database/__tests__/`

#### `queries.test.ts`
Tester `upsertProgress` avec un mock `expo-sqlite` (déjà disponible).

```ts
// Ce qu'il faut vérifier :
- upsertProgress() écrit bien dans la table progress (INSERT OR REPLACE)
- Les valeurs family_id, subfamily_id, level, completed, total, score sont correctes
- upsertProgress() avec subfamily_id = 0 (modules sans sous-famille)
- upsertProgress() avec composite key "3-2" (vocab avec sous-famille)
- Comportement sur DB null (doit rater silencieusement ou throw)
```

#### `parseCompositeKey.test.ts` (extraire la fonction de ProgressContext)
```ts
// Cas à couvrir :
- "42"      → { familyId: 42, subfamilyId: 0 }
- "3-7"     → { familyId: 3, subfamilyId: 7 }
- "0-0"     → { familyId: 0, subfamilyId: 0 }  — doit être ignoré en sync
- "abc"     → NaN → ignoré
- ""        → NaN → ignoré
```

### 3.2 Hooks utilitaires — `src/hooks/__tests__/`

#### `usePreferences.test.ts`
```ts
// Environnement : renderHook() avec mock AsyncStorage
- Valeurs par défaut : soundEnabled=true, hapticsEnabled=true
- updatePref('soundEnabled', false) → persiste dans AsyncStorage
- Rechargement : lit les valeurs stockées au mount
- Valeurs corrompues en storage → fallback vers defaults
```

#### `useFirstIncompleteIndex.test.ts`
```ts
// Logique critique : trouver l'index de reprise dans un exercice
- Retourne 0 si pas de progress
- Retourne l'index suivant le dernier complété
- Retourne 0 si tout est complété (recommencer depuis le début)
- Ne plante pas sur familyId null ou undefined
```

#### `useSafeAction.test.ts` / `useSafeNavigation.test.ts`
```ts
- L'action est appelée correctement
- Les erreurs sont catchées (ne remontent pas)
- useSafeNavigation ne plante pas si router non disponible
```

### 3.3 ProgressContext — logique pure

Extraire en fonctions pures testables :

```ts
// src/contexts/__tests__/progressUtils.test.ts
- createInitialProgress() → 8 niveaux × 8 modules = structure correcte
- getLevelProgress() avec données partielles → calcul correct
- getFamilyProgress() avec completed=0, total=10 → 0%
- getFamilyProgress() avec completed=10, total=10 → 100%
- getExerciseProgress() — moyenne sur toutes les familles
- filterRevisionFamilies() → retourne seulement les familles avec completed > 0
```

### 3.4 Migrations — smoke tests

```ts
// src/database/__tests__/migrations.test.ts
// Avec un mock SQLite in-memory (better-sqlite3 en node env)
- Chaque migration s'exécute sans erreur
- Les tables attendues existent après init
- INSERT OR IGNORE ne duplique pas les données
```

---

## 4. Phase 2 — Tests de Composants

> Objectif : tester les composants UI critiques avec rendu réel.
> Outil : `@testing-library/react-native` + providers mockés
> Durée estimée : 4–5 jours
> Dossier cible : `src/components/**/__tests__/`, `src/screens/**/__tests__/`

### Setup préalable — Wrapper de providers

Créer `src/__tests__/utils/renderWithProviders.tsx` :

```tsx
// Wrapper qui injecte tous les contextes mockés
const renderWithProviders = (ui: React.ReactElement, options?: {...}) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <MockUserProvider>
        <MockThemeProvider>
          <MockProgressProvider>
            {children}
          </MockProgressProvider>
        </MockThemeProvider>
      </MockUserProvider>
    ),
    ...options
  });
};
```

### 4.1 Composants de base — `src/components/__tests__/`

#### `ExerciceNavBar.test.tsx`
```
✓ Affiche le bouton retour si onBack fourni
✓ N'affiche pas le bouton retour si onBack absent
✓ Affiche le badge niveau si showBadge=true et levelTitle fourni
✓ onBack() est appelé au press
✓ onRightIconPress() est appelé au press
```

#### `WordCard.test.tsx`
```
✓ Mode normal : affiche mot + traduction + exemple
✓ Mode fastvocab (isFastMode=true) : affiche mot + traduction SANS exemple
✓ Bouton "Suivant" déclenche onNext()
✓ Carte se retourne au press (flip animation ne plante pas)
```

#### `LevelCard.test.tsx`
```
✓ Affiche le numéro de niveau
✓ Affiche le bon pourcentage de progression
✓ Lock visible si isLocked=true
✓ onPress() appelé si non-locked
✓ onPress() ignoré si locked
```

### 4.2 Écran Settings — `app/(tabs)/__tests__/settings.test.tsx`

```
✓ Affiche les initiales de l'utilisateur dans l'avatar
✓ Tap sur le nom → TextInput visible
✓ Submit TextInput → updateUser() appelé avec la valeur
✓ Switch Sons → updatePref('soundEnabled', false) appelé
✓ Switch Vibrations → updatePref('hapticsEnabled', false) appelé
✓ Press "Réinitialiser la progression" → Alert affiché
✓ Confirm Alert → resetProgress() appelé
✓ Cancel Alert → resetProgress() NON appelé
✓ Press "Configuration IA" → router.push('/settings-ai') appelé
✓ Chips audience → updateAudience('primary') appelé
```

### 4.3 ExerciseSelection Screen

```
✓ Affiche la liste des modules disponibles pour le niveau
✓ Modules non disponibles sont désactivés / absents
✓ getExerciseProgress() retourne bien le % par module
✓ Press sur un module → navigation correcte
```

### 4.4 VocabularyExerciseScreen (test d'intégration)

```
✓ Charge les mots depuis useExerciseContent (mock)
✓ trackItemCompletion() appelé à chaque "Next"
✓ saveProgressNow() appelé à la fin (handleFinish)
✓ Dernier mot → affiche écran de fin
✓ Reprend à l'index correct (useFirstIncompleteIndex)
```

---

## 5. Phase 3 — Tests de Contextes

> Objectif : tester les contextes avec leur vraie logique (pas mockés).
> Outil : `renderHook()` + mock des dépendances natives
> Durée estimée : 2–3 jours

### 5.1 ProgressContext — `src/contexts/__tests__/ProgressContext.test.tsx`

```ts
// Setup : mock expo-sqlite + mock AsyncStorage
✓ Charge depuis SQLite au mount (si rows disponibles)
✓ Fallback vers AsyncStorage si SQLite vide
✓ trackItemCompletion() met à jour le state correctement
✓ saveProgressNow() appelle upsertProgress pour chaque entry
✓ resetProgress() → DELETE FROM progress + removeItem + state vide
✓ getLevelProgress() → 0 si aucune progression
✓ getLevelProgress() → moyenne correcte sur 8 modules
✓ refreshProgress() recharge depuis SQLite
✓ Auto-save (debounce 1500ms) → AsyncStorage.setItem appelé
✓ Migration "sentences" → "phrase_types" fonctionne sur ancien storage
```

### 5.2 UserContext — `src/contexts/__tests__/UserContext.test.tsx`

```ts
✓ Charge le profil depuis AsyncStorage au mount
✓ Premier lancement → DEFAULT_USER
✓ updateAudience('lycee') → persiste dans AsyncStorage
✓ updateUser({ firstName: 'Marie' }) → met à jour + isOnboarded=true
✓ Migration isOnboarded pour anciens profils
```

---

## 6. Phase 4 — Tests E2E (Maestro)

> Outil recommandé : **Maestro** (plus simple que Detox pour Expo, pas de recompilation)
> Durée estimée : 2–3 jours (setup + 4 flows)
> Dossier : `e2e/`

### Installation

```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Flows dans e2e/*.yaml
```

### Flow 1 — Onboarding complet `e2e/onboarding.yaml`

```yaml
appId: com.joud.app
---
- launchApp:
    clearState: true
- assertVisible: "Bienvenue"
- tapOn: "Primaire"
- tapOn: "Continuer"
- inputText:
    id: "firstName"
    text: "Alice"
- tapOn: "Commencer"
- assertVisible: "Dashboard"
- assertVisible: "Alice"
```

### Flow 2 — Exercice Vocab + progression `e2e/vocab_exercise.yaml`

```yaml
appId: com.joud.app
---
- launchApp
- tapOn: "Vocabulaire"
- tapOn: "Colors"  # famille
- tapOn: "Basic Colors"  # sous-famille
- assertVisible: "Red"
- tapOn: "Suivant"
- tapOn: "Suivant"
- tapOn: "Terminer"
- assertVisible: "Résumé"
# Retour → vérifier que le % a changé
- tapOn: "Retour"
- assertVisible:
    text: "Colors"
- assertNotVisible: "0%"
```

### Flow 3 — Reset progression `e2e/reset_progress.yaml`

```yaml
appId: com.joud.app
---
- launchApp
- tapOn: "Réglages"
- tapOn: "Réinitialiser la progression"
- assertVisible: "Cette action est irréversible"
- tapOn: "Réinitialiser"
# Retour Dashboard → tout à 0
- tapOn: "Accueil"
- assertVisible: "0%"
```

### Flow 4 — Changement d'audience `e2e/audience_switch.yaml`

```yaml
appId: com.joud.app
---
- launchApp
- tapOn: "Réglages"
- tapOn: "Adulte"
# Retour → modules adulte visibles
- tapOn: "Accueil"
- assertVisible: "Fast Vocab"
- assertVisible: "Connector"
```

---

## 7. Organisation des Fichiers de Test

```
Joud/
├── e2e/                              # Tests E2E Maestro
│   ├── onboarding.yaml
│   ├── vocab_exercise.yaml
│   ├── reset_progress.yaml
│   └── audience_switch.yaml
│
└── src/
    ├── __tests__/
    │   └── utils/
    │       └── renderWithProviders.tsx   # Helper partagé
    │
    ├── config/__tests__/
    │   └── moduleConfig.test.ts          # ✅ Existant
    │
    ├── contexts/__tests__/
    │   ├── ProgressContext.test.tsx      # ← Phase 3
    │   └── UserContext.test.tsx          # ← Phase 3
    │
    ├── database/__tests__/
    │   ├── queries.test.ts               # ← Phase 1
    │   ├── parseCompositeKey.test.ts     # ← Phase 1
    │   └── migrations.test.ts            # ← Phase 1
    │
    ├── hooks/__tests__/
    │   ├── usePreferences.test.ts        # ← Phase 1
    │   ├── useFirstIncompleteIndex.test.ts
    │   └── useSafeAction.test.ts
    │
    ├── screens/
    │   ├── ExerciceSelectionScreen/__tests__/
    │   │   └── ExerciceSelectionScreen.test.tsx   # ← Phase 2
    │   └── VocabularyScreen/__tests__/
    │       └── VocabularyExerciceScreen.test.tsx  # ← Phase 2
    │
    ├── components/__tests__/
    │   ├── ExerciceNavBar.test.tsx        # ← Phase 2
    │   ├── WordCard.test.tsx              # ← Phase 2
    │   └── LevelCard.test.tsx            # ← Phase 2
    │
    ├── themes/__tests__/
    │   └── tokens.test.ts                # ✅ Existant
    │
    └── utils/__tests__/
        ├── feedback.test.ts              # ✅ Existant
        └── logUtils.test.ts              # ✅ Existant
```

---

## 8. Roadmap et Priorisation

### Critères de priorité
- 🔴 **Critique** : logique métier centrale, régression catastrophique si cassé
- 🟡 **Important** : UX visible, corrections fréquentes
- 🟢 **Nice-to-have** : couverture supplémentaire

### Roadmap par sprint

| Sprint | Durée | Contenu | Priorité |
|--------|-------|---------|----------|
| **S1** | 3j | `parseCompositeKey`, `queries.ts`, `usePreferences`, `useFirstIncompleteIndex` | 🔴 |
| **S2** | 3j | ProgressContext (trackItem, reset, getLevelProgress, refreshProgress) | 🔴 |
| **S3** | 3j | UserContext + renderWithProviders + Settings screen (Alert, switches) | 🟡 |
| **S4** | 3j | WordCard (fast mode), ExerciceNavBar, LevelCard | 🟡 |
| **S5** | 2j | Setup Maestro + flows onboarding + vocab exercise | 🔴 |
| **S6** | 2j | Flows E2E reset + audience switch | 🟡 |
| **S7** | 2j | ExerciceSelectionScreen, VocabularyExerciceScreen | 🟢 |
| **S8** | 2j | CI GitHub Actions (lint + jest + couverture) | 🟢 |

**Total estimé : ~20 jours dev (à temps partiel)**

---

## 9. Seuils de Couverture Cibles

```js
// jest.config.js — à ajouter après Phase 1 et 2
coverageThreshold: {
  global: {
    branches: 60,
    functions: 70,
    lines: 70,
    statements: 70,
  },
  // Critique : logique de progression
  './src/contexts/ProgressContext.tsx': {
    functions: 90,
    lines: 90,
  },
  './src/database/queries.ts': {
    functions: 85,
    lines: 85,
  },
}
```

---

## 10. CI/CD — GitHub Actions (Phase finale)

Créer `.github/workflows/test.yml` :

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4  # optionnel
```

---

## 11. Règles à Appliquer

1. **Chaque nouveau hook** → un fichier `__tests__/*.test.ts` en parallèle
2. **Chaque nouveau contexte** → test du reducer + des callbacks
3. **Chaque bug fixé** → ajouter un test qui reproduit et prouve le fix
4. **Pas de test de snapshot** pour les composants (trop fragiles) → tests comportementaux
5. **Mocks SQLite** : utiliser le mock existant dans `src/__mocks__/expo-sqlite.ts`
6. **Ne pas tester l'implémentation** (détails internes) → tester le comportement observable

---

*Document généré le 25 février 2026 — à mettre à jour après chaque sprint*
