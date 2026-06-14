'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { sbCaseRepo, sbAssignmentRepo, sbUserRepo } from '@/lib/supabase-repository';
import { Student } from '@/lib/types';
import { PageHeader } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewCasePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState('');
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [evaluationCriteria, setEvaluationCriteria] = useState<string[]>(['']);
  const [suggestedResources, setSuggestedResources] = useState<string[]>(['']);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [publishNow, setPublishNow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sbUserRepo.getByRole('student').then(s => setStudents(s as Student[]));
  }, []);

  const handleSubmit = async () => {
    if (!user || !title.trim() || !description.trim() || !category.trim()) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      const cleanObjectives = objectives.filter(o => o.trim());
      const cleanCriteria = evaluationCriteria.filter(c => c.trim());
      const cleanResources = suggestedResources.filter(r => r.trim());

      const newCase = await sbCaseRepo.create({
        title: title.trim(),
        description: description.trim(),
        objectives: cleanObjectives.length > 0 ? cleanObjectives : [],
        instructions: instructions.trim(),
        difficulty,
        category: category.trim(),
        deadline: deadline || undefined,
        evaluationCriteria: cleanCriteria.length > 0 ? cleanCriteria : [],
        suggestedResources: cleanResources.length > 0 ? cleanResources : [],
        status: publishNow ? 'published' : 'draft',
        professorId: user.id,
        professorName: user.name,
        assignedTo,
      });

      // Create assignments for selected students
      if (assignedTo.length > 0) {
        const selectedStudents = students.filter(s => assignedTo.includes(s.id));
        await Promise.all(selectedStudents.map(s =>
          sbAssignmentRepo.create({
            caseId: newCase.id,
            studentId: s.id,
            studentName: s.name,
            status: 'pending',
            maxScore: 100,
            progress: 0,
          })
        ));
      }

      toast.success(publishNow ? 'Caso creado y publicado' : 'Caso creado como borrador');
      router.push('/professor/cases');
    } catch {
      toast.error('Error al crear el caso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Crear Nuevo Caso"
        description="Diseña un caso clínico para tus estudiantes"
      />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Neumonía adquirida en comunidad" />
              </div>
              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el caso clínico..." rows={4} />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej: Neumología" />
                </div>
                <div>
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <Select value={difficulty} onValueChange={(val: 'basic' | 'intermediate' | 'advanced') => setDifficulty(val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="deadline">Plazo (opcional)</Label>
                <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="instructions">Instrucciones</Label>
                <Textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instrucciones detalladas para resolver el caso..." rows={4} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Objetivos de Aprendizaje</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setObjectives([...objectives, ''])}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={obj} onChange={(e) => { const u = [...objectives]; u[idx] = e.target.value; setObjectives(u); }} placeholder="Objetivo de aprendizaje..." />
                  <Button size="sm" variant="ghost" onClick={() => setObjectives(objectives.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Criterios de Evaluación</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setEvaluationCriteria([...evaluationCriteria, ''])}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluationCriteria.map((crit, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={crit} onChange={(e) => { const u = [...evaluationCriteria]; u[idx] = e.target.value; setEvaluationCriteria(u); }} placeholder="Criterio de evaluación..." />
                  <Button size="sm" variant="ghost" onClick={() => setEvaluationCriteria(evaluationCriteria.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recursos Sugeridos</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setSuggestedResources([...suggestedResources, ''])}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedResources.map((res, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={res} onChange={(e) => { const u = [...suggestedResources]; u[idx] = e.target.value; setSuggestedResources(u); }} placeholder="Recurso sugerido..." />
                  <Button size="sm" variant="ghost" onClick={() => setSuggestedResources(suggestedResources.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asignar a Estudiantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-72 overflow-y-auto">
              {students.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin estudiantes registrados</p>
              ) : (
                students.map(s => (
                  <div key={s.id} className="flex items-center gap-2">
                    <Checkbox
                      id={s.id}
                      checked={assignedTo.includes(s.id)}
                      onCheckedChange={(checked) => {
                        setAssignedTo(checked ? [...assignedTo, s.id] : assignedTo.filter(id => id !== s.id));
                      }}
                    />
                    <Label htmlFor={s.id} className="cursor-pointer text-sm">{s.name}</Label>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publicación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="publishNow"
                  checked={publishNow}
                  onCheckedChange={(v) => setPublishNow(!!v)}
                />
                <Label htmlFor="publishNow" className="cursor-pointer text-sm">
                  Publicar inmediatamente
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {publishNow ? 'Los estudiantes verán este caso de inmediato.' : 'Se guardará como borrador hasta que lo publiques.'}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando...</> : publishNow ? 'Crear y Publicar' : 'Guardar como Borrador'}
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
