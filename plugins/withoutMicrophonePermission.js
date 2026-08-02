/**
 * expo-audio déclare RECORD_AUDIO dans son propre AndroidManifest.xml natif (pour la partie
 * enregistrement de la lib), même si l'app ne fait que de la lecture (prononciation, dialogues)
 * — recordAudioAndroid: false (config du plugin expo-audio) ne suffit pas à l'empêcher, car le
 * merger de manifeste Android réinjecte quand même la permission déclarée par la librairie.
 *
 * Seule façon de vraiment la retirer : un override explicite tools:node="remove" dans le
 * manifeste de l'app, qui a priorité sur toute déclaration venant d'une lib dépendante.
 * Particulièrement important pour une app destinée aux enfants — une permission microphone
 * injustifiée est un signal négatif à la review store et pour la confiance utilisateur.
 */
const { withAndroidManifest } = require('expo/config-plugins');

const TOOLS_NS = 'http://schemas.android.com/tools';

const withoutMicrophonePermission = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    manifest.$['xmlns:tools'] = TOOLS_NS;

    if (!Array.isArray(manifest['uses-permission'])) {
      manifest['uses-permission'] = [];
    }

    const alreadyPresent = manifest['uses-permission'].some(
      (perm) => perm.$['android:name'] === 'android.permission.RECORD_AUDIO'
    );

    if (!alreadyPresent) {
      manifest['uses-permission'].push({
        $: {
          'android:name': 'android.permission.RECORD_AUDIO',
          'tools:node': 'remove',
        },
      });
    }

    return config;
  });
};

module.exports = withoutMicrophonePermission;
