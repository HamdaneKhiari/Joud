import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import Dashboard from '../../src/screens/Dashboard/Dashboard';

export default function Page() {
  const router = useRouter();
  const { isOnboarded, loading, profiles, hasPickedProfileThisSession } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!isOnboarded) {
      router.replace('/onboarding');
      return;
    }
    if (profiles.length > 1 && !hasPickedProfileThisSession) {
      router.replace('/profile-picker');
    }
  }, [loading, isOnboarded, profiles.length, hasPickedProfileThisSession, router]);

  if (!isOnboarded) return null;
  if (profiles.length > 1 && !hasPickedProfileThisSession) return null;

  return <Dashboard />;
}