import { useState, useCallback } from 'react';

type Feature = 'resume' | 'interview';

export function useUsageLimit() {
  const [usage] = useState<Record<Feature, number>>({ resume: 0, interview: 0 });

  const hasReachedLimit = useCallback((_feature: Feature) => {
    return false; // Unlimited access for offline desktop application
  }, []);

  const incrementUsage = useCallback((_feature: Feature) => {
    // No-op
  }, []);

  return { hasReachedLimit, incrementUsage, guestUsage: usage };
}
