'use client';

import { useEffect, useState } from 'react';
import { sbUserRepo, sbAssignmentRepo } from '@/lib/supabase-repository';
import { Student } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Users, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  useEffect(() => {
    sbUserRepo.getByRole('student').then(data => {
      setStudents(data as Student[]);
      setLoading(false);
    });
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = async () => {
    if (!deactivateId) return;
    const student = students.find(s => s.id === deactivateId);
    if (student) {
      await sbUserRepo.update(deactivateId, { active: !student.active });
      setStudents(students.map(s => s.id === deactivateId ? { ...s, active: !s.active } : s));
      toast.success(student.active ? 'Estudiante desactivado' : 'Estudiante activado');
      setDeactivateId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Email', 'Grupo', 'Progreso', 'Casos Completados', 'Estado'];
    const rows = students.map(s => [
      s.name, s.email, s.group || '-', `${s.progress}%`, s.casesCompleted, s.active ? 'Activo' : 'Inactivo'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudiantes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exportado');
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
        title="Gestión de Estudiantes"
        description="Monitorea el progreso de tus estudiantes"
        action={
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        }
      />

      <Card>
        <CardHeader><CardTitle>Buscar</CardTitle></CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="Sin estudiantes"
          description="No hay estudiantes que coincidan con tu búsqueda"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Casos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm">{s.email}</TableCell>
                    <TableCell>{s.group || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="text-sm font-medium w-10">{s.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{s.casesCompleted}/{s.casesAssigned}</TableCell>
                    <TableCell>
                      <Badge className={s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}>
                        {s.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedStudent(s)}>Ver</Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeactivateId(s.id)}>
                        {s.active ? 'Desactivar' : 'Activar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.name}</DialogTitle>
            <DialogDescription>{selectedStudent?.email}</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div><p className="text-sm text-muted-foreground">Grupo</p><p className="mt-1 font-medium">{selectedStudent.group || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Progreso General</p><p className="mt-1 font-medium">{selectedStudent.progress}%</p></div>
                <div><p className="text-sm text-muted-foreground">Casos Completados</p><p className="mt-1 font-medium">{selectedStudent.casesCompleted}/{selectedStudent.casesAssigned}</p></div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="mt-1">
                    <Badge className={selectedStudent.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}>
                      {selectedStudent.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </p>
                </div>
              </div>

              {selectedStudent.competencies?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Competencias</h4>
                  <div className="space-y-3">
                    {selectedStudent.competencies.map((comp, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{comp.name}</span>
                          <span className="font-medium">{comp.level}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${comp.level >= 80 ? 'bg-emerald-500' : comp.level >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${comp.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deactivateId} onOpenChange={(open) => !open && setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>
            {students.find(s => s.id === deactivateId)?.active ? 'Desactivar' : 'Activar'} Estudiante
          </AlertDialogTitle>
          <AlertDialogDescription>Estás a punto de cambiar el estado de este estudiante.</AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive}>Confirmar</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
