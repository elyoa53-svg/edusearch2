'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(true);

  // Always sign out any existing session when the login page loads.
  // This ensures the user must re-authenticate every time they visit /login.
  useEffect(() => {
    supabase.auth.signOut().finally(() => setClearing(false));
  }, []);

  if (clearing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión');
    } else if (result.role) {
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        professor: '/professor',
        student: '/student',
      };
      router.replace(redirectMap[result.role] || '/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">EduSearch</span>
          </div>
          <p className="text-muted-foreground">Plataforma educativa basada en evidencia</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder a la plataforma</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs font-medium text-blue-800 mb-1">Cuenta de administrador:</p>
                <p className="text-xs text-blue-700">admin@edusearch.com / Admin2024!</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar sesión
              </Button>
              <div className="flex items-center justify-between w-full text-sm">
                <Link href="/forgot-password" className="text-blue-600 hover:underline">
                  Olvidaste tu contraseña?
                </Link>
                <Link href="/register" className="text-blue-600 hover:underline">
                  Registrarse
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
