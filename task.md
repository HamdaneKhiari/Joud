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

## 9. Phase design — audit + corrections (3 docs)

Audit visuel en 3 temps : (1) les 4 identités côte à côte, (2) qualité des composants
(premium vs flashy), (3) verdict global + vérification demandée sur la progression suite au
retrait grammar/assessment.

- [x] **Contraste header.accent** — Primaire et Lycée étaient sous le seuil WCAG (2.1:1 et
  2.4:1, icône ET sous-titre de header). `header_accent_color` passé au blanc pour ces deux
  identités dans `002_seed_config.ts` (garde `accent_color` inchangé, utilisé ailleurs).
- [x] **Langue du feedback Adulte** — mélangeait français/anglais ligne à ligne ; repassé
  entièrement en français, en vouvoiement (distinct du tutoiement des 3 autres identités).
- [x] **Cibles tactiles Primaire** — déjà à 58px dans `ExerciceNavBar.tsx` (vs 48px partagé).
- [x] **Étoile retirée** de `LevelCard` (badge niveau complété) — unifié sur `check-decagram`
  pour toutes les identités, "Bravo !" conservé en mood playful.
- [x] **`ExerciseValidation` et `CompletionModal` différenciés par mood** — glow en boucle,
  bordure épaisse, majuscules, emoji de célébration : réservés au mood playful. En clean
  (Lycée/Adulte), bouton plein avec ombre allégée et casse normale, badge check-circle sobre à
  la place de l'emoji. Le rebond au clic et le spring d'entrée de la modale restent pour tous
  (feedback tactile, pas de la déco).
- [x] **Ombres allégées pour minimal/executive** — `FlowCard` avait déjà ce traitement pour
  `executive` seul, étendu à `minimal`. Même principe ajouté à `MetricCard` et `DailyWordCard`
  qui n'avaient aucune variation d'ombre selon le mood.
- [x] **Traduction `WORDS`/`AWARDS`/`STREAK`** → `MOTS`/`RÉCOMPENSES`/`SÉRIE` dans
  `metricsSession.tsx`.
