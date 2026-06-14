'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { sbCaseRepo, sbAssignmentRepo } from '@/lib/supabase-repository';
import { Case, Assignment } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Loader2, Edit2, Copy, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    Promise.all([
      sbCaseRepo.getById(caseId),
      sbAssignmentRepo.getByCase(caseId),
    ]).then(([c, caseAssignments]) => {
      setCaseData(c || null);
      setAssignments(caseAssignments);
      setLoading(false);
    });
  }, [caseId]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!caseData) {
    return <EmptyState icon={<AlertTriangle className="h-8 w-8" />} title="Caso no encontrado" />;
  }

  const handleDelete = async () => {
    if (await sbCaseRepo.delete(caseId)) {
      toast.success('Caso eliminado');
      router.push('/professor/cases');
    }
  };

  const handleDuplicate = async () => {
    if (!user || !caseData) return;
    const newCase = await sbCaseRepo.create({
      ...caseData,
      title: `${caseData.title} (Copia)`,
      status: 'draft',
      professorId: user.id,
    });
    if (newCase) {
      toast.success('Caso duplicado');
      router.push(`/professor/cases/${newCase.id}/edit`);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      published: { label: 'Publicado', class: 'bg-emerald-100 text-emerald-800' },
      draft: { label: 'Borrador', class: 'bg-gray-100 text-gray-800' },
      archived: { label: 'Archivado', class: 'bg-slate-100 text-slate-800' },
    };
    const v = variants[status] || variants.draft;
    return <Badge className={v.class}>{v.label}</Badge>;
  };

  const getDifficultyBadge = (diff: string) => {
    const variants: Record<string, string> = {
      basic: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-amber-100 text-amber-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[diff] || ''}>{diff}</Badge>;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={caseData.title}
        description={caseData.category}
        action={
          <div className="flex gap-2">
            <Link href={`/professor/cases/${caseId}/edit`}>
              <Button variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="mt-1">{getStatusBadge(caseData.status)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dificultad</p>
              <p className="mt-1">{getDifficultyBadge(caseData.difficulty)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plazo</p>
              <p className="mt-1 font-medium">
                {caseData.deadline ? new Date(caseData.deadline).toLocaleDateString() : 'Sin plazo'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estudiantes asignados</p>
              <p className="mt-1 font-medium">{caseData.assignedTo.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Respuestas enviadas</p>
              <p className="mt-1 font-medium">
                {assignments.filter(a => a.status === 'completed').length}/{caseData.assignedTo.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En progreso</p>
              <p className="mt-1 font-medium">
                {assignments.filter(a => a.status === 'in_progress').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Puntuación promedio</p>
              <p className="mt-1 font-medium">
                {assignments.length > 0 && assignments.some(a => a.score !== undefined)
                  ? (assignments.reduce((sum, a) => sum + (a.score || 0), 0) / assignments.filter(a => a.score !== undefined).length).toFixed(1)
                  : '-'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{caseData.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{caseData.instructions || 'Sin instrucciones'}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Objetivos de Aprendizaje</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {caseData.objectives.map((obj, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Criterios de Evaluación</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {caseData.evaluationCriteria.map((crit, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{crit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recursos Sugeridos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {caseData.suggestedResources.map((res, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{res}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Respuestas de Estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <EmptyState title="Sin respuestas" description="Aún no hay respuestas enviadas" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Puntuación</TableHead>
                  <TableHead>Fecha envío</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.studentName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{a.status}</Badge>
                    </TableCell>
                    <TableCell>{a.progress}%</TableCell>
                    <TableCell>
                      {a.score !== undefined ? `${a.score}/${a.maxScore}` : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {a.status === 'completed' && (
                        <Link href={`/professor/evaluations/${a.id}`}>
                          <Button size="sm" variant="ghost">Ver</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Eliminar Caso</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar este caso. Esta acción no se puede deshacer.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
