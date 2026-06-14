'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { sbCaseRepo, sbAssignmentRepo, sbEvaluationRepo, sbUserRepo } from '@/lib/supabase-repository';
import { Case, Assignment, Evaluation, Student } from '@/lib/types';
import { StatCard, PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3, Users, ClipboardList, TrendingUp, Plus, BookOpen,
  Search, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      sbCaseRepo.getByProfessor(user.id),
      sbEvaluationRepo.getByProfessor(user.id),
      sbUserRepo.getByRole('student'),
    ]).then(async ([profCases, profEvals, allStudents]) => {
      setCases(profCases);
      setEvaluations(profEvals);
      setStudents(allStudents as Student[]);
      if (profCases.length > 0) {
        const caseIds = profCases.map(c => c.id);
        const allAssignments = await sbAssignmentRepo.getAll();
        setAssignments(allAssignments.filter(a => caseIds.includes(a.caseId)));
      }
      setLoading(false);
    });
  }, [user]);

  const pendingEvaluations = evaluations.filter(e => e.status === 'pending').length;
  const avgProgress = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length)
    : 0;
  const recentSubmissions = assignments
    .filter(a => a.status === 'completed' || a.status === 'in_progress')
    .sort((a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel de Control"
        description={`Bienvenido, ${user?.name}`}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Estudiantes"
          value={students.length}
          description="Estudiantes en tu grupo"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Casos Creados"
          value={cases.length}
          description="Casos clínicos diseñados"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Evaluaciones Pendientes"
          value={pendingEvaluations}
          description="Por revisar"
          icon={<ClipboardList className="h-4 w-4" />}
          trend={{ value: pendingEvaluations > 3 ? 5 : -2, label: 'vs última semana' }}
        />
        <StatCard
          title="Progreso Promedio"
          value={`${avgProgress}%`}
          description="Avance general de estudiantes"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/professor/cases/new">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Crear Caso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Diseña un nuevo caso clínico para tus estudiantes
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/professor/cases">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Casos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {cases.length} casos disponibles
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/professor/students">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Estudiantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gestiona tu grupo de estudiantes
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/professor/evaluations">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Evaluaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {pendingEvaluations} pendientes de revisar
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/professor/analytics">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Analíticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Análisis del progreso del grupo
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/professor/search">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-4 w-4" /> Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Busca y recomienda fuentes
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas respuestas enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length > 0 ? (
            <div className="space-y-4">
              {recentSubmissions.map(a => {
                const caseData = cases.find(c => c.id === a.caseId);
                return (
                  <div key={a.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{a.studentName}</p>
                      <p className="text-sm text-muted-foreground">{caseData?.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : 'En progreso'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.status === 'completed' && (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs font-medium">{a.score}/{a.maxScore}</span>
                        </>
                      )}
                      {a.status === 'in_progress' && (
                        <>
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-medium">{a.progress}%</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Sin actividad" description="No hay respuestas recientes" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