- [x] **Mode sombre Adulte activé puis annulé** — testé sur device, rendu "presque tout noir" :
  la hiérarchie visuelle de l'app repose sur des ombres noires (invisibles sur fond déjà sombre),
  jamais remplacées par bordures/fonds clairs pour l'élévation en dark mode. Un vrai mode sombre
  demande de retravailler l'élévation composant par composant (`FlowCard` en mode `executive` le
  fait déjà partiellement — bordure au lieu d'ombre — mais pas `MetricCard`/`DailyWordCard`/
  `LevelCard`/boutons). Décision : revert (`theme_mode` → `'light'`, `surface_color` →
  `'#FFFFFF'`, `daily_word_bg_color` → `'#F8FAFC'`, valeurs d'origine), chantier remis à plus
  tard si vraiment voulu.
- [x] **Bug de progression corrigé** — `getLevelProgress()` divisait toujours par
  `ALL_MODULE_SLUGS.length` (6), y compris pour Primaire/Collège qui n'ont jamais `connector`
  (réservé Lycée/Adulte) → plafond structurel à 83% même à 100% de complétion réelle. Nouveau
  `getApplicableModules(audience)` dans `progressUtils.ts`, utilisé dans `getLevelProgress`.
  Pas lié au retrait grammar/assessment (vérifié : aucune trace résiduelle des deux dans le
  calcul de progression) — bug préexistant, distinct.
- [x] **Passe accessibilité sur les composants partagés** (portée volontairement limitée aux
  composants réutilisés partout plutôt qu'un audit écran par écran) :
  - `useReducedMotion()` créé (`src/hooks/`) — respecte `AccessibilityInfo.isReduceMotionEnabled`
    pour les animations pilotées par l'API `Animated` de React Native. Appliqué à
    `ExerciseValidation` (glow, rebond au clic, entrée du banner de feedback) et `CompletionModal`
    (overlay, card, emoji) : si activé, les animations sautent directement à leur état final.
  - Pour les animations `react-native-reanimated` (`FadeIn*`), utilisé le modificateur natif
    `.reduceMotion(ReduceMotion.System)` plutôt qu'un hook custom — `FlowCard`, `LevelCard`,
    `DashboardHeader`, `MetricCard`, `Dashboard.tsx` (6 sections).
  - `accessibilityRole`/`accessibilityLabel`/`accessibilityState` ajoutés sur les boutons
    icône-seule (`ExerciceNavBar` : retour + icône droite — cette dernière masquée aux lecteurs
    d'écran quand elle n'a pas de handler, ce qui est le cas partout actuellement),
    `NavigationButtons` (Précédent/Suivant/Terminer), `ExerciseValidation`, `CompletionModal`,
    `FlowCard`, `LevelCard`. `FeedbackBanner` (résultat validation) passé en
    `accessibilityLiveRegion="polite"` pour une annonce automatique.
- `tsc`/`eslint` propres après chaque étape, 134 problèmes constants, 0 nouveau.

- [x] **Police Adulte différenciée** — ajout du package `@expo-google-fonts/inter` (`npm install
  --legacy-peer-deps`, conflit peer-deps préexistant dans le projet, sans rapport). Adulte utilise
  désormais Inter (`FONT_FAMILIES.adult` dans `ThemeContext.tsx`), Lycée garde DM Sans — 4 polices
  réellement distinctes sur les 4 identités. Chargée via `useFonts` dans `app/_layout.tsx`.
- [x] **`header_welcome_text` repassé en français** — Primaire "Hello !" → "Salut," ; Adulte
  "Welcome back," → "Bon retour," (vouvoiement, cohérent avec le feedback Adulte). Collège/Lycée
  déjà en français, inchangés.
- [x] **Sécurité clé API IA — purge automatique sur réinstallation.** Analyse demandée par
  l'utilisateur : architecture déjà solide (Keychain/Keystore AES-256, jamais en SQLite/logs, UI
  ne réaffiche jamais la clé en clair, appel direct device→provider sans backend Joud dans le
  chemin). Point faible identifié : le Keychain iOS peut survivre à une désinstallation d'app
  (contrairement à AsyncStorage) — scénario concret : téléphone revendu sans reset usine, app
  réinstallée par le nouveau propriétaire, ancienne clé encore récupérable. Fix implémenté :
  `secureStorage.purgeIfStaleInstall()` (`src/services/SecureStorage.ts`) vérifie un marqueur
  `JOUD_INSTALL_MARKER` dans AsyncStorage au démarrage ; absent (premier lancement ou
  réinstallation) → purge toute clé résiduelle du Keychain avant qu'elle soit lisible. Câblé dans
  `UserContext.tsx`, avant tout chargement (donc avant que `AIProvider`/`useAISettings` ne
  puisse lire quoi que ce soit). Zéro impact sur l'usage normal — le marqueur persiste ensuite.
  Alternative "effacer à chaque fermeture d'app" écartée après discussion : aucun hook de
  fermeture garanti sur mobile (l'OS peut tuer une app en arrière-plan sans prévenir le JS), et
  ça ne ciblait pas le vrai scénario à risque (désinstallation, pas mise en arrière-plan).
- `tsc`/`eslint` propres, 134 problèmes constants, 0 nouveau.
- [x] **Audit accessibilité écran par écran — terminé.** Tous les fichiers contenant
  `TouchableOpacity`/`Pressable` (~35 fichiers, composants pédagogiques inclus) passés en revue.
  Ajouté systématiquement `accessibilityRole`/`accessibilityLabel`/`accessibilityState` :
  - Boutons icône-seule (retours, play audio, envoyer, config) — `SettingsAIScreen`,
    `AITutorFreeScreen`, `AITutorGuidedScreen`, `AITutorSelectionScreen`, `GuidedHeader`,
    `DialogueReaderCard` (nav + audio bulle), `AudioButton`.
  - Groupes de sélection (`accessibilityRole="radio"` + `accessibilityState.selected`) —
    `OptionButton` (partagé Reading/Dialogues/Connector via `QuestionCard`), `SentenceBlanksCard`,
    `LogicLinksCard`, tous les jeux de mots (`DefinitionCard`, `BlanksCard`, `ReplyCard`,
    `TransformerCard`, `DetectiveCard`), `RevisionQuestionCard`, `ProviderSelector`, chips
    d'audience dans Réglages.
  - Actions ajout/retrait (tuiles, mots) — `SentenceTilesCard`, `SyntaxMasterCard`.
  - Switches et champs — `Sons`/`Vibrations` dans Réglages, prénom dans `OnboardingScreen`.
  - `FeedbackBanner` (résultat de validation) déjà en `accessibilityLiveRegion="polite"` depuis la
    passe précédente.
  - Nettoyage en chemin : `src/components/pedagogy/dialogues/DialogueCard/` (l'ancien composant
    pré-split, zéro import) était réapparu sur le disque après un commit externe — supprimé à
    nouveau.
  - Vérifié par script : zéro fichier contenant `TouchableOpacity`/`Pressable` sans au moins un
    attribut d'accessibilité.
- `tsc`/`eslint` propres, 134 problèmes constants, 0 nouveau, aucune régression.

**Constats non traités, notés pour plus tard :**
- Onboarding en bleu générique (`baseColors`, pas `useTheme()`) et audience jamais choisie à
  l'accueil (défaut silencieux sur 'college') — **confirmé volontaire** par l'utilisateur : mode
  dev pour basculer entre les 4 identités sans relancer `expo start` ; sera coupé au moment de
  générer des builds séparés par public. Pas une action à mener maintenant.
- Séparation en builds distincts par public (évoquée par l'utilisateur comme prochain chantier,
  pas commencé).
- Checklist de publication (stores) jamais abordée : pas de `bundleIdentifier` iOS explicite dans
  `app.json` (seulement le package Android `com.hamdanek.Joud`), icônes/splash non vérifiés
  visuellement, pas de politique de confidentialité évoquée (obligatoire App Store/Play Store).

---

## 10. État des lieux complet — duplication de code (mesurée)

Audit demandé par l'utilisateur : duplication de code, propreté, UX/UI, bugs, "un truc classique".
Propreté/UX déjà couvertes en détail (sections précédentes) — pas refaites, juste résumées dans
ce document. Nouveauté : duplication mesurée avec `jscpd` plutôt qu'estimée à l'œil.

- **Résultat global** : 5.28% de lignes dupliquées (1525/28857), 87 clones détectés
  (`npx jscpd src app --min-lines 5 --min-tokens 50`, tests/mocks exclus). Chiffre sain pour la
  taille du projet, mais concentré sur 3 familles plutôt que diffus :
  1. **Jeux de mots** (`DefinitionCard`, `BlanksCard`, `ReplyCard`, `TransformerCard`,
     `DetectiveCard`, `SyntaxMasterCard`) — le bloc `useEffect` de chargement du feedback
     (`useFeedbackMessages`/`getFeedbackState`) copié-collé à l'identique dans 6 fichiers. Plus
     gros poste de duplication du projet.
  2. **Cards Connector** (`LogicLinksCard`, `SentenceFusionCard`, `RephrasingCard`) — structure de
     card dupliquée entre les 3.
  3. **AITutorFreeScreen / AITutorGuidedScreen** — header, saisie, bouton d'envoi clonés sur
     plusieurs blocs de 15-45 lignes.
  - Plus petit : `VocabularyExerciceScreen.tsx` duplique en interne le bloc
    `trackItemCompletion` + `recordWordSeen` entre `handleNext` et `handleFinish` (confirmé,
    lignes 82-95 vs 97-111).
- [x] **`useWordGameFeedback` extrait et appliqué** aux 6 jeux de mots (`DefinitionCard`,
  `BlanksCard`, `ReplyCard`, `TransformerCard`, `DetectiveCard`, `SyntaxMasterCard`) —
  `src/screens/WordGames/hooks/useWordGameFeedback.ts`, même pattern que
  `useResumeIndex`/`useExerciseCompletion`. `useState`/`useEffect` et les imports
  `useFeedbackMessages`/`getFeedbackState`/`FeedbackData` retirés des 6 fichiers (gardé
  `useState` dans `SyntaxMasterCard`, utilisé par ailleurs pour le tap-to-place).
- [x] **`recordCurrentWordSeen()` extrait** dans `VocabularyExerciceScreen.tsx` —
  `handleNext`/`handleFinish` ne dupliquent plus le bloc `trackItemCompletion` + `recordWordSeen`.
- [x] **`useConnectorFeedback` extrait et appliqué** aux 3 cards Connector (`LogicLinksCard`,
  `RephrasingCard`, `SentenceFusionCard`) — `src/components/pedagogy/Connector/hooks/`. Combine
  `useExerciseValidationState` + `generateFeedbackMessage`, logique strictement identique dans
  les 3 fichiers. Portée volontairement limitée à cette logique pure : les styles/JSX des 3 cards
  n'ont **pas** été fusionnés malgré leur ressemblance (risque de régression visuelle non
  vérifiable sans device sous la main).
  - Exception traitée à part : `LogicLinksCard` n'avait pas `...tokens.shadows.md` dans son style
    `card`, contrairement à `RephrasingCard`/`SentenceFusionCard`. Contrairement aux différences
    entre publics (voulues), les 3 cards Connector apparaissent dans le **même flux d'exercice**
    pour le même utilisateur au fil des questions — pas de raison produit qu'une carte soit plus
    plate que les 2 autres. Confirmé avec l'utilisateur : oubli, pas un choix. Ombre ajoutée.
- **Résultat mesuré** (re-passage `jscpd`, 2 étapes) : 5.28% → 4.96% (jeux de mots) → **4.78%**
  (+ Connector) de lignes dupliquées ; 87 → 84 → **81** clones. `tsc`/`eslint` propres, 134
  problèmes constants, 0 nouveau à chaque étape.
- **Bugs** : balayage frais (TODO/FIXME, promesses non gérées) — rien de neuf trouvé au-delà de
  ce qui a déjà été corrigé cette session (progression plafonnée, contraste, langue Adulte,
  sécurité clé API, corruption Connector).

---

## 11. Séparation en builds par public + checklist de publication

Objectif : 1 build = 1 public verrouillé (Primaire/Collège/Lycée/Adulte), sur les deux
plateformes. Confirmé avec l'utilisateur : architecture white-label déjà adaptée pour ça (une
seule base de code, un 5ème public futur = une ligne `branding` en base, pas de fork).

