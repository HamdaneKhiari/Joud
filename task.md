# Nettoyage pré-production — Suivi

Analyse effectuée le 2026-07-20, exécutée le même jour. Objectif : ne garder que du **code pur de production** dans ce repo. Le design est traité en phase 2, séparément.

---

## 1. Fichiers racine morts (ancien pipeline de contenu) — ✅ fait

Chaîne complète abandonnée : PDF Oxford → JSON → Excel → validation. Remplacée par `src/database/script/generate_migration.py` + `src/database/dataExcel/*.xlsx` → `src/database/migrations/`, le pipeline réellement branché dans `init.ts`.

- [x] `The_Oxford_3000.pdf` supprimé
- [x] `oxford_list.json` supprimé
- [x] `data_english.xlsx` supprimé
- [x] `my_words.json` supprimé
- [x] `analysis_report.json` supprimé (artefact généré, ne devait pas être versionné)
- [x] `convert_oxford_pdf.js` supprimé
- [x] `convert_excel_to_my_words.js` supprimé
- [x] `validate.js` supprimé
- [x] `data_formats.json` supprimé (mentionnait encore `fastvocab`, module déjà retiré du projet)
- [x] Scripts npm retirés de `package.json` : `build:oxford-list`, `build:my-words`, `validate:vocab`
- [x] Dépendance `pdf-parse` désinstallée (`npm uninstall pdf-parse`, `package.json`/`package-lock.json` à jour)

`generate_migration.py` (dans `src/database/script/`) est conservé — c'est le pipeline actif (xlsx → migration TypeScript).

`src/data/FAMILLE_*.md` (11 fichiers) et `src/data/CORE_800_WORDS_JOUD.xlsx` supprimés aussi — le module grammar (qui en dépendait) est déjà retiré du projet. `src/data/` est maintenant vide (les sous-dossiers vides `conversation/`, `games/`, `grammar/`, `reading/`, `sentences/`, `special/*`, `vocabulary/` ont aussi été retirés — pure clutter filesystem, jamais suivis par git). Du contenu réel sera réinjecté séparément.

---

## 1bis. Documentation racine — ✅ fait

- [x] `GUIDE_THEMES.md` supprimé
- [x] `DATA_GUIDE.md` supprimé
- [x] `SENTENCES_MODES_EXAMPLES.md` supprimé
- [x] `STRUCTURE_VOCABULAIRE_800.md` supprimé
- [x] `TEST_PLAN.md` supprimé
- [x] `WHITE_LABEL_GUIDE.md` supprimé
- [x] `ARCHITECTURE_DONNEES.md` supprimé (documentait entre autres le module grammar, déjà retiré)

---

## 2. Code mort — ✅ fait

Vérifié un par un par grep sur tout `src/` + `app/` avant suppression (zéro référence en dehors de sa propre définition), puis revérifié après coup (`tsc --noEmit` + `eslint` propres, aucune nouvelle erreur par rapport à la baseline des fichiers de test déjà cassés).

- [x] `src/database/migrations/DatabaseContext.tsx` supprimé
- [x] `src/components/family/RecentActivityCard.tsx` supprimé
- [x] `src/components/modules/RecentModuleCard.tsx` supprimé (+ le commentaire fantôme qui le mentionnait dans `ExerciceSelectionScreen/index.tsx` nettoyé)
- [x] `src/components/common/NavigationButtons/hooks/useButtonPressAnimation.ts` supprimé (dossier `hooks/` devenu vide, retiré aussi)
- [x] `src/screens/AITutor/components/ErrorDetailView.tsx` supprimé
- [x] `src/screens/AITutor/components/ErrorModuleCard.tsx` supprimé
- [x] `src/screens/AITutor/components/VocabSection.tsx` supprimé
- [x] `src/screens/AITutor/hooks/useAdvancedErrorAnalysis.ts` supprimé
- [x] `src/screens/Dashboard/components/DashboardAiTutorCard/AiTutorCardStyles.ts` supprimé
- [x] `src/utils/badgeHelper.ts` supprimé (fichier vide)
- [x] `src/utils/familySelection/familySelectionHelper.ts` + son test orphelin `src/__tests__/unit/familySelectionHelper.test.ts` supprimés ensemble (dossier `familySelection/` devenu vide, retiré aussi)

---

