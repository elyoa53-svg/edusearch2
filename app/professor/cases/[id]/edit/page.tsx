'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { sbCaseRepo, sbUserRepo } from '@/lib/supabase-repository';
import { Case, Student } from '@/lib/types';
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

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const caseId = params.id as string;
  const [students, setStudents] = useState<Student[]>([]);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [evaluationCriteria, setEvaluationCriteria] = useState<string[]>([]);
  const [suggestedResources, setSuggestedResources] = useState<string[]>([]);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    Promise.all([
      sbCaseRepo.getById(caseId),
      sbUserRepo.getByRole('student'),
    ]).then(([c, allStudents]) => {
      if (c) {
        setCaseData(c);
        setTitle(c.title);
        setDescription(c.description);
        setInstructions(c.instructions);
        setDifficulty(c.difficulty);
        setCategory(c.category);
        setDeadline(c.deadline || '');
        setObjectives(c.objectives);
        setEvaluationCriteria(c.evaluationCriteria);
        setSuggestedResources(c.suggestedResources);
        setAssignedTo(c.assignedTo);
      }
      setStudents(allStudents as Student[]);
      setLoading(false);
    });
  }, [caseId]);

  const handleAddObjective = () => setObjectives([...objectives, '']);
  const handleRemoveObjective = (idx: number) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };
  const handleObjectiveChange = (idx: number, val: string) => {
    const updated = [...objectives];
    updated[idx] = val;
    setObjectives(updated);
  };

  const handleAddCriteria = () => setEvaluationCriteria([...evaluationCriteria, '']);
  const handleRemoveCriteria = (idx: number) => {
    setEvaluationCriteria(evaluationCriteria.filter((_, i) => i !== idx));
  };
  const handleCriteriaChange = (idx: number, val: string) => {
    const updated = [...evaluationCriteria];
    updated[idx] = val;
    setEvaluationCriteria(updated);
  };

  const handleAddResource = () => setSuggestedResources([...suggestedResources, '']);
  const handleRemoveResource = (idx: number) => {
    setSuggestedResources(suggestedResources.filter((_, i) => i !== idx));
  };
  const handleResourceChange = (idx: number, val: string) => {
    const updated = [...suggestedResources];
    updated[idx] = val;
    setSuggestedResources(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category.trim() || !caseData) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setSaving(true);
    try {
      const cleanObjectives = objectives.filter(o => o.trim());
      const cleanCriteria = evaluationCriteria.filter(c => c.trim());
      const cleanResources = suggestedResources.filter(r => r.trim());

      await sbCaseRepo.update(caseData.id, {
        title: title.trim(),
        description: description.trim(),
        objectives: cleanObjectives.length > 0 ? cleanObjectives : ['Objetivo pendiente'],
        instructions: instructions.trim(),
        difficulty,
        category: category.trim(),
        deadline: deadline || undefined,
        evaluationCriteria: cleanCriteria.length > 0 ? cleanCriteria : ['Criterio pendiente'],
        suggestedResources: cleanResources.length > 0 ? cleanResources : ['Recurso pendiente'],
        assignedTo,
      });

      toast.success('Caso actualizado correctamente');
      router.push(`/professor/cases/${caseId}`);
    } catch (error) {
      toast.error('Error al actualizar el caso');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Editar Caso"
        description={caseData?.category}
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
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <Select value={difficulty} onValueChange={(val: any) => setDifficulty(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="instructions">Instrucciones</Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Objetivos de Aprendizaje</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddObjective}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={obj}
                    onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveObjective(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Criterios de Evaluación</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddCriteria}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluationCriteria.map((crit, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={crit}
                    onChange={(e) => handleCriteriaChange(idx, e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveCriteria(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recursos Sugeridos</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddResource}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedResources.map((res, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={res}
                    onChange={(e) => handleResourceChange(idx, e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveResource(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Asignar a Estudiantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {students.map(s => (
                <div key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    id={s.id}
                    checked={assignedTo.includes(s.id)}
                    onCheckedChange={(checked) => {
                      setAssignedTo(
                        checked
                          ? [...assignedTo, s.id]
                          : assignedTo.filter(id => id !== s.id)
                      );
                    }}
                  />
                  <Label htmlFor={s.id} className="cursor-pointer text-sm">
                    {s.name}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-2 mt-6">
            <Button onClick={handleSubmit} disabled={saving} className="w-full">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
