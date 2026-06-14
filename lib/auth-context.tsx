'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from './types';
import { supabase } from './supabase';
import { sbUserRepo, sbAuditRepo } from './supabase-repository';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        if (mounted) setLoading(false);
        return;
      }
      if (session?.user) {
        const profile = await sbUserRepo.getById(session.user.id);
        if (mounted) {
          setUser(profile ?? null);
          setLoading(false);
        }
      } else {
        if (mounted) setLoading(false);
      }
    });

    // Fallback: if onAuthStateChange doesn't fire promptly, resolve loading
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        return { success: false, error: 'Credenciales incorrectas' };
      }
      return { success: false, error: 'Error al iniciar sesión' };
    }
    if (!data.user) return { success: false, error: 'Error al iniciar sesión' };

    const profile = await sbUserRepo.getById(data.user.id);
    if (!profile) return { success: false, error: 'Perfil no encontrado' };
    if (!profile.active) {
      await supabase.auth.signOut();
      return { success: false, error: 'Cuenta desactivada' };
    }

    sbUserRepo.update(profile.id, { lastLogin: new Date().toISOString() }).catch(() => {});

    sbAuditRepo.create({
      userId: profile.id,
      userName: profile.name,
      action: 'LOGIN',
      resource: 'auth',
      ip: '0.0.0.0',
      timestamp: new Date().toISOString(),
    }).catch(() => {});

    // onAuthStateChange will handle setting the user state — don't call setUser here
    return { success: true, role: profile.role };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    if (role === 'admin') {
      return { success: false, error: 'No se puede registrar una cuenta de administrador' };
    }
    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes('already') || error.message.toLowerCase().includes('registered')) {
        return { success: false, error: 'El email ya está registrado' };
      }
      return { success: false, error: 'Error al crear la cuenta' };
    }

    if (!data.user) return { success: false, error: 'Error al crear la cuenta' };

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      name,
      role,
      active: true,
    });

    if (profileError) {
      await supabase.auth.signOut();
      if (profileError.code === '23505') {
        return { success: false, error: 'El email ya está registrado' };
      }
      return { success: false, error: 'Error al crear el perfil' };
    }

    const profile = await sbUserRepo.getById(data.user.id);
    if (profile) {
      setUser(profile);
      sbAuditRepo.create({
        userId: profile.id,
        userName: profile.name,
        action: 'REGISTER',
        resource: 'auth',
        ip: '0.0.0.0',
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    if (user) {
      sbAuditRepo.create({
        userId: user.id,
        userName: user.name,
        action: 'LOGOUT',
        resource: 'auth',
        ip: '0.0.0.0',
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }
    await supabase.auth.signOut();
    setUser(null);
    router.replace('/login');
  }, [user, router]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    const updated = await sbUserRepo.update(user.id, data);
    if (updated) setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireRole(...roles: UserRole[]) {
  const { user, loading } = useAuth();
  const authorized = !loading && user !== null && roles.includes(user.role);
  return { user, loading, authorized };
}
