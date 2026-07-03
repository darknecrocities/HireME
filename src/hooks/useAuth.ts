import { useState } from 'react';

export function useAuth() {
  // Hardcoded offline developer account to mock active session
  const [user] = useState<any>({
    uid: 'offline-user-uid',
    email: 'offline@hireme.local',
    displayName: 'Offline Developer'
  });
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const login = async () => {};
  const signup = async () => {};
  const logout = async () => {};
  const resetPassword = async () => {};
  const loginWithGoogle = async () => {};

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    loginWithGoogle
  };
}
