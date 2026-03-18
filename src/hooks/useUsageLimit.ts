import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

type Feature = 'resume' | 'interview';

export function useUsageLimit() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Record<Feature, number>>(() => {
    const saved = localStorage.getItem('guest_usage');
    return saved ? JSON.parse(saved) : { resume: 0, interview: 0 };
  });

  useEffect(() => {
    localStorage.setItem('guest_usage', JSON.stringify(usage));
  }, [usage]);

  const hasReachedLimit = useCallback((feature: Feature) => {
    if (user) return false; // Authenticated users have unlimited access
    return usage[feature] >= 1;
  }, [user, usage]);

  const incrementUsage = useCallback((feature: Feature) => {
    if (user) return; // Don't track for logged in users
    setUsage(prev => ({
      ...prev,
      [feature]: prev[feature] + 1
    }));
  }, [user]);

  return { hasReachedLimit, incrementUsage, guestUsage: usage };
}
