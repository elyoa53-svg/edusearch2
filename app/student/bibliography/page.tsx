'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { bibliographyRepo, formatAPA, formatVancouver } from '@/lib/repository';
import { BibliographyItem } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FileText, Trash2, Copy, Download, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  type: 'book' | 'article' | 'web' | 'journal' | 'doi';
  author: string;
  title: string;
  year: string;
  publisher: string;
  journal: string;
  url: string;
  doi: string;
}

const initialForm: FormData = {
  type: 'article', author: '', title: '', year: new Date().getFullYear().toString(),
  publisher: '', journal: '', url: '', doi: '',
};

export default function StudentBibliographyPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<BibliographyItem[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [format, setFormat] = useState<'apa' | 'vancouver'>('apa');
  const [showPreview, setShowPreview] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      setItems(bibliographyRepo.getByUser(user.id));
    }
  }, [user?.id]);

  const handleAddItem = () => {
    if (!form.author || !form.title || !form.year) {
      toast.error('Completa autor, titulo y ano');
      return;
    }
    if (!user?.id) return;

    if (editingId) {
      bibliographyRepo.update(editingId, {
        type: form.type, author: form.author, title: form.title, year: form.year,
        publisher: form.publisher || undefined, journal: form.journal || undefined,
        url: form.url || undefined, doi: form.doi || undefined,
      });
      setItems(bibliographyRepo.getByUser(user.id));
      setEditingId(null);
      toast.success('Fuente actualizada');
    } else {
      bibliographyRepo.create({
        type: form.type, author: form.author, title: form.title, year: form.year,
        publisher: form.publisher || undefined, journal: form.journal || undefined,
        url: form.url || undefined, doi: form.doi || undefined, userId: user.id,
      });
      setItems(bibliographyRepo.getByUser(user.id));
      toast.success('Fuente agregada');
    }
    setForm(initialForm);
    setShowDialog(false);
  };

  const handleEdit = (item: BibliographyItem) => {
    setEditingId(item.id);
    setForm({
      type: item.type, author: item.author, title: item.title, year: item.year,
      publisher: item.publisher || '', journal: item.journal || '',
      url: item.url || '', doi: item.doi || '',
    });
    setShowDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    bibliographyRepo.delete(deleteId);
    if (user?.id) setItems(bibliographyRepo.getByUser(user.id));
    setDeleteId(null);
    toast.success('Fuente eliminada');
  };

  const getFormattedBibliography = () => {
    const formatter = format === 'apa' ? formatAPA : formatVancouver;
    return items.map(item => formatter(item)).join('\n\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFormattedBibliography());
    toast.success('Bibliografia copiada al portapapeles');
  };

  const handleDownload = () => {
    const formatted = getFormattedBibliography();
    const blob = new Blob([formatted], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliografia_${format}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Bibliografia descargada');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Generador de Bibliografia" description="Crea referencias en formato APA o Vancouver"
        action={<Button onClick={() => { setEditingId(null); setForm(initialForm); setShowDialog(true); }} className="gap-2"><FileText className="h-4 w-4" /> Agregar Fuente</Button>}
      />

      {items.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Vista Previa</CardTitle><CardDescription>Formato: {format.toUpperCase()}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={format} onValueChange={(v: string) => setFormat(v as 'apa' | 'vancouver')}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apa">Formato APA</SelectItem>
                  <SelectItem value="vancouver">Formato Vancouver</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)} size="sm">
                {showPreview ? 'Ocultar' : 'Ver'} Previa
              </Button>
            </div>
            {showPreview && (
              <div className="bg-muted p-4 rounded border font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                {getFormattedBibliography()}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy} className="gap-2"><Copy className="h-4 w-4" /> Copiar</Button>
              <Button variant="outline" onClick={handleDownload} className="gap-2"><Download className="h-4 w-4" /> Descargar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState icon={<FileText className="h-12 w-12" />} title="Sin fuentes agregadas" description="Comienza agregando fuentes a tu bibliografia"
          action={<Button onClick={() => { setForm(initialForm); setShowDialog(true); }} className="gap-2"><FileText className="h-4 w-4" /> Agregar Fuente</Button>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.author}</p>
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{item.type}</span>
                      <span>{item.year}</span>
                      {item.journal && <span>- {item.journal}</span>}
                      {item.publisher && <span>- {item.publisher}</span>}
                      {item.doi && <span>- DOI: {item.doi}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Fuente' : 'Agregar Fuente'}</DialogTitle>
            <DialogDescription>Completa los datos de la fuente academica</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Fuente</label>
              <Select value={form.type} onValueChange={(v: string) => setForm({ ...form, type: v as FormData['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Articulo de Revista</SelectItem>
                  <SelectItem value="book">Libro</SelectItem>
                  <SelectItem value="journal">Revista</SelectItem>
                  <SelectItem value="web">Sitio Web</SelectItem>
                  <SelectItem value="doi">DOI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Autor(es) *</label><Input placeholder="Ej: Metlay JP, Waterer GW" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Titulo *</label><Input placeholder="Titulo de la obra" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Ano *</label><Input type="number" placeholder="2024" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
            {(form.type === 'article' || form.type === 'journal') && <div className="space-y-2"><label className="text-sm font-medium">Revista/Journal</label><Input placeholder="Ej: Nature Medicine" value={form.journal} onChange={(e) => setForm({ ...form, journal: e.target.value })} /></div>}
            {form.type === 'book' && <div className="space-y-2"><label className="text-sm font-medium">Editorial</label><Input placeholder="Nombre de la editorial" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} /></div>}
            {form.type === 'web' && <div className="space-y-2"><label className="text-sm font-medium">URL</label><Input placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></div>}
            {(form.type === 'doi' || form.type === 'article') && <div className="space-y-2"><label className="text-sm font-medium">DOI</label><Input placeholder="10.xxxx/xxxxx" value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} /></div>}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddItem}>{editingId ? 'Guardar Cambios' : 'Agregar Fuente'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Eliminar Fuente</AlertDialogTitle>
          <AlertDialogDescription>Esta seguro de que desea eliminar esta fuente? Esta accion no se puede deshacer.</AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