## 2bis. Restructuration `src/database/migrations` — ✅ fait

Constat : deux dossiers créaient une confusion (`migrations/` ne contenait plus que le moteur `runner.ts` + le fichier mort `DatabaseContext.tsx`, `migrations_v2/` contenait les 4 vraies migrations). Comme il n'existe plus qu'une seule génération de migrations (les anciennes non-v2 ont déjà été purgées avant cette passe), la distinction "v2" n'a plus de sens.

- [x] `DatabaseContext.tsx` supprimé (voir section 2)
- [x] Les 4 fichiers de `migrations_v2/` déplacés dans `migrations/` : `001_schema.ts`, `002_seed_config.ts`, `003_seed_subfamily_labels.ts`, `004_remove_grammar_module.ts`
- [x] Dossier `migrations_v2/` supprimé (vide)
- [x] Imports internes des 4 fichiers corrigés (`../migrations/runner` → `./runner`, ils sont maintenant siblings de `runner.ts`)
- [x] `src/database/init.ts` mis à jour : imports pointent vers `./migrations/00X_*` au lieu de `./migrations_v2/00X_*`, variables renommées `migrationV2_00X` → `migration00X` (la mention "V2" n'a plus de sens vu qu'il n'y a qu'une seule lignée de migrations désormais)

Résultat : `src/database/migrations/` contient maintenant `runner.ts` + les 4 migrations, un seul dossier, plus de duplication de concept.

---

## 3. Commentaires obsolètes / décoratifs

- [x] `src/database/index.ts` : bloc de commentaire pointant vers un chemin inexistant (`src/screens/exercises/Sentences/SentenceExerciseScreen.tsx`) supprimé.
- [x] `src/database/` (queries.ts, schema.ts, init.ts, runner.ts, les 4 migrations) : bannières décoratives `// ====...====`, JSDoc qui ne faisaient que répéter le nom de la fonction, notes `✅ CORRIGÉ` obsolètes — supprimées. Gardé : logique SM-2, fallback en cascade, explications de règles métier non triviales.
- [x] `src/components/pedagogy/` (24 fichiers : Connector, dialogues, reading, revision, shared/QuestionCard, wordgames) : même passe — en-têtes de fichier décoratifs, bannières `TYPES`/`COMPOSANT`/`HANDLERS`/`STYLES DYNAMIQUES`, commentaires `✅ Ajouté` / `✅ Récupéré des props` / `Correction S6439` (référence à une règle Sonar, obsolète), narration JSX redondante (`{/* Titre */}`, `{/* Card principale */}`...), `// ✅ White label` répété sur quasi chaque ligne de style. Corrigé au passage un commentaire faux dans `SyntaxMasterCard` qui parlait de "drag & drop" alors que le mécanisme est tap-to-place. `tsc`/`eslint` propres après coup (aucune nouvelle erreur vs baseline).
- [x] `src/screens/` (dossier entier, 62 fichiers touchés) : ConnectorScreen, DialoguesScreen, ReadingScreen, RevisionScreen, VocabularyScreen, WordGames, ExerciceSelectionScreen, FamilySelectionScreen, SubFamilySelectionScreen, Onboarding, SettingsAIScreen, screens/components, Dashboard, AITutor. Même passe partout (bannières décoratives, JSDoc redondants, narration JSX, `✅`/`⚠️`/`🎯` emoji-noise accumulés au fil du dev). `tsc`/`eslint` propres après chaque dossier.
  - Code mort trouvé et supprimé au passage (au-delà des commentaires) :
    - `src/screens/VocabularyScreen/schema.ts` — marqué "DÉPRÉCIÉ", zéro import.
    - `src/screens/Dashboard/components/DashboardCard/` (composant + styles) — zéro import.
    - `src/screens/AITutor/components/AIButtonWithResponse.tsx` — zéro import.
    - `src/screens/AITutor/hooks/useStudentAnalysis.ts` et `useVocabularyExposure.ts` — zéro import, superseded par `useGuidedDomainSummaries`.
    - Feature "encouragement" dans `DashboardMetricsSession` (texte jamais affiché, JSX de rendu déjà commenté avec la note "NON UTILISÉ") — toute la chaîne (prop, calcul, règles de seuils, styles associés) retirée, pas juste le commentaire.
  - Corrections notables : commentaires auto-contradictoires accumulés au fil des éditions (ex: dans `ExerciceSelectionScreen`, un commentaire disait "on passe undefined explicitement" juste au-dessus d'un autre disant "l'argument undefined est redondant" — sur du code qui ne passait déjà plus d'argument).
- [x] `src/hooks/` (19 fichiers), `src/contexts/` (6), `src/services/` (4), `src/utils/` (9), `src/components/` hors `pedagogy/` (24 : common, family, flow, layout, modules, ui) : même passe partout. `src/database/dataExcel` ne contient qu'un `.xlsx` (data, pas de code) ; `seeds/` n'existe plus (retiré section 2). `tsc`/`eslint` propres après chaque dossier — 134 problèmes constants, 0 nouveau.
  - Code mort trouvé et supprimé au passage : dans `navigationHelper.ts`, `navigateToFamilySelection` et `goBack` (zéro import nulle part) supprimés ; `navigateToExercise` simplifié — sa branche `if (familyId)` était non seulement morte (le seul appelant ne passe jamais `familyId`) mais aussi cassée (l'`exerciseId` composite qu'elle construisait ne matchait aucun `case` du dispatcher).
  - Cassure connue et non traitée (test, hors scope) : `src/__tests__/unit/navigationHelper.test.ts` teste encore le code supprimé — à mettre à jour quand la suite de tests sera reprise.

---

## 4. Hygiène Git (repo parent, hors `Joud/`) — ✅ fait

Concerne `JanaArchitect` (le dossier parent qui contient `Joud` comme dépôt imbriqué), pas `Joud` lui-même.

- [x] `.gitignore` parent créé (`.expo/`, `.idea/`, `.qodo/`, `node_modules/`, `.DS_Store`) — vérifié via `git check-ignore` que les 4 sont bien exclus.
- [x] Committé avec `.claude/settings.json` (config partagée Claude Code : hooks/permissions). `.claude/settings.local.json` reste untracked (personnel, déjà couvert par le gitignore global de la machine).
- Note : `Joud` apparaît modifié dans `git status` du repo parent — c'est le pointeur du dépôt imbriqué qui reflète le travail en cours dans `Joud/` lui-même (non commité, comme prévu — rien n'est committé dans `Joud/` sans confirmation séparée).