- [x] **`app.json` → `app.config.js`** — nécessaire pour calculer nom/slug/bundle ID/icône
  dynamiquement selon le public verrouillé. `app.json` supprimé (un seul fichier de config actif
  à la fois, sinon Expo est ambigu sur lequel prime).
- [x] **`ios.bundleIdentifier` ajouté** (`com.hamdanek.Joud`, manquant jusqu'ici — seul
  `android.package` existait). En build mono-public, suffixé par public :
  `com.hamdanek.Joud.primary` / `.college` / `.lycee` / `.adult` (même logique côté
  `android.package`) — obligatoire, Apple/Google n'acceptent pas 4 fiches sous un identifiant
  identique.
- [x] **`eas.json` créé** — profils `development`, `preview` (tous publics, interne), et
  `production-{primary,college,lycee,adult}` (chacun fixe `EXPO_PUBLIC_LOCKED_AUDIENCE` dans son
  `env`). Section `submit` avec les 4 profils prête pour l'envoi aux stores.
- [x] **Verrouillage de l'audience câblé dans `UserContext.tsx`** — `EXPO_PUBLIC_LOCKED_AUDIENCE`
  (inliné dans le bundle par Metro au build, lu directement via `process.env`, pas besoin
  d'`expo-constants`) force `user.audience` au chargement et rend `updateAudience()` no-op.
  Nouveau `isAudienceLocked` exposé par le contexte. En dev/preview (variable absente),
  comportement identique à avant — le switcher reste utilisable.
- [x] **Sélecteur de public masqué en build verrouillé** — section "Version de l'app" dans
  `app/(tabs)/settings.tsx` conditionnée à `!isAudienceLocked`.
- [x] **Icône par public, avec repli propre** — `app.config.js` cherche
  `assets/icon-<public>.png` et retombe sur `assets/icon.png` s'il n'existe pas encore (aucun des
  4 n'est fourni pour l'instant, pas bloquant pour builder).
- **Vérifié concrètement** (pas juste écrit) : `npx expo config --type public` sans variable
  d'env → config par défaut inchangée, nom "Joud", bundle `com.hamdanek.Joud`. Avec
  `EXPO_PUBLIC_LOCKED_AUDIENCE=primary` → nom "Joud Primaire", slug `joud-primaire`, bundle
  iOS/package Android tous deux `com.hamdanek.Joud.primary`. Les deux résolutions fonctionnent.
- `tsc`/`eslint` propres, 134 problèmes constants, 0 nouveau.

**Reste (pas traité, hors code) :**
- Politique de confidentialité — obligatoire sur les deux stores, particulièrement sensible ici
  vu que le public Primaire concerne des enfants (COPPA/RGPD-enfants). Document légal, pas
  rédigé sans validation explicite du contenu avec l'utilisateur (pratiques de données réelles :
  AsyncStorage local, SQLite local, clé API IA en Keychore/Keystore, BYOK envoyé direct aux
  providers, pas d'analytics/tracking actuellement).
- Icônes/splash par public — la structure est prête (`assets/icon-<public>.png`), les fichiers
  eux-mêmes restent à fournir.
- Comptes développeur App Store Connect / Google Play Console, et configuration EAS côté serveur
  (`eas login`, credentials) — hors du scope code, action à mener par l'utilisateur.

---

## 12. Suite de tests remise au vert (9 suites cassées → 0)

Contexte : décision explicite de l'utilisateur de reprendre les tests maintenant (contenu réel à
publier sous ~1 semaine), après une session entière où ils avaient été volontairement mis de
côté ("zap les tests, on est en pleine refonte"). Les 9 suites cassées étaient toutes des
conséquences de changements de code déjà corrects/décidés cette session, jamais répercutés dans
les tests — aucune régression de prod découverte via ce travail, seulement 2 vrais bugs de test
préexistants (copier-coller) mis au jour.

