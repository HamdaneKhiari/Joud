# Joud

App d'apprentissage de l'anglais, white-label, React Native / Expo SDK 54.

4 publics : `primary` (primaire), `college`, `lycee`, `adult`. Une seule base de code — le
public change le contenu affiché et, en build de production, le nom/bundle/icône de l'app.
Comment builder pour un public donné : voir [docs/HOWTOPUBLISH.md](docs/HOWTOPUBLISH.md).

Pour l'historique détaillé des décisions (pourquoi telle architecture, quels bugs ont été
trouvés et comment), voir `task.md` — ce README ne documente que le "comment faire", pas le
"pourquoi historique". Pour la checklist avant publication réelle sur les stores (politique de
confidentialité, comptes développeur...), voir [docs/BeforePublish.pdf](docs/BeforePublish.pdf).

## Stack

- Expo Router (routing par fichiers)
- SQLite local (`expo-sqlite`) — contenu + progression, migrations versionnées
- AsyncStorage — cache UI (progression rapide, préférences)
- expo-secure-store — clé API IA de l'utilisateur (BYOK)
- expo-audio — lecture audio (prononciation, dialogues) ; synthèse vocale via `expo-speech` en
  repli quand aucun fichier audio n'est fourni pour un mot/une phrase
- Tuteur IA (BYOK, `OpenAI`/`Mistral`/`Claude`) — optionnel, réservé à collège/lycée/adulte,
  jamais accessible sur le public primaire (enfants) ; voir `src/hooks/useBlockPrimaryAudience.ts`

## Développement

```bash
npm install
npx expo start
```

Avant de commit, la discipline du projet est : `tsc` + tests + lint à zéro.

```bash
npx tsc --noEmit
npx jest --silent
npx eslint src app --ext .ts,.tsx --max-warnings 0
```

## Ajouter ou modifier du contenu

Tout le contenu (mots de vocabulaire, dialogues, exercices, labels...) vit dans la table
`content` de SQLite, peuplée par des **migrations**, pas par des fichiers statiques chargés à
l'exécution. Pour ajouter ou corriger du contenu, on écrit une nouvelle migration — jamais une
modification directe des migrations déjà exécutées en production.

### Étapes

1. **Créer le fichier** `src/database/migrations/0XX_description_courte.ts` (numéro suivant le
   dernier existant — voir `ls src/database/migrations/`).
2. **Écrire la migration** avec `createMigration(version, name, up, down?)` (voir
   `src/database/migrations/runner.ts`). `up` reçoit la `SQLiteDatabase` et fait ses
   `execAsync`/`runAsync`.
   - Pour un import de contenu volumineux : voir
     `007_seed_real_content.ts` (structure des seeds : familles, labels de sous-familles,
     contenu par item).
   - Pour un backfill ciblé sur des données existantes : voir
     `010_backfill_vocab_example_translation.ts` (correction a posteriori d'un champ vide).
3. **Enregistrer la migration à deux endroits** (obligatoire, sinon elle ne tourne jamais) :
   - `src/database/init.ts` — import + ajout dans le tableau `migrations` (ordre croissant).
   - `src/__tests__/testUtils/realDb.ts` — même ajout dans `migrationModules`, pour que les
     tests d'intégration tournent contre un schéma identique à la production.
4. **Vérifier** : `npx tsc --noEmit && npx jest --silent`. Les migrations sont idempotentes
   (`schema_migrations` trace ce qui a déjà tourné) — un utilisateur qui a déjà l'app installée
   ne rejoue que les nouvelles migrations au prochain lancement.

### Où sont les données sources

Les fichiers Excel d'où vient le contenu importé sont dans `src/data/` (ex.
`validation_finale_4tranches_v2.xlsx`). Un script d'import ponctuel (Node, exécuté une fois
pour générer une migration de seed) n'est pas commité par nature — la migration générée l'est.
Si un script d'import est nécessaire, l'écrire dans le scratchpad et ne committer que son
résultat (la migration).

Lycée et Adulte n'ont quasiment aucun contenu réel pour l'instant (travail séparé, en cours).

## Builds verrouillés par public

Un build de production correspond à **un seul public verrouillé** (audience fixée une fois pour
toutes au build, pas de sélecteur dans l'app — retiré une fois les tests internes terminés).
Piloté par la variable d'environnement `EXPO_PUBLIC_LOCKED_AUDIENCE`, inlinée dans le bundle par
Metro au moment du build. Sans cette variable (dev normal via `npx expo start`), l'app démarre
sur le public `college` par défaut — pour tester un autre public en dev, voir
[docs/HOWTOPUBLISH.md](docs/HOWTOPUBLISH.md).

### Ce qui n'est pas encore prêt côté publication

- **Jamais buildé via un vrai serveur EAS** — seule la génération de config a été vérifiée
  localement (`npx expo config`), jamais un `eas build` bout en bout.
- Icônes/splash par public : la structure (`assets/icon-<audience>.png`) est prête, les
  fichiers eux-mêmes ne sont pas encore fournis pour les 4 publics.
- Comptes développeur App Store Connect / Google Play Console et credentials EAS côté serveur
  à configurer (`eas login`).
- Jamais testé sur un vrai téléphone, ni sur iOS (émulateur Android uniquement à ce jour).
- Politique de confidentialité : un brouillon technique existe
  ([docs/BeforePublish.pdf](docs/BeforePublish.pdf)), pas encore validé ni publié.

Checklist complète : [docs/BeforePublish.pdf](docs/BeforePublish.pdf).
