'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sbAssignmentRepo } from '@/lib/supabase-repository';
import { searchRepo } from '@/lib/repository';
import { Student } from '@/lib/types';
import { StatCard, PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Search, MessageSquare, FileText, Triangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      sbAssignmentRepo.getByStudent(user.id).then(userAssignments => {
        setAssignments(userAssignments);
      });
      const searches = searchRepo.getAll().slice(0, 3);
      setRecentSearches(searches);
    }
  }, [user?.id]);

  const completed = assignments.filter(a => a.status === 'completed').length;
  const inProgress = assignments.filter(a => a.status === 'in_progress').length;
  const pending = assignments.filter(a => a.status === 'pending').length;
  const progress = assignments.length > 0 ? Math.round((completed / assignments.length) * 100) : 0;
  const student = user as Student;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bienvenido, estudiante"
        description="Aquí puedes gestionar tus casos, búsquedas académicas y más"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Casos Asignados" value={assignments.length} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard title="Casos Completados" value={completed} icon={<CheckCircle className="h-4 w-4" />} />
        <StatCard title="En Progreso" value={inProgress} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard title="Progreso General" value={`${progress}%`} description={`${progress}% completado`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/student/search">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Búsqueda Académica
              </CardTitle>
              <CardDescription>Busca fuentes confiables</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start">
                Ir a búsqueda
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/cases">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Casos Clínicos
              </CardTitle>
              <CardDescription>Revisa tus asignaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start">
                Ver casos
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/chat">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Chat Educativo
              </CardTitle>
              <CardDescription>Obtén ayuda y consejos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start">
                Chatear
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/bibliography">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Bibliografía
              </CardTitle>
              <CardDescription>Genera referencias APA/Vancouver</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start">
                Ver bibliografía
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/pyramid">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Triangle className="h-5 w-5 text-primary" />
                Pirámide de Evidencia
              </CardTitle>
              <CardDescription>Aprende niveles de evidencia</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start">
                Ver pirámide
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/verify">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Verificar Fuentes
              </CardTitle>
              <CardDescription>Valida la confiabilidad</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start">
                Verificar
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {recentSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Búsquedas Recientes</CardTitle>
            <CardDescription>Fuentes académicas disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentSearches.map((search) => (
                <div key={search.id} className="p-2 border rounded hover:bg-muted transition-colors">
                  <p className="font-medium text-sm">{search.title}</p>
                  <p className="text-xs text-muted-foreground">{search.authors} ({search.year})</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {student?.competencies && (
        <Card>
          <CardHeader>
            <CardTitle>Mis Competencias</CardTitle>
            <CardDescription>Progreso en habilidades clave</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.competencies.map((comp) => (
                <div key={comp.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{comp.name}</span>
                    <span className="text-xs text-muted-foreground">{comp.level}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${comp.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
