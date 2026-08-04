# Comment builder Joud par public (et par langue)

Ce doc explique concrètement comment lancer un build pour un public donné, et où en est le
sujet "langue" — à lire avant tout `eas build`. Pour la checklist légale/comptes/stores, voir
`BeforePublish.pdf` (même dossier).

## Le principe : un build = un public verrouillé

Joud est white-label : un seul code source, 4 publics possibles (`primary`, `college`, `lycee`,
`adult`). Un build de production cible **toujours un seul public**, jamais les 4 en même temps —
chaque public devient une fiche store séparée (nom, icône, bundle ID différents).

Le verrouillage se fait via la variable d'environnement `EXPO_PUBLIC_LOCKED_AUDIENCE`, lue par
`app.config.js` et par `src/contexts/UserContext.tsx`. Sans cette variable (dev normal), l'app
n'est pas verrouillée — mais il n'y a plus de sélecteur dans l'interface pour changer de public à
la main (retiré cette session) : le public par défaut en dev est `college`.

## Builder pour un public précis

### Avec EAS (production réelle)

Les 4 profils sont déjà prêts dans `eas.json` :

```bash
eas build --profile production-primary --platform android
eas build --profile production-college --platform android
eas build --profile production-lycee   --platform android
eas build --profile production-adult   --platform android
```

Remplacer `--platform android` par `--platform ios` pour iOS, ou `--platform all` pour les deux.
Chaque profil fixe automatiquement `EXPO_PUBLIC_LOCKED_AUDIENCE` dans son `env` (voir `eas.json`)
— pas besoin de la passer à la main.

**Prérequis avant le premier vrai build EAS** (pas encore fait à ce jour) :
- `eas login`
- Configurer les credentials de signature (`eas credentials`) — génère un vrai keystore Android
  de production (actuellement le projet utilise encore le keystore de debug en local)
- Un compte Expo/EAS (gratuit pour commencer, quotas de build limités sur le plan gratuit)

### En local, pour tester un public sans build EAS

Utile pour vérifier visuellement un public avant de lancer un vrai build (rapide, sur émulateur
ou appareil connecté) :

```bash
EXPO_PUBLIC_LOCKED_AUDIENCE=primary npx expo start --android
```

