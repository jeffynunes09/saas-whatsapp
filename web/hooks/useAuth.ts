'use client';

import { useState } from 'react';
import { authService } from '@/services/authService';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.login(email, password);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao fazer login';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      return await authService.register(email, password, name);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao cadastrar';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => authService.logout();

  return { login, register, logout, loading, error };
}
