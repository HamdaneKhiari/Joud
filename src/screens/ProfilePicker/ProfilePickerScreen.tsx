// "Qui joue ?" — sélection/gestion des profils (multi-enfants sur le même appareil,
// même public). Affiché au lancement si plusieurs profils existent, ou depuis les
// réglages ("Changer / gérer les profils") à tout moment.
import { log } from '@/utils/logUtils';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';
import { baseColors } from '@/themes/colors';

const AVATAR_COLORS = [baseColors.blue500, '#F39C12', '#9B59B6', '#1ABC9C'];

function avatarColorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const ProfilePickerScreen: React.FC = () => {
  const router = useRouter();
  const { profiles, user, switchProfile, addProfile, canAddProfile, acknowledgeProfilePicked } =
    useUser();

  const [addingProfile, setAddingProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToDashboard = () => {
    acknowledgeProfilePicked();
    router.replace('/');
  };

  const handlePick = (id: string) => {
    switchProfile(id);
    goToDashboard();
  };

  const handleAddProfile = async () => {
    if (!newName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addProfile(newName.trim());
      goToDashboard();
    } catch (e) {
      log.error('[ProfilePicker] addProfile error:', e);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>Qui joue ?</Text>
        <Text style={styles.subtitle}>Choisis ton profil</Text>

        {addingProfile ? (
          <View style={styles.addForm}>
            <TextInput
              style={styles.nameInput}
              placeholder="Prénom..."
              placeholderTextColor={baseColors.gray400}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={handleAddProfile}
              autoCapitalize="words"
              autoCorrect={false}
              accessibilityLabel="Prénom du nouveau profil"
            />
            <TouchableOpacity
              style={[styles.primaryButton, !newName.trim() && styles.buttonDisabled]}
              onPress={handleAddProfile}
              disabled={!newName.trim() || isSubmitting}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isSubmitting ? 'Création...' : 'Créer le profil'}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Création...' : 'Créer le profil'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddingProfile(false)} style={styles.cancelLink}>
              <Text style={styles.cancelLinkText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={profiles}
            keyExtractor={(p) => p.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            ListFooterComponent={
              canAddProfile ? (
                <TouchableOpacity
                  style={styles.tile}
                  onPress={() => setAddingProfile(true)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Ajouter un profil"
                >
                  <View style={[styles.avatar, styles.avatarAdd]}>
                    <MaterialCommunityIcons name="plus" size={32} color={baseColors.gray400} />
                  </View>
                  <Text style={styles.tileLabel}>Ajouter</Text>
                </TouchableOpacity>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.tile}
                onPress={() => handlePick(item.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Profil de ${item.firstName || 'sans nom'}`}
              >
                <View style={[styles.avatar, { backgroundColor: avatarColorFor(item.id) }]}>
                  <Text style={styles.avatarText}>
                    {(item.firstName || '?').trim().slice(0, 1).toUpperCase()}
                  </Text>
                  {item.id === user?.id && (
                    <View style={styles.activeBadge}>
                      <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.tileLabel} numberOfLines={1}>
                  {item.firstName || 'Sans nom'}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFC' },
  keyboardView: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: baseColors.gray800,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: baseColors.gray500,
    textAlign: 'center',
    marginBottom: 32,
  },
  grid: { paddingBottom: 24 },
  gridRow: { justifyContent: 'center', gap: 20, marginBottom: 20 },
  tile: { alignItems: 'center', width: 110 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarAdd: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: baseColors.gray200,
    borderStyle: 'dashed',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFF' },
  activeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2ECC71',
    borderWidth: 2,
    borderColor: '#FAFBFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontSize: 15, fontWeight: '600', color: baseColors.gray800, textAlign: 'center' },
  addForm: { alignItems: 'center', paddingTop: 16 },
  nameInput: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: baseColors.gray200,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '500',
    color: baseColors.gray800,
    backgroundColor: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: baseColors.blue500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  primaryButtonText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  cancelLink: { marginTop: 16, padding: 8 },
  cancelLinkText: { fontSize: 15, fontWeight: '600', color: baseColors.gray500 },
});

export default ProfilePickerScreen;