(`college`, `lycee`, `adult` fonctionnent pareil). Ça lance le serveur Metro avec le public
verrouillé — le profil se comporte exactement comme le ferait le build de prod correspondant
(nom, verrouillage de l'audience, masquage du Tuteur IA sur `primary`, etc.), sans passer par un
vrai build natif.

Pour juste vérifier la config générée (nom, slug, bundle ID) sans rien lancer :

```bash
EXPO_PUBLIC_LOCKED_AUDIENCE=primary npx expo config --type public
```

## Faire tester l'app à des gens (avant tout store)

Pas besoin d'attendre la publication pour faire installer l'app sur de vrais téléphones. EAS
Build propose une **distribution interne** : ça génère un `.apk` (Android) directement
installable, avec un lien de téléchargement + QR code partageable par WhatsApp/mail/Drive.
Aucun compte Google Play ni Apple requis pour ça — juste un compte Expo/EAS gratuit.

Deux profils de test sont prêts dans `eas.json`, un par public ayant du contenu réel
aujourd'hui (Primaire, Collège — Lycée/Adulte n'ont pas encore de contenu, pas la peine de les
tester pour l'instant) :

```bash
eas login                                            # une seule fois, compte Expo gratuit
eas build --profile test-primary --platform android
eas build --profile test-college --platform android
```

Le build se lance sur les serveurs Expo (quelques minutes), puis un lien apparaît dans le
terminal (et sur [expo.dev](https://expo.dev) une fois connecté) — c'est ce lien à envoyer aux
testeurs. Sur leur téléphone Android, ils cliquent, téléchargent le `.apk`, et l'installent
(Android demande d'autoriser "sources inconnues" la première fois, c'est normal pour un `.apk`
hors Play Store).

**iOS n'est pas possible avec cette méthode** : Apple exige un compte développeur (99$/an,
`eas credentials` + `eas build --platform ios`) même pour un simple test ad-hoc ou TestFlight —
ce n'est pas une limite technique de ce doc, juste une dépendance externe pas encore mise en
place. Tant que ce compte n'existe pas, les tests restent Android uniquement.

**Accès des testeurs** : ces builds de test donnent accès à tout le contenu de l'app, sans
restriction — il n'existe aujourd'hui aucun mécanisme de limite (temps, contenu, essai) dans le
code, c'est un choix assumé pour cette phase (voir `BeforePublish.pdf` pour le contexte).

### Ce que chaque public change concrètement

| Public     | Nom affiché      | Slug            | Bundle ID / Package                  |
|------------|------------------|-----------------|---------------------------------------|
| (aucun)    | Joud             | Joud            | `com.hamdanek.Joud`                   |
| `primary`  | Joud Primaire    | joud-primaire   | `com.hamdanek.Joud.primary`           |
| `college`  | Joud Collège     | joud-college    | `com.hamdanek.Joud.college`           |
| `lycee`    | Joud Lycée       | joud-lycee      | `com.hamdanek.Joud.lycee`             |
| `adult`    | Joud Adulte      | joud-adulte     | `com.hamdanek.Joud.adult`             |

Bundle ID/package différents par public = obligatoire pour publier 4 fiches distinctes sur les
stores (Apple/Google n'acceptent pas deux apps avec le même identifiant).

### Images de l'app (icône, icône Android, splash)

Les fichiers actuels dans `assets/` (montgolfière blanche sur fond bleu `#348fe2`) sont **des
images de dépannage** — posées pour avoir une vraie identité visuelle pendant la phase de test,
pas forcément la version finale. Elles sont pensées pour être remplacées facilement, sans toucher
au code : même nom de fichier, mêmes dossiers, le prochain build les reprend automatiquement.

Specs à respecter si on les change :

| Fichier                        | Rôle                                   | Taille          | Transparence |
|---------------------------------|-----------------------------------------|------------------|--------------|
| `assets/icon.png`               | Icône principale (iOS + fallback)       | 1024×1024 px     | **Non** — fond opaque plein cadre (Apple rejette l'alpha sur cette icône) |
| `assets/adaptive-icon.png`      | Icône Android — couche "dessin" only    | 1024×1024 px     | **Oui** — juste la forme, fond transparent ; garder le dessin dans le carré central ~66% (~672×672 px), Android découpe le reste selon le launcher |
| `assets/splash-icon.png`        | Écran de démarrage natif                | 1024×1024 px mini (1200×1200 pour rester net sur grand écran) | Selon le visuel — peut remplir tout le cadre comme aujourd'hui |
| `assets/favicon.png`            | Icône navigateur (web, usage mineur)    | 48×48 px         | Peu importe |

Deux couleurs de fond à garder cohérentes avec les images si elles changent, dans
`app.config.js` :
- `splash.backgroundColor` (actuellement `#348fe2`) — visible en letterboxing sur les écrans non
  carrés
- `android.adaptiveIcon.backgroundColor` (actuellement `#348fe2`) — le fond derrière le dessin
  transparent de `adaptive-icon.png`. **Piège déjà rencontré** : si le dessin de
  `adaptive-icon.png` est blanc et que ce fond reste blanc aussi, l'icône Android devient
  invisible — toujours vérifier que les deux contrastent.

**Icônes par public (optionnel, pas encore fait)** : le code cherche automatiquement
`assets/icon-primary.png`, `assets/icon-college.png`, `assets/icon-lycee.png`,
`assets/icon-adult.png` (mêmes specs que `icon.png` ci-dessus). Tant qu'ils n'existent pas, les 4
builds utilisent `assets/icon.png`. Dès qu'un fichier `assets/icon-<public>.png` est ajouté, il
est pris automatiquement au prochain build — rien d'autre à changer dans le code.

## Et la langue, dans tout ça ?

**Il n'existe aujourd'hui qu'une seule langue/paire de langues : `fr-en`** (français → anglais).
Il n'y a **aucun mécanisme de verrouillage par langue** comparable à
`EXPO_PUBLIC_LOCKED_AUDIENCE` — pas de variable d'environnement, pas de sélecteur, rien à
configurer au build.

Ce qui existe déjà en base, en prévision d'un futur modèle multi-langue (mais pas branché à un
système de build) :
- Le contenu (`content`) et le profil utilisateur ont une colonne `course` (ex. `'fr-en'`)
- `src/contexts/UserContext.tsx` initialise chaque profil avec `course: 'fr-en'` en dur

**Concrètement aujourd'hui : impossible de builder une variante dans une autre langue.** Le jour
où une deuxième paire de langues (ex. `fr-ar`, `fr-es`) sera ajoutée, il faudra probablement
répliquer le même principe que pour l'audience : une variable d'environnement
`EXPO_PUBLIC_LOCKED_COURSE`, un profil EAS par combinaison public × langue, et du contenu réel
traduit en base pour cette paire de langues. Rien de tout ça n'est fait — à concevoir le moment
venu.

## Résumé rapide

- **Public** : 4 builds possibles dès aujourd'hui, mécanisme complet et fonctionnel, juste les
  icônes à fournir et le premier vrai build EAS à faire.
- **Langue** : une seule langue existe (`fr-en`), aucun système de build par langue n'existe —
  ce n'est pas une option manquante, c'est un système entier à construire plus tard.
