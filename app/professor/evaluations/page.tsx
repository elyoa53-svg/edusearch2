'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { sbEvaluationRepo } from '@/lib/supabase-repository';
import { Evaluation } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function EvaluationsPage() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    sbEvaluationRepo.getByProfessor(user.id).then(evals => {
      setEvaluations(evals);
      setLoading(false);
    });
  }, [user]);

  const filtered = evaluations.filter(e => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      reviewed: 'bg-emerald-100 text-emerald-800',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      reviewed: 'Revisada',
    };
    return <Badge className={variants[status] || ''}>{labels[status] || status}</Badge>;
  };

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
        title="Evaluaciones"
        description="Revisa y evalúa las respuestas de tus estudiantes"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">Filtrar por estado</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="reviewed">Revisadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="Sin evaluaciones"
          description="No hay evaluaciones que coincidan con los filtros"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Caso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Puntuación</TableHead>
                  <TableHead>Fecha Envío</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.studentName}</TableCell>
                    <TableCell className="text-sm">{e.caseTitle}</TableCell>
                    <TableCell>{getStatusBadge(e.status)}</TableCell>
                    <TableCell className="font-medium">
                      {e.score !== undefined ? `${e.score}/${e.maxScore}` : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {e.reviewedAt ? new Date(e.reviewedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/professor/evaluations/${e.id}`}>
                        <Button size="sm" variant="ghost">
                          {e.status === 'pending' ? 'Revisar' : 'Ver'}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
