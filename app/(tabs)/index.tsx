import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import Dashboard from '../../src/screens/Dashboard/Dashboard';

export default function Page() {
  const router = useRouter();
  const { isOnboarded, loading } = useUser();

  useEffect(() => {
    if (!loading && !isOnboarded) {
      router.replace('/onboarding');
    }
  }, [loading, isOnboarded, router]);

  if (!isOnboarded) return null;

  return <Dashboard />;
}