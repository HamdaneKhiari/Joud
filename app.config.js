const fs = require('fs');
const path = require('path');

// EXPO_PUBLIC_LOCKED_AUDIENCE définit le public verrouillé pour ce build (set par profil
// dans eas.json). Non défini = build "toutes identités" (dev, ou preview interne).
const audience = process.env.EXPO_PUBLIC_LOCKED_AUDIENCE || null;

const AUDIENCE_CONFIG = {
  primary: { name: 'Joud Primaire', slugSuffix: 'primaire', idSuffix: 'primary' },
  college: { name: 'Joud Collège',  slugSuffix: 'college',  idSuffix: 'college' },
  lycee:   { name: 'Joud Lycée',    slugSuffix: 'lycee',    idSuffix: 'lycee' },
  adult:   { name: 'Joud Adulte',   slugSuffix: 'adulte',   idSuffix: 'adult' },
};

const cfg = audience ? AUDIENCE_CONFIG[audience] : null;

const BASE_IOS_ID = 'com.hamdanek.Joud';
const BASE_ANDROID_PACKAGE = 'com.hamdanek.Joud';

const appName = cfg ? cfg.name : 'Joud';
const slug = cfg ? `joud-${cfg.slugSuffix}` : 'Joud';
const bundleIdentifier = cfg ? `${BASE_IOS_ID}.${cfg.idSuffix}` : BASE_IOS_ID;
const androidPackage = cfg ? `${BASE_ANDROID_PACKAGE}.${cfg.idSuffix}` : BASE_ANDROID_PACKAGE;
// Un scheme distinct par public évite toute ambiguïté si plusieurs builds sont
// installés en parallèle sur le même appareil de test (chacun a déjà son propre
// bundle ID/package, mais Linking se base sur le scheme, pas sur l'identifiant natif).
const scheme = cfg ? `joud-${cfg.slugSuffix}` : 'joud';

// Icône dédiée si déjà fournie (assets/icon-<audience>.png), sinon fallback sur l'icône générique
// le temps que les déclinaisons par public soient prêtes.
const variantIconPath = cfg ? `./assets/icon-${audience}.png` : null;
const icon = variantIconPath && fs.existsSync(path.join(__dirname, variantIconPath))
  ? variantIconPath
  : './assets/icon.png';

module.exports = {
  expo: {
    name: appName,
    slug,
    scheme,
    version: '1.0.0',
    orientation: 'portrait',
    icon,
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: androidPackage,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-sqlite',
      'expo-localization',
      // recordAudioAndroid: false — l'app ne fait que de la lecture audio (prononciation,
      // dialogues), jamais d'enregistrement. Sans ce flag, le plugin ajoute RECORD_AUDIO par
      // défaut : une permission microphone injustifiée, particulièrement mal vue pour une
      // app destinée aux enfants (review store + confiance utilisateur).
      ['expo-audio', { recordAudioAndroid: false }],
      [
        'expo-secure-store',
        {
          faceIDPermission: "Autorise Face ID pour protéger l'accès à ta clé API IA.",
        },
      ],
    ],
  },
};
