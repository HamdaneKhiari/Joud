# Architecture du projet Joud Primary

## Routing : Expo Router (`app/`)

Toutes les routes sont définies dans `app/`. Un fichier `.tsx` = une route.
Layouts dans `_layout.tsx` à chaque niveau.

## Pipeline data : Excel → JSON → SQLite

Le contenu pédagogique vit dans des fichiers Excel à la racine du projet :
- `data_english.xlsx` — vocabulaire principal
- `CORE_800_WORDS_JOUD.xlsx` — dataset 800 mots
- `The_Oxford_3000.pdf` — source pour Oxford list

Ces fichiers sont convertis en JSON par des scripts Node :
- `convert_excel_to_my_words.js` → produit `my_words.json`
- `convert_oxford_pdf.js` → produit `oxford_list.json`

Les JSON sont ensuite seedés dans la table SQLite `content` via les migrations
de `src/database/migrations_v2/`. Le format JSON inséré dans la colonne `data`
est strictement défini par `data_formats.json` (file racine).

À l'exécution, l'app NE LIT JAMAIS les fichiers JSON ou Excel : elle interroge
uniquement la base SQLite.

## Code applicatif : `src/`

### Écrans (`src/screens/`)
- `VocabularyScreen/VocabularyExerciceScreen.tsx` — exercice de vocabulaire
- `VocabularyScreen/schema.ts` — types/schemas du vocab
- `SentenceScreen/SentenceExerciceScreen.tsx` — exercice de construction de phrases
- `Dashboard/` — tableau de bord utilisateur (4 levels du Dashboard)
- `FamilySelectionScreen/` — sélection d'une famille (1 à 11)
- `SubFamilySelectionScreen/` — sélection d'une sous-famille
- `ExerciceSelectionScreen/` — choix du type d'exercice
- `ConnectorScreen/`, `DialoguesScreen/`, `GrammarScreen/`, `ReadingScreen/`,
  `RevisionScreen/`, `WordGames/` — autres modules
- `Onboarding/` — écran d'accueil
- `AITutor/`, `SettingsAIScreen.tsx` — features IA
- `screens/components/` — composants partagés entre écrans

### Hooks (`src/hooks/`)
- `exercises/useExerciseContent.ts` — chargement du contenu depuis SQLite
- `exercises/useExerciceValidationState.ts` — état de validation
- `exercises/useExerciseActivity.ts` — tracking activité
- `exercises/useExerciseSaveOnUnmount.ts` — persistence à la sortie
- `exercises/useFeedbackMessages.ts` — messages feedback
- `exercises/useFirstIncompleteIndex.ts` — reprise au bon endroit
- `exercises/useRecordError.ts` — log des erreurs utilisateur
- `exercises/useRecordWordSeen.ts` — log des mots vus
- `dashboard/`, `revision/`, `familySelection/`, `subFamilySelection/`
- À la racine : `useAISettings.ts`, `useGetFamiliesByModule.ts`,
  `useLastActivity.ts`, `usePreferences.ts`, `useSafeAction.ts`,
  `useSafeNavigation.ts`

### Database (`src/database/`)
- `index.ts` — point d'entrée DB
- `init.ts` — initialisation au démarrage
- `queries.ts` — toutes les requêtes SQL (~25 KB)
- `schema.ts` — schéma SQLite
- `migrations_v2/` — migrations actives (les 39 fichiers legacy ont été
  consolidés ici)
- `mappers/` — conversion DB ↔ types TypeScript
- `seeds/` — seed initial
- `dataExcel/`, `script/` — pipeline Excel → DB

### Données (`src/data/`)
- `FAMILLE_01_THE_GLUE.md` à `FAMILLE_11_PRECISION.md` — spec des 11 familles
- `CORE_800_WORDS_JOUD.xlsx` — dataset (copie locale)
- `COLLEGE_ENRICHISSEMENTS_01_08.md` — enrichissements College
- Sous-dossiers `vocabulary/`, `sentences/`, etc. : actuellement vides

### Autres dossiers de `src/`
- `components/` — composants UI génériques (Button, Card, etc.)
- `contexts/` — Providers React (ProgressContext, ThemeContext)
- `services/` — logique non-React (audio, TTS via expo-speech)
- `themes/` — système de thème (couleurs, polices)
- `styles/` — styles transverses
- `types/` — types TypeScript partagés
- `utils/` — helpers et fonctions pures
- `config/` — configuration par feature/niveau
- `__tests__/` — tests jest-expo (~70% coverage)
- `__mocks__/` — mocks pour les tests

## Conventions

- TypeScript strict (max-warnings 0 sur lint)
- ESLint v9 obligatoire avant commit
- Pas de state global : useState/useContext local au cas par cas
- Styles via twrnc (`tw\`p-4 bg-white\``), jamais StyleSheet.create
- Icônes via lucide-react-native
- Polices Google Fonts via @expo-google-fonts (DM Sans, Nunito, Poppins)

## Conventions de nommage critiques (voir ARCHITECTURE_DONNEES.md)

- `identity.id` : 'primary' | 'college' | 'lycee' | 'adult' (jamais juste `app`)
- `dashboardLevelId` : 1-4 (jamais juste `level`)
- `realLevelId` ou `level` : 1-8 dans la table content (vrai niveau de difficulté)
- `familyId` : number (ID en DB) | `familyIdRaw` : string (AsyncStorage)
- `subfamilyId` : 1, 2, 3... (jamais `level` qui crée un conflit !)
- `compositeFamilyId` : `${familyId}-${subfamilyId}` (ex: "1-1") pour la progression
- `exerciseType` ou `moduleSlug` : 'vocab', 'grammar', etc.