- [x] `navigationHelper.test.ts` — testait `navigateToFamilySelection`/`goBack` (supprimés comme
  morts) et l'ancienne branche `if (familyId)` de `navigateToExercise` (retirée, cassée). Tests
  obsolètes supprimés, `navigateToExercise` re-testé sur son comportement actuel (toujours
  `/family/[familyId]`).
- [x] `queries.test.ts` — testait le filtre SQL `slug != 'assessment'`, supprimé avec le module
  assessment. Assertion remplacée par une vérification qu'aucun filtre par slug ne subsiste.
- [x] `moduleHelper.test.ts` — **2 vrais bugs de test préexistants**, sans rapport avec cette
  session : mauvais nom de module passé à `getModuleColor` dans 2 tests (`'reading'` au lieu de
  `'dialogues'` pour tester l'index 2 ; `'dialogues'` au lieu de `'phrase_types'` pour tester le
  modulo sur le 4ᵉ module). Corrigés pour correspondre à l'intention déjà écrite dans les
  commentaires/titres des tests.
- [x] `useGameState.test.ts` — `useGameHandlers` appelle désormais `useRecordError()` (Coach IA,
  ajouté au commit "Nettoyage") qui requiert `useUser()`. Le test ne mockait pas `UserContext`.
  Mock ajouté (`db: null, user: { id: 'test_user' }`).
