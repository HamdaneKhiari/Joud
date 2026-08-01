# Joud

App d'apprentissage de l'anglais, white-label, React Native / Expo SDK 54.

4 publics : `primary` (primaire), `college`, `lycee`, `adult`. Une seule base de code — le
public change le contenu affiché et, en build de production, le nom/bundle/icône de l'app
(voir [Builds verrouillés par public](#builds-verrouillés-par-public)).

Pour l'historique détaillé des décisions (pourquoi telle architecture, quels bugs ont été
trouvés et comment), voir `task.md` — ce README ne documente que le "comment faire", pas le
"pourquoi historique".

## Stack

- Expo Router (routing par fichiers)
- SQLite local (`expo-sqlite`) — contenu + progression, migrations versionnées
- AsyncStorage — cache UI (progression rapide, préférences)
- expo-secure-store — clé API IA de l'utilisateur (BYOK)

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

Un build de production correspond à **un seul public verrouillé** (l'utilisateur ne peut pas
changer d'audience dans l'app). C'est piloté par la variable d'environnement
`EXPO_PUBLIC_LOCKED_AUDIENCE`, inlinée dans le bundle par Metro au moment du build.

- **`app.config.js`** lit `EXPO_PUBLIC_LOCKED_AUDIENCE` et calcule dynamiquement `name`, `slug`,
  `ios.bundleIdentifier`, `android.package` et l'icône (`assets/icon-<audience>.png`, avec repli
  sur `assets/icon.png` si le fichier spécifique n'existe pas encore).
- **`eas.json`** définit un profil de build par public : `production-primary`,
  `production-college`, `production-lycee`, `production-adult`, chacun fixant
  `EXPO_PUBLIC_LOCKED_AUDIENCE` dans son `env`.
- **`src/contexts/UserContext.tsx`** lit la même variable : si elle correspond à un public
  valide, `user.audience` est forcé à cette valeur, `updateAudience()` devient un no-op, et
  `isAudienceLocked` (exposé par le contexte) passe à `true` — ce qui masque le sélecteur de
  public dans `app/(tabs)/settings.tsx`.
- Sans la variable (dev, `npx expo start`, profils `development`/`preview` d'EAS), le
  comportement est inchangé : toutes les audiences restent sélectionnables dans les Réglages.

### Lancer un build

```bash
eas build --profile production-primary --platform android
# idem avec production-college / production-lycee / production-adult, et --platform ios
```

Vérifier localement la config générée pour un public donné, sans lancer de vrai build :

```bash
EXPO_PUBLIC_LOCKED_AUDIENCE=primary npx expo config --type public
```

### Ce qui n'est pas encore prêt côté publication

- **Jamais testé sur un vrai serveur EAS** — seule la génération de config a été vérifiée
  localement (`npx expo config`), pas un build réel bout en bout.
- Icônes/splash par public : la structure (`assets/icon-<audience>.png`) est prête, les
  fichiers eux-mêmes ne sont pas encore fournis pour les 4 publics.
- Pas de politique de confidentialité (obligatoire sur les deux stores, particulièrement
  sensible pour le public Primaire — enfants).
- Comptes développeur App Store Connect / Google Play Console et credentials EAS côté serveur
  à configurer (`eas login`).
- Jamais testé en build de production réel sur device (seulement Expo Go / dev client), jamais
  testé sur iOS.
