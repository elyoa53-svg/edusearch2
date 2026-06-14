'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">EduSearch</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recuperar contraseña</CardTitle>
            <CardDescription>Ingresa tu email para recibir instrucciones de recuperación</CardDescription>
          </CardHeader>
          {sent ? (
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center py-4 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mb-3" />
                <p className="font-medium">Email enviado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Si existe una cuenta con <strong>{email}</strong>, recibirás instrucciones para restablecer tu contraseña.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Simulación: usa el enlace de demostración a continuación.
                </p>
              </div>
              <Link href={`/reset-password/demo-token?email=${encodeURIComponent(email)}`}>
                <Button variant="outline" className="w-full">Ir a restablecer contraseña (demo)</Button>
              </Link>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full">Enviar instrucciones</Button>
                <Link href="/login" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  <ArrowLeft className="h-3 w-3" /> Volver a iniciar sesión
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