- [x] `ProgressContext.test.tsx` — test hardcodait "1 module à 100% sur 7 = 14%", écrit avant la
  suppression de grammar+assessment. `getApplicableModules('college')` exclut aussi `connector`
  → 5 modules applicables, pas 7. Attendu corrigé à 20%.
- [x] `pedagogyComponents.test.tsx` — **cause racine partagée avec 2 autres suites** : le mock
  global `src/__mocks__/react-native.ts` n'implémentait pas `AccessibilityInfo.addEventListener`,
  utilisé par `useReducedMotion` (hook créé cette session). `TypeError` faisait planter tout
  rendu de composant animé. Ajouté au mock : `addEventListener: jest.fn().mockReturnValue({
  remove: jest.fn() })`.
- [x] `ExerciseScreens.test.tsx` — deux causes distinctes :
  - Le mock `expo-router` renvoie `useLocalSearchParams() → {}` par défaut, donc `identity.id`
    (mocké à `'college'`) pilote seul le mode phrase_types via `PHRASE_MODE_BY_AUDIENCE`
    (`primary`→blanks, `college`→tiles, `lycee`/`adult`→free). 4 tests supposaient "college =
    blanks" (faux depuis l'introduction de ce dispatch par public) → basculés sur une identité
    `primary` dédiée pour tester réellement le mode blanks.
  - Le bouton retour de `ReadingScreen` n'affiche plus le texte "Retour" mais une icône `‹` avec
    `accessibilityLabel="Retour"` (passe accessibilité de cette session) → test basculé de
    `getByText` à `getByLabelText`.
- [x] `uiComponents.test.tsx` — importait le `DashboardCard` supprimé (mort, 0 import ailleurs).
  Import + bloc de tests retirés.
- [x] `wordGameCards.test.tsx` — importait l'ancien `DialogueCard` (scindé en
  `DialogueReaderCard`/`DialogueQuestionCard` cette session). Import et tests séparés en 2
  `describe` correspondant aux 2 nouveaux composants.
