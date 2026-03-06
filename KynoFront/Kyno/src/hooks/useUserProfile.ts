import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/src/services/api';
import type { User } from '@/src/types';

export function useUserProfile(userId: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await apiClient.get(`/api/users/${userId}`);
        setUser(res.data);
      } catch {
        // fallback silencieux
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  return { user, isLoading };
}