---

## 5. Hors scope pour l'instant

- Design / UI (phase à venir, après le nettoyage code — le nettoyage code+produit est maintenant terminé).
- Dépendances npm inutilisées au-delà de `pdf-parse` (pas auditées).
- Tests (explicitement zappés — à refaire plus tard, app en pleine refonte).
- Monétisation (IAP/RevenueCat).

---

## 6. Audit logique produit / qualité (nouvelle passe, distincte du nettoyage commentaires)

Contexte : objectif version définitive prête pour la prod avec les 7 modules existants (contenu réel géré séparément par l'utilisateur). Phase 0 (état des lieux contenu) faite : table `content` vide sur install fraîche, aucune migration ne seed de vrais exercices — attendu, l'utilisateur injecte son propre contenu (fichiers Excel déjà préparés) séparément. Phase 1 (audit logique produit, agent dédié) a tracé les 7 écrans d'exercice.

### 🔴 Corrigé — bug de corruption de progression

- [x] `ConnectorExerciseScreen.tsx` `handleBackPress` appelait `trackItemCompletion` + `saveProgressNow()` à **chaque** pression du bouton retour, y compris quand l'utilisateur n'avait rien fait (`currentIndex === 0`) — marquait à tort 1 item comme complété en SQLite, faussant le % affiché sur Dashboard/FamilySelection. Fix : guard `if (currentIndex > 0)` avant de tracker.

### 🟠 Corrigé — impasses de navigation quand le contenu est vide

- [x] `SentenceExerciceScreen.tsx` : spinner infini sans bouton retour → séparé en état loading (spinner) / état vide (message + header avec bouton retour), même pattern que Vocab.
- [x] `ConnectorExerciseScreen.tsx` : texte "Question not found" sans bouton retour → même pattern, header + bouton retour ajoutés.
- [x] `DialogueExerciseScreen.tsx` : écran silencieusement vide (le hook `isLoading` était destructuré mais jamais utilisé) → ajout des deux états (loading, vide) avec header + bouton retour.
- `tsc`/`eslint` propres après les 3 fixes, aucune régression sur le reste du repo.

### 🟠 Corrigé — reprise d'index et complétion manquantes

- [x] `ReadingExerciseScreen.tsx`, `DialogueExerciseScreen.tsx`, `ConnectorExerciseScreen.tsx` ne reprenaient jamais où l'utilisateur s'était arrêté (`useFirstIncompleteIndex` non branché, contrairement à Vocab/Sentence/WordGames) → branché sur les 3. Pour Dialogues (2 phases dialogue/questions), si l'index de reprise est > 0 on saute directement en phase questions.
- [x] `DialogueExerciseScreen.tsx` et `WordGamesExerciseScreen.tsx` ne déclenchaient jamais `CompletionModal` ni `saveProgressNow()` explicite sur le dernier item (comptaient sur la sauvegarde async silencieuse au démontage) → ajout de l'état `showCompletion` + `CompletionModal` + `saveProgressNow()` explicite, même pattern que Vocab/Sentence/Reading/Connector. Pour WordGames, `useGameHandlers` accepte maintenant un `onComplete` optionnel appelé à la place de la navigation directe sur la dernière question.
- [x] Word Games n'appelait jamais `recordError` — le Coach IA était aveugle sur tout ce module. Ajouté dans les 3 familles de handlers (`makeOptionHandlers` pour definition/blanks/reply/transformer/builder, `sentence`, `detective`), déclenché uniquement à la tentative finale ratée (pas à chaque retry).
- `tsc`/`eslint` propres après chaque fix, aucune régression (134 problèmes constants, tous préexistants dans les tests).

### 🟡 Incohérences mineures — traitées partiellement

- [x] `parseCompositeKey` réimplémenté à la main dans `useLastActivity.ts` (`recordActivity`) et `Dashboard.tsx` → remplacé par l'import de `parseCompositeKey` (`src/contexts/progressUtils.ts`) aux deux endroits.
- [x] Cadence `recordError` normalisée pour **Connector** : recordait à chaque tentative ratée, maintenant seulement à la tentative finale (`maxAttempts` threadé depuis l'écran vers `useConnectorHandlers`), cohérent avec Reading/Dialogues/WordGames.
- [x] **Sentence (`phrase_types`) — plafond de tentatives ajouté (décision : option B)**. `phrase_types` n'avait aucune notion d'`attemptCount`/`maxAttempts` : retries illimités, aucune porte de sortie si bloqué. Ajouté `MAX_ATTEMPTS = 2` + state `attemptCount` (reset à chaque nouvel item, préservé pendant les retries du même item) ; à la 2e tentative ratée, `validationState` passe à `'skip'` (bouton "passer", cohérent avec le reste de l'app) au lieu de rester bloqué sur `'incorrect'` indéfiniment. `recordError` ne remonte plus au Coach IA qu'à la tentative finale ratée (aligné sur Reading/Dialogues/WordGames/Connector, plus de doublons). Les 3 modes (blanks/tiles/free) partagent maintenant la même logique via un helper `applyResult` interne, ce qui a aussi réduit la duplication entre les 3 branches.
- [x] **Flag mort `requiresSubfamilyForAllFamilies` supprimé**. Confirmé avec l'utilisateur : le schéma est toujours famille+sous-famille ensemble, aucune famille vocab/reading sans sous-famille n'est prévue ("Colors" serait une sous-famille au sein d'une famille plus large, pas une famille autonome). Retiré de `ModuleConfig` (interface + les 4 entrées vocab/phrase_types/dialogues/reading dans `moduleConfig.ts`) et des tests qui l'asservissaient (`src/config/__tests__/moduleConfig.test.ts`, `src/__tests__/unit/moduleConfig.test.ts`) — les 2 suites passent toujours (16/16).
  - Confirmé au passage : **Reading a bien des sous-familles** (`hasSubfamilies: true` dans `moduleConfig.ts`), même mécanisme que vocab/phrase_types/dialogues — route via `SubFamilySelectionScreen`.
  - Note en passant : `src/config/__tests__/moduleConfig.test.ts` et `src/__tests__/unit/moduleConfig.test.ts` sont deux suites quasi-redondantes testant le même fichier (une version concise, une version verbeuse commentée en français) — pas touché plus que nécessaire ici, mais candidat à une consolidation en Phase 2 qualité de code.

### ✅ Confirmé solide (anciens pièges vraiment réglés)

- Renommage `sentences` → `phrase_types` propre partout, couvert par tests de non-régression.
- `ConnectorScreen` ne fait plus de SQL direct, passe bien par `ProgressContext`.
- Parsing de la clé composite (`familyId-subfamilyId`) correct dans le chemin principal.
- Module `assessment` : pas d'écran, filtré volontairement (`getAvailableModules` exclut `assessment`) — pas une impasse atteignable, mais à confirmer avec l'utilisateur si c'est du WIP ou abandonné (remet en cause le compte "7 modules").
  - **Confirmé et traité** : le module a été volontairement abandonné (format d'évaluation jugé trop lourd) → voir section 8.

---

## 7. Phase 2 — qualité de code (architecture, duplication)

- [x] **Composants partagés `ExerciseLoadingState` / `ExerciseEmptyState`** créés (`src/components/common/`), calqués sur le pattern déjà propre de Vocab (wrapper `ExerciseLayout` + header avec bouton retour fonctionnel). Appliqués aux 6 écrans d'exercice (Vocab, Sentence, Reading, Dialogues, WordGames, Connector), remplaçant le code loading/empty dupliqué de chacun. Corrige au passage :
  - **WordGames** : le label "Chargement..." s'affichait aussi pour un contenu réellement vide (branche `isLoading || !family || !currentQuestion` fusionnée) → séparé en deux checks distincts.
  - **Reading** : bouton retour fait main (`TouchableOpacity` + navigation directe) dupliquant le header standard → remplacé par le header `ExerciseLayout` normal.
  - Bonus : **Sentence** et **Connector** avaient un état loading qui n'était PAS wrappé dans `ExerciseLayout` (aucun header, aucun bouton retour possible pendant le chargement) → maintenant wrappé comme tous les autres écrans.
- [x] **`DialogueCard` (334 lignes, god-component à 2 responsabilités) splitté** en `DialogueReaderCard` (phase lecture du dialogue) et `DialogueQuestionCard` (phase questions), chacun avec son propre `style.ts`. Le type `Dialogue` canonique (messages + questions + characters) déménagé dans `useDialogueContent.ts` qui en est le propriétaire naturel (source des données), import des types `Character`/`Message` depuis `DialogueReaderCard` et `Question` depuis `DialogueQuestionCard`. `DialogueExerciseScreen.tsx` mis à jour aux 2 points d'appel.
- `tsc`/`eslint` propres après chaque étape — 134 problèmes constants (0 erreurs/warnings nouveaux), tous préexistants dans `__tests__`/`__mocks__`.
- [x] **Standardisation de la lecture des params de navigation.** Les 6 écrans lisaient leurs params via 3 mécanismes différents (`useRoute()`/`useNavigation()` de react-navigation pour Sentence/Reading/Connector ; props `navigation`/`route` fabriquées à la main par `ExerciseDispatcher` pour Vocab/WordGames ; un hybride des deux pour Dialogues, avec en plus son propre `useRouter()`/`canGoBack()` custom). Uniformisé sur `useLocalSearchParams()` (expo-router) + `useSafeNavigation()` (déjà générique, fonctionne sans props grâce au contexte react-navigation ambiant qu'expo-router expose). `app/exercise/[exerciseId].tsx` simplifié : suppression du shim `buildProps`/`routeParams`/`routeKey`, chaque écran est rendu sans props (`<VocabularyExerciseScreen />`) et se sert lui-même dans l'URL.
  - Bonus découvert en cours de route : les params `title`/`moduleColor` lus par Reading/Connector n'étaient **jamais transmis** par aucun des 5 points d'appel réels de `/exercise/[exerciseId]` (vérifié par grep exhaustif) — params morts, toujours sur leur fallback. Conservés tels quels (mêmes fallbacks) pour ne rien changer côté comportement, mais le constat est noté ici si un jour on veut vraiment personnaliser ces titres.
  - Typage corrigé au passage : `ReadingExerciseParams`/`ConnectorExerciseParams` déclaraient leurs champs `number` alors que les params d'URL sont toujours des `string` (le `route.params as X` masquait l'écart) — maintenant typés `string` avec `Number(...)` explicite, cohérent avec Vocab/Sentence.
- [x] **Extraction des 2 patterns dupliqués identiques sur 5-6 écrans** plutôt qu'un hook `useExerciseLifecycle` monolithique (jugé plus honnête vu la vraie diversité entre écrans — Dialogues à 2 phases, Connector multi-types) :
  - `useResumeIndex(levelId, exerciseType, familyId, totalItems)` (`src/hooks/exercises/`) : remplace le trio `useState(0)` + `useFirstIncompleteIndex` + `useEffect` de reprise d'index, dupliqué à l'identique dans Vocab/Sentence/Reading/WordGames/Connector. Dialogues garde sa version bespoke (2 phases) telle quelle.
  - `useExerciseCompletion()` (`src/hooks/exercises/`) : remplace le duo `useState(false)` + `saveProgressNow().then(() => setShowCompletion(true))`, dupliqué dans les 6 écrans.
  - `makeCompositeFamilyId(familyId, subfamilyId)` ajouté dans `progressUtils.ts`, inverse de `parseCompositeKey` déjà existant.
- `tsc`/`eslint` propres après chaque écran — toujours 134 problèmes constants, 0 nouveau, tous dans `__tests__`/`__mocks__`.

---

## 8. Suppression du module `assessment` — ✅ fait

Confirmé avec l'utilisateur : le module a été volontairement abandonné (format d'évaluation jugé trop lourd, pas aimé), pas du WIP. Constat de départ : `assessment` n'existait déjà plus dans la couche applicative (absent de `moduleConfig.ts`, `progressUtils.ts`, tous les écrans) — il ne restait que dans le seed DB et 2-3 unions de types. Traité sur le même modèle que la suppression déjà faite du module `grammar` (migration 004) :

- [x] `src/database/migrations/002_seed_config.ts` : retiré du seed direct — la ligne `modules`, la famille `assessment_pool`, son entrée dans la boucle `coreModules` (module_availability). `connector` recule de `order_index` 7 → 6 pour combler le trou. Commentaires de comptage mis à jour (7 → 6 modules, 6 → 5 core modules).
- [x] `src/database/migrations/005_remove_assessment_module.ts` créé : migration de purge des données résiduelles (`content`, `progress`, `exercise_errors`, `activity_log`, `level_labels`, `families`, `module_availability`, `module_labels`, `modules`) pour les appareils qui ont déjà tourné avec l'ancien seed — même pattern exact que `004_remove_grammar_module.ts`. Enregistrée dans `src/database/init.ts`.
- [x] `src/database/schema.ts` : retiré les 4 littéraux de type `ContentType` morts (`assessment_definition`/`assessment_blanks`/`assessment_sentence`/`assessment_question`) et `'assessment'` du type `FeedbackMessage.context` (aucune ligne seedée ne l'utilisait).
- [x] `src/database/queries.ts` : retiré le filtre mort `AND m.slug != 'assessment'` dans `getAvailableModules` (devenu inutile, le module n'est plus seedé).
- `tsc`/`eslint` propres — 134 problèmes constants, 0 nouveau.
- Casse connue et non traitée (tests, hors scope) : `src/__tests__/integration/queries.test.ts` (teste l'ancien filtre SQL) et `src/__tests__/unit/moduleConfig.test.ts` (teste `moduleHasSubfamilies('assessment')`) référencent encore assessment — laissés tels quels, seront à mettre à jour quand la suite de tests sera reprise.

---

## Vérifications post-nettoyage

- `npx tsc --noEmit` : aucune nouvelle erreur (les seules erreurs restantes sont dans des fichiers de test, préexistantes avant cette passe).
- `npx eslint src app --ext .ts,.tsx --max-warnings 0` : aucune nouvelle erreur (avertissements `any`/`unused` préexistants dans des fichiers de test uniquement).
- Grep de confirmation : zéro référence restante à un des fichiers/dossiers supprimés ou déplacés (`migrations_v2`, `badgeHelper`, `RecentActivityCard`, `RecentModuleCard`, `useButtonPressAnimation`, `ErrorDetailView`, `ErrorModuleCard`, `VocabSection`, `useAdvancedErrorAnalysis`, `AiTutorCardStyles`, `familySelectionHelper`, `DatabaseContext`).
- Rien n'a été committé — tout est dans le working tree, à toi de valider avant `git add`/commit.
