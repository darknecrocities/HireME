import { useState } from 'react';

export interface UserProfile {
  fullName: string;
  bday: string;
  occupation: string;
  email: string;
  createdAt: string;
}

export function useProfile() {
  const [profile] = useState<UserProfile | null>({
    fullName: 'Offline User',
    bday: '1995-01-01',
    occupation: 'Lead AI Engineer',
    email: 'offline@hireme.local',
    createdAt: new Date().toISOString()
  });
  const [loading] = useState(false);

  return { profile, loading };
}
