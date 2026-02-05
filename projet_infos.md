# Joud — Avancement du projet

*Mis à jour : 2026-02-05*

---

## 1. Vue générale

**Joud** est une application d'apprentissage du français anglais, construite sur **Expo (React Native)** avec une architecture **White Label** permettant de déployer 4 identités visuelles distinctes depuis une seule base de code.

| Technologie | Détail |
|---|---|
| Framework | Expo (React Native) |
| Router | Expo Router (file-based) |
| Base de données | SQLite via expo-sqlite |
| Theming | White Label — 4 identités (primary, college, lycee, adult) |
| Langage | TypeScript — 100% de `src/` en `.ts` / `.tsx` |
| Migrations | 26 migrations (001 → 026) |

---

## 2. Architecture

```
app/                        → Routes Expo Router (12 fichiers)
src/
  contexts/                 → Contextes globaux (4)
    ProgressContext.tsx     → Progression des exercices (AsyncStorage)
    UserContext.tsx         → Profil utilisateur
    CurrentLevelContext.tsx → Niveau actif
    AIContext.tsx           → État du Coach IA
  database/                 → SQLite : schema, queries, init, migrations/
  hooks/                    → Hooks métier (18 fichiers)
    exercises/              → Logique commune aux exercices (9 hooks)
    dashboard/              → Données du dashboard (3 hooks)
    familySelection/        → Sélection famille avec progrès
    subFamilySelection/     → Sélection sous-famille
    revision/               → Logique de révision
  screens/                  → Écrans de l'app (~40 fichiers)
  components/               → Composants réutilisables
    pedagogy/               → Cartes d'exercice (21 composants)
    common/                 → ExerciseValidation, ExerciseProgressBar, ...
    layout/                 → ExerciseHeader, ExerciseLayout, ...
    flow/                   → FlowCard (carte générique avec progrès)
  themes/                   → ThemeContext, tokens, colors
  utils/                    → Utilitaires (feedback, constants, ...)
```

### Système de progression

Toute la progression est centralisée dans **ProgressContext** (AsyncStorage).

- Clé : `JOUDPRIMARY_PROGRESS`
- Structure : `progress.level{N}.{exerciseType}.{familyId}` → `{ completed, total, lastReviewed }`
- Slugs d'exercice : `vocab`, `grammar`, `sentences`, `reading`, `dialogues`, `word_games`
- ID famille composite (quand sous-famille existe) : `"familyId-subfamilyId"` (ex. `"1-1"`)
- Fonctions principales : `trackItemCompletion`, `getFamilyProgress`, `getExerciseProgress`, `getLevelProgress`

---

## 3. Modules d'exercice

| Module | Screen | Carte(s) | Slug | Statut |
|---|---|---|---|---|
| Vocabulaire | VocabularyExerciceScreen | WordCard | `vocab` | Stable — pattern de référence |
| Grammaire | GrammarExerciseScreen | GrammarCard | `grammar` | Stable |
| Phrases | SentenceExerciceScreen | SentenceCard, SentenceBlanksCard | `sentences` | Stable — progression corrigée cette session |
| Lecture | ReadingExerciseScreen | ReadingCard | `reading` | Stable — SQL supprimé, ProgressContext cette session |
| Dialogues | DialogueExerciseScreen | DialogueCard | `dialogues` | Stable |
| Jeux de mots | WordGamesExerciseScreen | SpeedMatch, Definition, Blanks, Detective, Idioms, SyntaxMaster | `word_games` | Stable |
| Connecteur | ConnectorExerciseScreen | LogicLinks, SentenceFusion, Rephrasing | `connector` | Stable |
| Révision | RevisionScreen | RevisionQuestionCard | — | Mode spécial (sélection → session → summary) |

### Coach IA

| Écran | Rôle |
|---|---|
| AITutorSelectionScreen | Choix du mode (free / guided) |
| AITutorFreeScreen | Chat libre avec l'IA |
| AITutorGuidedScreen | Analyse des erreurs enregistrées par `useRecordError` |