- **Vérifié** : `npx jest --silent` → **49/49 suites, 919/919 tests, 0 échec**. `tsc`/`eslint`
  re-confirmés après coup : 134 problèmes constants, tous dans `__tests__`/`__mocks__`, 0 dans le
  code de prod (pas de régression introduite par ces corrections de tests).

**Reste (hors scope de cette passe, à clarifier si besoin) :**
- Le message de l'utilisateur mentionnait "tous les types de tests unitaire" — cette passe a
  remis à zéro les suites *existantes*, pas ajouté de couverture nouvelle. À voir si l'objectif
  est d'étendre la couverture au-delà du fait de faire repasser l'existant.
- Erreurs `tsc` préexistantes dans des fichiers `__tests__` non liées à ce travail (props
  manquantes sur des mocks de composants, `stateHooks.test.ts`, `testUtils.tsx`) — non corrigées,
  n'empêchent pas Jest de tourner (Babel, pas tsc), hors scope de "faire passer les tests".

---

## Vérifications post-nettoyage

- `npx tsc --noEmit` : aucune nouvelle erreur (les seules erreurs restantes sont dans des fichiers de test, préexistantes avant cette passe).
- `npx eslint src app --ext .ts,.tsx --max-warnings 0` : aucune nouvelle erreur (avertissements `any`/`unused` préexistants dans des fichiers de test uniquement).
- Grep de confirmation : zéro référence restante à un des fichiers/dossiers supprimés ou déplacés (`migrations_v2`, `badgeHelper`, `RecentActivityCard`, `RecentModuleCard`, `useButtonPressAnimation`, `ErrorDetailView`, `ErrorModuleCard`, `VocabSection`, `useAdvancedErrorAnalysis`, `AiTutorCardStyles`, `familySelectionHelper`, `DatabaseContext`).
- Rien n'a été committé — tout est dans le working tree, à toi de valider avant `git add`/commit.

---

## 13. Nettoyage ESLint complet — 134 → 0 problème

Suite directe de la section 12 : l'utilisateur a demandé si les 134 problèmes ESLint restants
(tous dans `__tests__`/`__mocks__`, 0 en prod) pouvaient être corrigés plutôt que laissés de côté.

- [x] **5 erreurs `no-require-imports`** — 4 fichiers de mock Jest (`__mocks__/@expo/vector-icons.ts`,
  `expo-linear-gradient.ts`, `react-native-reanimated.ts`, `react-native-safe-area-context.ts`)
  utilisaient `const X = require(...)`. Convertis en `import` ES6 — le mapping `react-native` reste
  correctement résolu via `moduleNameMapper` dans `jest.config.js`, aucun changement de comportement.
- [x] **6 warnings unused-vars / eslint-disable inutiles** — imports/variables jamais utilisés
  (`fireEvent`, `flushPromises`, `makeStates` — ce dernier remplacé par
  `ReturnType<typeof useGameState>` directement, plus précis) et 2 commentaires `eslint-disable`
  qui ne désactivaient plus rien.
- [x] **123 warnings `no-explicit-any`** — traités fichier par fichier, en 2 catégories :
  1. **Cast inutile** (la majorité) : l'objet passé correspondait déjà structurellement au type
     attendu (souvent parce que le type de la prop est fait de champs optionnels, ex.
     `SentenceData`, `LogicQuestion`, `RephrasingQuestion`) — `as any` supprimé sans remplacement.
  2. **Cast réellement nécessaire** (mocks partiels type `db = { getAllAsync: jest.fn() }` ne
     couvrant pas toute l'API `SQLiteDatabase`, ou état de test volontairement invalide comme
     `currentQuestion: null`) — remplacé par `as unknown as <TypeRéel>`, qui documente précisément
     ce qui est simulé au lieu de désactiver complètement la vérification de type.
  - Au passage, `VocabularyScreen`/`WordGamesScreen` dans `ExerciseScreens.test.tsx` recevaient
    encore des props `route`/`navigation` héritées de l'ancienne API react-navigation — ces écrans
    n'acceptent plus aucune prop depuis la standardisation `useLocalSearchParams()` de la section 1.
    Props (et les 2 constantes `mockRoute`/`mockNavigationProp` devenues mortes) supprimées ; ça a
    aussi éliminé au passage des erreurs `tsc` préexistantes sur ces mêmes lignes.
