'use client';

import { useState, useEffect, useCallback } from 'react';
import { sbUserRepo } from '@/lib/supabase-repository';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { User, UserRole } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Download, Trash2, Edit2, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800',
  professor: 'bg-blue-100 text-blue-800',
  student: 'bg-green-100 text-green-800',
};
const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  professor: 'Profesor',
  student: 'Estudiante',
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' as UserRole });

  const loadUsers = useCallback(async () => {
    const all = await sbUserRepo.getAll();
    setUsers(all);
    setLoadingPage(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email inválido');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      // Use service role via Supabase admin API to create user without sending confirmation email
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('already')) {
          toast.error('Este email ya está registrado');
        } else {
          toast.error('Error al crear el usuario');
        }
        return;
      }

      if (!data.user) {
        toast.error('Error al crear el usuario');
        return;
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        active: true,
      });

      if (profileError) {
        toast.error('Error al crear el perfil');
        return;
      }

      await loadUsers();
      setFormData({ name: '', email: '', password: '', role: 'student' });
      setIsCreateOpen(false);
      toast.success('Usuario creado exitosamente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setSubmitting(true);
    try {
      await sbUserRepo.update(editingUser.id, {
        name: formData.name,
        role: formData.role as UserRole,
      });
      await loadUsers();
      setFormData({ name: '', email: '', password: '', role: 'student' });
      setIsEditOpen(false);
      setEditingUser(null);
      toast.success('Usuario actualizado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    if (deleteUserId === currentUser?.id) {
      toast.error('No puedes eliminar tu propia cuenta');
      setDeleteUserId(null);
      return;
    }
    setSubmitting(true);
    try {
      await sbUserRepo.delete(deleteUserId);
      await loadUsers();
      setDeleteUserId(null);
      toast.success('Usuario eliminado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (u: User) => {
    if (u.id === currentUser?.id) {
      toast.error('No puedes desactivar tu propia cuenta');
      return;
    }
    await sbUserRepo.update(u.id, { active: !u.active });
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, active: !u.active } : x));
    toast.success(u.active ? 'Usuario desactivado' : 'Usuario activado');
  };

  const exportCSV = () => {
    const csv = [
      ['Nombre', 'Email', 'Rol', 'Activo', 'Creado', 'Último Acceso'].join(','),
      ...filteredUsers.map(u =>
        [u.name, u.email, u.role, u.active ? 'Sí' : 'No',
          new Date(u.createdAt).toLocaleDateString(),
          u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'N/A']
          .map(c => `"${c}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV descargado');
  };

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Gestión de Usuarios" description="Administra las cuentas de la plataforma" />

      <Card>
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="mb-2 block">Buscar</Label>
              <Input placeholder="Nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Rol</Label>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="professor">Profesor</SelectItem>
                  <SelectItem value="student">Estudiante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />Crear Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>Ingrese los detalles del nuevo usuario</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input placeholder="Nombre completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" placeholder="usuario@ejemplo.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                      <Label>Contraseña</Label>
                      <Input type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <div>
                      <Label>Rol</Label>
                      <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professor">Profesor</SelectItem>
                          <SelectItem value="student">Estudiante</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateUser} className="w-full" disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Crear Usuario
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
          <CardDescription>Total en plataforma: {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <EmptyState icon={<Users className="h-8 w-8" />} title="Sin resultados" description="No se encontraron usuarios con esos filtros" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[u.role]}>{roleLabels[u.role]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={u.active}
                          onCheckedChange={() => handleToggleActive(u)}
                          disabled={u.id === currentUser?.id}
                        />
                      </TableCell>
                      <TableCell className="text-sm">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingUser(u);
                            setFormData({ name: u.name, email: u.email, password: '', role: u.role });
                            setIsEditOpen(true);
                          }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {u.id !== currentUser?.id && u.role !== 'admin' && (
                            <Button size="sm" variant="destructive" onClick={() => setDeleteUserId(u.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Actualice los detalles del usuario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input placeholder="Nombre completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">El email no se puede cambiar</p>
            </div>
            {editingUser?.role !== 'admin' && (
              <div>
                <Label>Rol</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor">Profesor</SelectItem>
                    <SelectItem value="student">Estudiante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleEditUser} className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente al usuario. No se puede deshacer.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
