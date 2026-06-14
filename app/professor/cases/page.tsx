'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { sbCaseRepo } from '@/lib/supabase-repository';
import { Case } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Copy, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CasesPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    if (!user) return;
    sbCaseRepo.getByProfessor(user.id).then(data => {
      setCases(data);
      setLoadingPage(false);
    });
  }, [user]);

  const filtered = cases.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (difficultyFilter !== 'all' && c.difficulty !== difficultyFilter) return false;
    if (categoryFilter && !c.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    const ok = await sbCaseRepo.delete(deleteId);
    if (ok) {
      setCases(cases.filter(c => c.id !== deleteId));
      toast.success('Caso eliminado');
    } else {
      toast.error('Error al eliminar el caso');
    }
    setDeleteId(null);
  };

  const handleDuplicate = async (caseId: string) => {
    const caseData = cases.find(c => c.id === caseId);
    if (!caseData || !user) return;
    try {
      const newCase = await sbCaseRepo.create({
        ...caseData,
        title: `${caseData.title} (Copia)`,
        status: 'draft',
        professorId: user.id,
        assignedTo: [],
      });
      setCases([...cases, newCase]);
      toast.success('Caso duplicado');
    } catch {
      toast.error('Error al duplicar el caso');
    }
  };

  const handleToggleStatus = async (c: Case) => {
    const newStatus = c.status === 'published' ? 'archived' : c.status === 'draft' ? 'published' : 'draft';
    const updated = await sbCaseRepo.update(c.id, { status: newStatus });
    if (updated) {
      setCases(cases.map(x => x.id === c.id ? { ...x, status: newStatus } : x));
      const labels: Record<string, string> = { published: 'Publicado', archived: 'Archivado', draft: 'Borrador' };
      toast.success(`Caso marcado como ${labels[newStatus]}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; class: string }> = {
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
    const labels: Record<string, string> = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' };
    return <Badge className={variants[diff] || ''}>{labels[diff] || diff}</Badge>;
  };

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Casos Clínicos"
        description="Gestiona tus casos clínicos y asignaciones"
        action={
          <Link href="/professor/cases/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Caso
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Dificultad</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Categoría</label>
              <Input
                placeholder="Filtrar por categoría..."
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="No hay casos"
          description="Crea tu primer caso clínico"
          action={
            <Link href="/professor/cases/new">
              <Button><Plus className="h-4 w-4 mr-2" />Crear Caso</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Dificultad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Asignado a</TableHead>
                  <TableHead>Plazo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>{getDifficultyBadge(c.difficulty)}</TableCell>
                    <TableCell>
                      <button onClick={() => handleToggleStatus(c)} title="Cambiar estado">
                        {getStatusBadge(c.status)}
                      </button>
                    </TableCell>
                    <TableCell>{c.assignedTo.length} estudiantes</TableCell>
                    <TableCell className="text-sm">
                      {c.deadline ? new Date(c.deadline).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Link href={`/professor/cases/${c.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                      <Link href={`/professor/cases/${c.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDuplicate(c.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
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