- **Vérifié** : `npx eslint src app --ext .ts,.tsx --max-warnings 0` → **0 problème** (contre 134
  au départ). `npx jest --silent` → 49/49 suites, 919/919 tests toujours au vert (aucune régression
  de comportement, uniquement des changements de type au niveau test). `npx tsc --noEmit` → les
  seules erreurs restantes sont des erreurs préexistantes déjà documentées section 12 (props
  `attemptCount`/`maxAttempts` manquantes sur des mocks `SyntaxMasterCard`/`RephrasingCard`/
  `SentenceFusionCard`, non liées à `any` et hors scope de ce nettoyage).

---

## 14. Pyramide de tests complète : intégration réelle + E2E

Demande explicite : après le nettoyage ESLint, l'utilisateur a demandé les "vrais" types de tests
(unitaire fait, intégration, e2e) plutôt que de s'arrêter aux tests unitaires/composants déjà en
place. Deux couches ajoutées.

### 14.1 Intégration réelle (SQLite en mémoire, pas de mock)

- **Constat de départ** : `src/__tests__/integration/queries.test.ts` (74 tests) mocke
  `db.getAllAsync`/`runAsync` et vérifie seulement "la bonne chaîne SQL a été appelée" — aveugle à
  une regression dans le SQL lui-même (seed cassé, migration invalide, colonne manquante). Utile et
  rapide, mais ce n'est pas de l'intégration.