Les erreurs sont enregistrées en temps réel dans la table `exercise_errors` (migration 024) à chaque réponse incorrecte dans tous les modules.

### Évaluation

| Écran | Rôle |
|---|---|
| OrchestratorScreen | Tableau de maîtrise — score global par module via `getExerciseProgress` |
| AssessmentScreen | Quiz d'évaluation |
| AssessmentResultsScreen | Résultats avec analyse par compétence |

---

## 4. White Label

L'application supporte 4 identités visuelles chargées depuis la base de données (`whitelabel` table).

- Toutes les couleurs d'interface passent par `identity.*` (via `useTheme()`)
- Aucune couleur hardcoded dans `src/` hors des fallbacks de `ThemeContext.tsx`
- Tokens centralisés dans `src/themes/tokens.ts` (spacing, radius, shadows, typography)
- Couleurs de base dans `src/themes/colors.ts` (palette universelle + getLevelColor / getLevelGradient)

---

## 5. Base de données — migrations

| Plage | Contenu |
|---|---|
| 001–003 | Schema initial, white label, modules |
| 004–005 | Familles, sous-familles |
| 006–008 | Contenu : vocab, assessment, word games |
| 009–010 | Feedback messages, données dashboard |
| 011 | target_audience sur le contenu |
| 012–017 | Contenu : fast vocab, phrases, dialogues, grammar, reading, connector |
| 017b | Seed white label |
| 018–022 | Ajout subfamily_id au contenu + seeds par module |
| 023 | Fix activity_log family_id |
| 024 | Table exercise_errors (Coach IA) |
| 025 | Table chat_conversations (Coach IA free) |
| 026 | Table vocabulary_seen |

---

## 6. Ce qui a été fait — cette session

### Progression (3 fichiers)
- `ProgressContext.tsx` : renommage `phrase_types` → `sentences`
- `SentenceExerciceScreen.tsx` : wiring complet (params, tracking, reprise, progress bar)
- `ReadingExerciseScreen.tsx` : suppression du INSERT SQL direct, ajout du filtre subfamily, ExerciseProgressBar

### White Label (4 fichiers)
- `SentenceBlanksCard.tsx` : 3× `#F44336` → `identity.aiDiagnostic.error`
- `AssessmentResultsScreen` : couleurs de score → `identity.palette`
- `LogicLinksCard` : default mort `#3B82F6` supprimé, brandColor via identity
- `SentenceFusionCard` : default mort `#10B981` supprimé

### Migration JS → TS (8 fichiers, 0 JS restant)
- 4 supprimés : DialogueCard/index.js, DialogueCard/style.js, DialogueExerciseScreen.js, AITutor/index.js
- 2 renommés : style.js → style.ts (AssessmentResultsScreen, OrchestratorScreen)
- 2 convertis : index.js → index.tsx (AssessmentResultsScreen, OrchestratorScreen)

### Bugs fixés en passant
- `SentenceExerciceScreen` : référence stale `levelId` → `dashboardLevelId`
- `OrchestratorScreen` : `getFamilyProgress(2 args)` → `getExerciseProgress` (retournait toujours 0)
- `OrchestratorScreen` : `safeNavigateToAssessment.navigate(numLevel)` → arg capturé dans closure

---

## 7. État actuel

| Indicateur | Valeur |
|---|---|
| Fichiers `.js` dans `src/` | 0 |
| Diagnostics TS en erreur | 0 |
| Modules avec progression fonctionnelle | 6/6 (vocab, grammar, sentences, reading, dialogues, word_games) |
| White label clean | Oui — zéro couleur hardcoded hors ThemeContext |
| Coach IA | Fonctionnel — erreurs enregistrées en temps réel, analyse guidée |
| Migrations | 26 — cohérentes |
