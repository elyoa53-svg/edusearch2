'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sbUserRepo, sbAssignmentRepo, sbEvaluationRepo, sbCaseRepo } from '@/lib/supabase-repository';
import { Student, Assignment, Evaluation } from '@/lib/types';
import { StatCard, PageHeader } from '@/components/shared-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, CheckCircle2, Star, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      sbUserRepo.getByRole('student'),
      sbCaseRepo.getByProfessor(user.id),
      sbEvaluationRepo.getByProfessor(user.id),
    ]).then(async ([allStudents, profCases, profEvals]) => {
      setStudents(allStudents as Student[]);
      setEvaluations(profEvals);
      if (profCases.length > 0) {
        const caseIds = profCases.map(c => c.id);
        const allAssignments = await sbAssignmentRepo.getAll();
        setAssignments(allAssignments.filter(a => caseIds.includes(a.caseId)));
      }
      setLoading(false);
    });
  }, [user]);

  const avgProgress = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length)
    : 0;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const completionRate = assignments.length > 0
    ? Math.round((completedAssignments / assignments.length) * 100)
    : 0;
  const avgScore = evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length
    : 0;

  const weeklyActivity = [
    { day: 'Lun', respuestas: 3, evaluadas: 2 },
    { day: 'Mar', respuestas: 5, evaluadas: 4 },
    { day: 'Mié', respuestas: 2, evaluadas: 2 },
    { day: 'Jue', respuestas: 7, evaluadas: 5 },
    { day: 'Vie', respuestas: 4, evaluadas: 3 },
    { day: 'Sáb', respuestas: 1, evaluadas: 1 },
    { day: 'Dom', respuestas: 0, evaluadas: 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Analíticas" description="Análisis del progreso y desempeño del grupo" />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Progreso Promedio" value={`${avgProgress}%`} description="Del grupo completo" icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard title="Tasa de Finalización" value={`${completionRate}%`} description={`${completedAssignments}/${assignments.length} casos`} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard title="Puntuación Promedio" value={avgScore.toFixed(1)} description="En evaluaciones completadas" icon={<Star className="h-4 w-4" />} />
        <StatCard title="Estudiantes" value={students.length} description="En el grupo" icon={<Users className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader><CardTitle>Progreso por Estudiante</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {students.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay estudiantes registrados</p>
          ) : (
            students.map(s => (
              <div key={s.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{s.progress}% - {s.casesCompleted} casos completados</span>
                </div>
                <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Actividad Semanal</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-48">
            {weeklyActivity.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '160px' }}>
                  <div className="w-full max-w-[24px] bg-amber-400 rounded-t" style={{ height: `${(d.respuestas / 7) * 140}px`, minHeight: d.respuestas > 0 ? '4px' : '0' }} title={`${d.respuestas} respuestas`} />
                  <div className="w-full max-w-[24px] bg-emerald-400 rounded-t" style={{ height: `${(d.evaluadas / 7) * 140}px`, minHeight: d.evaluadas > 0 ? '4px' : '0' }} title={`${d.evaluadas} evaluadas`} />
                </div>
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-400" /> Respuestas</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-400" /> Evaluadas</div>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && students[0].competencies?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Competencias - Mapa de Calor</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3">Estudiante</th>
                    {students[0].competencies.map((comp, i) => (
                      <th key={i} className="text-center py-2 px-2 text-xs">{comp.name.split(' ')[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="border-t">
                      <td className="py-2 px-3 font-medium">{s.name.split(' ')[0]}</td>
                      {s.competencies?.map((comp, i) => {
                        const color = comp.level >= 80 ? 'bg-emerald-500 text-white' : comp.level >= 60 ? 'bg-blue-500 text-white' : comp.level >= 40 ? 'bg-amber-400 text-white' : 'bg-red-400 text-white';
                        return (
                          <td key={i} className="py-2 px-2 text-center">
                            <span className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium ${color}`}>{comp.level}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Resumen de Evaluaciones</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div><p className="text-sm text-muted-foreground">Total de Evaluaciones</p><p className="text-2xl font-bold mt-1">{evaluations.length}</p></div>
          <div><p className="text-sm text-muted-foreground">Pendientes de Revisar</p><p className="text-2xl font-bold mt-1 text-amber-600">{evaluations.filter(e => e.status === 'pending').length}</p></div>
          <div><p className="text-sm text-muted-foreground">Ya Revisadas</p><p className="text-2xl font-bold mt-1 text-emerald-600">{evaluations.filter(e => e.status === 'reviewed').length}</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
