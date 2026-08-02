import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

/**
 * Le Tuteur IA (BYOK, envoie les messages à un provider tiers) est réservé à
 * collège/lycée/adulte — jamais au public primaire (enfants). Le Dashboard masque déjà la
 * carte d'entrée, mais ça ne protège pas un accès direct par route (/ai-tutor/*, /settings-ai).
 * À appeler en tout début des écrans concernés : renvoie true tant que la redirection est en
 * cours (l'appelant doit alors ne rien rendre).
 */
export const useBlockPrimaryAudience = (): boolean => {
  const { user } = useUser();
  const router = useRouter();
  const blocked = user?.audience === 'primary';

  useEffect(() => {
    if (blocked) {
      router.replace('/');
    }
  }, [blocked, router]);

  return blocked;
};
