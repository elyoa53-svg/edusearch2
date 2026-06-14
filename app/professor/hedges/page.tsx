'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sbHedgeRepo } from '@/lib/supabase-repository';
import { HedgeRule } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Toggle } from '@/components/ui/toggle';
import { Plus, Trash2, Edit2, Layers, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function HedgesPage() {
  const { user } = useAuth();
  const [hedges, setHedges] = useState<HedgeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'search' | 'verification' | 'evaluation'>('search');
  const [examples, setExamples] = useState<string[]>(['']);

  useEffect(() => {
    if (!user) return;
    sbHedgeRepo.getByProfessor(user.id).then(data => {
      setHedges(data);
      setLoading(false);
    });
  }, [user]);

  const resetForm = () => {
    setName(''); setDescription(''); setCategory('search'); setExamples(['']); setEditingId(null);
  };

  const handleOpenNew = () => { resetForm(); setDialogOpen(true); };

  const handleOpenEdit = (hedge: HedgeRule) => {
    setName(hedge.name); setDescription(hedge.description); setCategory(hedge.category);
    setExamples(hedge.examples.length > 0 ? hedge.examples : ['']);
    setEditingId(hedge.id); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !name.trim() || !description.trim()) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }
    setSaving(true);
    const cleanExamples = examples.filter(e => e.trim());
    try {
      if (editingId) {
        const updated = await sbHedgeRepo.update(editingId, {
          name: name.trim(), description: description.trim(), category,
          examples: cleanExamples.length > 0 ? cleanExamples : [''],
        });
        if (updated) setHedges(prev => prev.map(h => h.id === editingId ? updated : h));
        toast.success('Regla actualizada');
      } else {
        const created = await sbHedgeRepo.create({
          name: name.trim(), description: description.trim(), category,
          active: true,
          examples: cleanExamples.length > 0 ? cleanExamples : [''],
          professorId: user.id,
        });
        setHedges(prev => [...prev, created]);
        toast.success('Regla creada');
      }
      setDialogOpen(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await sbHedgeRepo.delete(deleteId);
    setHedges(hedges.filter(h => h.id !== deleteId));
    toast.success('Regla eliminada');
    setDeleteId(null);
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    const updated = await sbHedgeRepo.update(id, { active: !active });
    if (updated) setHedges(prev => prev.map(h => h.id === id ? updated : h));
    toast.success(active ? 'Regla desactivada' : 'Regla activada');
  };

  const getCategoryLabel = (cat: string) => ({ search: 'Búsqueda', verification: 'Verificación', evaluation: 'Evaluación' }[cat] || cat);
  const getCategoryColor = (cat: string) => ({ search: 'bg-blue-100 text-blue-800', verification: 'bg-emerald-100 text-emerald-800', evaluation: 'bg-amber-100 text-amber-800' }[cat] || '');

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
        title="Reglas de Búsqueda (Hedges)"
        description="Crea y gestiona tus reglas de búsqueda académica"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Regla
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Regla' : 'Nueva Regla de Búsqueda'}</DialogTitle>
                <DialogDescription>Define una regla para optimizar búsquedas académicas</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nombre *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Filtro de metaanálisis" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descripción *</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe cómo funciona esta regla..." rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoría</label>
                  <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search">Búsqueda</SelectItem>
                      <SelectItem value="verification">Verificación</SelectItem>
                      <SelectItem value="evaluation">Evaluación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Ejemplos</label>
                  <div className="space-y-2">
                    {examples.map((ex, idx) => (
                      <Input key={idx} value={ex} onChange={(e) => {
                        const updated = [...examples]; updated[idx] = e.target.value; setExamples(updated);
                      }} placeholder="Ej: meta-analysis[pt] OR systematic review[pt]" />
                    ))}
                    <Button size="sm" variant="outline" onClick={() => setExamples([...examples, ''])}>
                      <Plus className="h-4 w-4 mr-2" /> Agregar Ejemplo
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingId ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {hedges.length === 0 ? (
        <EmptyState icon={<Layers className="h-8 w-8" />} title="Sin reglas" description="Crea tu primera regla de búsqueda" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hedges.map(h => (
            <Card key={h.id} className={!h.active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{h.name}</CardTitle>
                    <Badge className={getCategoryColor(h.category)} variant="secondary">
                      {getCategoryLabel(h.category)}
                    </Badge>
                  </div>
                  <Toggle pressed={h.active} onPressedChange={() => handleToggleActive(h.id, h.active)} className="h-8 w-8">
                    {h.active ? '✓' : '✗'}
                  </Toggle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{h.description}</p>
                {h.examples.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Ejemplos:</p>
                    <ul className="text-xs space-y-1">
                      {h.examples.slice(0, 2).map((ex, i) => (
                        <li key={i} className="text-muted-foreground">• {ex}</li>
                      ))}
                      {h.examples.length > 2 && <li className="text-muted-foreground">• +{h.examples.length - 2} más</li>}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(h)}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(h.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Eliminar Regla</AlertDialogTitle>
          <AlertDialogDescription>Estás a punto de eliminar esta regla de búsqueda.</AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">Eliminar</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