- **`better-sqlite3` écarté** : nécessite une compilation native (node-gyp), pas de Visual Studio
  Build Tools installé sur cette machine, échec de compilation. Remplacé par **`sql.js`** (SQLite
  compilé en WASM, zéro dépendance native) — `npm install --save-dev sql.js @types/sql.js
  --legacy-peer-deps` (le `--legacy-peer-deps` était nécessaire à cause d'un conflit non lié dans
  l'arbre `@radix-ui`/`expo-router`, sans impact vérifié : `jest`/`tsc`/`eslint` inchangés après).
  Au passage, `--legacy-peer-deps` a aussi formalisé `@expo-google-fonts/inter` dans
  `package.json` (déjà utilisé dans `app/_layout.tsx`, mais jamais déclaré — dépendance fantôme
  préexistante, corrigée sans effet de bord).
- [x] **`src/__tests__/testUtils/realDb.ts`** — adaptateur qui expose l'API async d'`expo-sqlite`
  (`execAsync`/`runAsync`/`getAllAsync`/`getFirstAsync`/`withTransactionAsync`/`closeAsync`)
  par-dessus l'API synchrone de `sql.js`. `createMigratedRealDb()` fait tourner les 6 vraies
  migrations du projet (`001` à `006`, via le vrai `MigrationRunner`) sur cette DB avant de la
  retourner — donc le schéma + le seed testés sont exactement ceux de production, pas une
  reconstruction manuelle.
- [x] **`src/__tests__/integration/realDb.test.ts`** (13 tests) — DB réelle de bout en bout :
  - les 6 migrations s'exécutent et s'enregistrent sans erreur ;
  - `assessment`/`grammar` sont bien absents après leurs migrations de suppression respectives ;
  - les 4 identités de branding + palettes sont seedées ;
  - `connector` disponible uniquement lycée/adulte (1-4), absent primaire/collège — vérifié via
    `getAvailableModules`/`isModuleAvailable` contre les vraies données `module_availability` ;
  - flux complet famille → contenu → progression → agrégation multi-sous-familles, avec de vraies
    contraintes SQL (NOT NULL, UNIQUE, INSERT OR REPLACE) qui s'appliquent pour de vrai.
- 🐛 **Bug réel trouvé par cette couche, invisible aux mocks** : `insertFamily()` dans
  `queries.ts` insérait dans `families` sans jamais fournir `slug`, colonne `NOT NULL UNIQUE` du
  schéma (l'interface `Family` elle-même n'a pas de champ `slug`). Le test mocké de
  `queries.test.ts` passait quand même, puisqu'il vérifiait juste "runAsync a été appelé avec la
  bonne chaîne" sans jamais exécuter le SQL. Vérification : **zéro appelant** en prod
  (`insertFamily` n'était appelée nulle part dans `src`/`app`). Code mort et cassé → supprimé de
  `queries.ts`, son test mocké retiré de `queries.test.ts`, `realDb.test.ts` seed les familles de
  test en SQL direct à la place (comme le fait la vraie migration 002).
- **Vérifié** : `npx jest --silent` → 50 suites, 931 tests (919 + 13 nouveaux − 1 test
  `insertFamily` supprimé). `tsc`/`eslint` inchangés (0 nouveau problème).

### 14.2 End-to-end (Maestro, sur émulateur Android réel)

- **Constat d'environnement** (à vérifier à nouveau si cette session est relancée sur une autre
  machine — rien de tout ça n'est garanti ailleurs) : cette machine a, de façon inattendue, tout ce
  qu'il faut pour de l'E2E réel sans compte développeur : Maestro CLI déjà installé
  (`C:\Users\khi_h\.maestro\bin\maestro`, v1.41.0), Android SDK complet avec un AVD existant
  (`Medium_Phone_API_36.0`), et un JDK 21 fourni par Android Studio
  (`C:\Program Files\Android\Android Studio\jbr`). Le dossier `android/` (prebuild Expo) existait
  déjà dans le repo.
- [x] **Build local de l'APK debug** — `android/local.properties` créé avec `sdk.dir` (piège
  Windows : les backslashes simples cassent le parsing du fichier `.properties`, utiliser des
  slashes avant `C:/Users/...`). `cd android && ./gradlew.bat assembleDebug` avec
  `JAVA_HOME` pointé vers le JBR — succès en ~8 min (cold build), APK dans
  `android/app/build/outputs/apk/debug/app-debug.apk`.
- [x] **Émulateur + Metro + install** — AVD démarré (`emulator -avd Medium_Phone_API_36.0`), APK
  installé via `adb install -r`, bundler lancé (`npx expo start --android`), `adb reverse
  tcp:8081 tcp:8081` pour le port forwarding. L'app tourne réellement, bundle JS servi par Metro.
- [x] **`.maestro/smoke_onboarding.yaml`** — premier flow E2E : lancement avec état vidé →
  onboarding → saisie prénom → dashboard. Deux vrais bugs de flow trouvés et corrigés en testant
  contre l'émulateur réel (pas en écrivant le YAML à l'aveugle) :
  1. `extendedWaitUntil` nécessaire après `launchApp: clearState: true` — un cold start après
     effacement de l'état force un re-téléchargement complet du bundle Metro, largement plus long
     que le timeout implicite par défaut.
  2. Le sélecteur Maestro est un **regex qui doit matcher toute la chaîne** (pas une recherche de
     sous-chaîne) — `visible: "Bienvenue sur Joud"` échouait car le texte réel est
     `"Bienvenue sur Joud !"` (point d'exclamation inclus). Corrigé en `".*Bienvenue sur Joud.*"`.
     Diagnostiqué via `maestro hierarchy` (dump de l'arbre d'accessibilité réel de l'écran), pas
     en devinant.
- **Flow validé de bout en bout sur l'émulateur, capture d'écran à l'appui** : nouveau profil
  "Alex" créé, audience par défaut "Joud Collège" appliquée, dashboard vierge cohérent
  ("Commencer l'aventure — Choisis ton premier exercice !", "Pas de révisions").
- [x] **`npm run e2e`** ajouté (`maestro test .maestro`) — lance tous les flows du dossier.
- **Reste (pas fait)** :
  - Un seul flow existe (onboarding → dashboard). Pas encore de flow pour un exercice complet
    (sélection module → niveau → famille → validation → progression sauvegardée), ni pour les
    4 publics, ni pour l'IA (BYOK).
  - Le flow n'a été exécuté que manuellement dans cette session, pas branché sur un pipeline CI —
    il n'y a pas de CI/CD dans ce projet (constat déjà fait section précédente).
  - Avertissements Metro à noter au passage (pas corrigés, hors scope) : plusieurs paquets
    n'étaient pas à la version attendue pour Expo SDK 54 (`expo@54.0.34` vs `~54.0.36`,
    `expo-router@6.0.22` vs `~6.0.24`, `expo-localization@17.0.8` vs `~17.0.9`,
    `jest@30.2.0` vs `~29.7.0` attendu par `jest-expo`, `@types/jest@30.0.0` vs `29.5.14`).
    `npx expo install --check` réglerait ça mais n'a pas été lancé pour ne pas mélanger ce
    chantier avec une mise à jour de dépendances non demandée.
