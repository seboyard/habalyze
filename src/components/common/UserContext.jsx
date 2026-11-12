import { db } from '@/api/base44Client';
import React, { createContext, useContext, useState, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const refreshUser = async () => {
    try {
      const currentUser = await db.auth.me();
      setUser(currentUser);
      return currentUser;
    } catch (e) {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const updateUser = async (data) => {
    await db.auth.updateMe(data);
    return await refreshUser();
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}