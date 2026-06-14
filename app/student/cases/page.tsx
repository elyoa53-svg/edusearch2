'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sbAssignmentRepo, sbCaseRepo } from '@/lib/supabase-repository';
import { Assignment, Case } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Zap, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AssignmentWithCase extends Assignment {
  caseData?: Case;
}

export default function StudentCasesPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithCase[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithCase | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      sbAssignmentRepo.getByStudent(user.id),
    ]).then(async ([userAssignments]) => {
      const seen = new Set<string>();
      const caseIds = userAssignments.map(a => a.caseId).filter(id => { if (seen.has(id)) return false; seen.add(id); return true; });
      const casesData = await Promise.all(caseIds.map(id => sbCaseRepo.getById(id)));
      const caseMap = Object.fromEntries(casesData.filter(Boolean).map(c => [c!.id, c!]));
      setAssignments(userAssignments.map(a => ({ ...a, caseData: caseMap[a.caseId] })));
      setLoadingPage(false);
    });
  }, [user?.id]);

  const filteredAssignments = statusFilter
    ? assignments.filter(a => a.status === statusFilter)
    : assignments;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      reviewed: 'bg-violet-100 text-violet-800',
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completado',
      reviewed: 'Revisado',
    };
    return labels[status] || status;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      basic: 'bg-emerald-100 text-emerald-800',
      intermediate: 'bg-amber-100 text-amber-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || colors.basic;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' };
    return labels[difficulty] || difficulty;
  };

  const handleOpenCase = (assignment: AssignmentWithCase) => {
    setSelectedAssignment(assignment);
    setResponse(assignment.response || '');
  };

  const handleSaveProgress = async () => {
    if (!selectedAssignment) return;
    setLoading(true);
    try {
      const updated = await sbAssignmentRepo.update(selectedAssignment.id, {
        response,
        status: 'in_progress',
        progress: Math.min(99, Math.ceil((response.length / 500) * 100)),
      });
      if (updated) {
        setAssignments(prev => prev.map(a => a.id === updated.id ? { ...updated, caseData: a.caseData } : a));
        setSelectedAssignment({ ...updated, caseData: selectedAssignment.caseData });
        toast.success('Progreso guardado');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!selectedAssignment || !response.trim()) return;
    setLoading(true);
    try {
      const updated = await sbAssignmentRepo.update(selectedAssignment.id, {
        response,
        status: 'completed',
        progress: 100,
        submittedAt: new Date().toISOString(),
      });
      if (updated) {
        setAssignments(prev => prev.map(a => a.id === updated.id ? { ...updated, caseData: a.caseData } : a));
        setSelectedAssignment(null);
        toast.success('Caso enviado para revisión');
      }
    } finally {
      setLoading(false);
    }
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
      <PageHeader
        title="Mis Casos Clínicos"
        description="Desarrolla tus habilidades resolviendo casos clínicos"
      />

      <Card>
        <CardContent className="pt-4">
          <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Todos los estados" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="reviewed">Revisado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="Sin casos asignados"
          description={statusFilter ? `No hay casos con ese estado` : 'Espera a que tu profesor asigne casos'}
        />
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => {
            const caseData = assignment.caseData;
            if (!caseData) return null;
            return (
              <Card
                key={assignment.id}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleOpenCase(assignment)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{caseData.title}</h3>
                        {assignment.feedback && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Nueva retroalimentación</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{caseData.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{caseData.category}</Badge>
                        <Badge className={getDifficultyColor(caseData.difficulty)}>
                          {getDifficultyLabel(caseData.difficulty)}
                        </Badge>
                        <Badge className={getStatusColor(assignment.status)}>
                          {getStatusLabel(assignment.status)}
                        </Badge>
                        {caseData.deadline && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(caseData.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold">{assignment.progress}%</div>
                      <p className="text-xs text-muted-foreground">Completado</p>
                    </div>
                  </div>
                  {assignment.progress > 0 && (
                    <div className="mt-4 w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${assignment.progress}%` }} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedAssignment?.caseData && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAssignment.caseData.title}</DialogTitle>
                <DialogDescription>{selectedAssignment.caseData.category}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Descripción</h4>
                  <p className="text-sm text-muted-foreground">{selectedAssignment.caseData.description}</p>
                </div>
                {selectedAssignment.caseData.objectives.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Objetivos de Aprendizaje</h4>
                    <ul className="space-y-1">
                      {selectedAssignment.caseData.objectives.map((obj, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span> {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedAssignment.caseData.instructions && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Instrucciones</h4>
                    <p className="text-sm text-muted-foreground">{selectedAssignment.caseData.instructions}</p>
                  </div>
                )}
                {selectedAssignment.caseData.evaluationCriteria.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Criterios de Evaluación</h4>
                    <ul className="space-y-1">
                      {selectedAssignment.caseData.evaluationCriteria.map((crit, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <Zap className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" /> {crit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedAssignment.feedback && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-sm text-blue-800">Retroalimentación del Profesor</h4>
                    </div>
                    <p className="text-sm text-blue-900">{selectedAssignment.feedback}</p>
                    {selectedAssignment.score !== undefined && selectedAssignment.score !== null && (
                      <p className="text-sm font-semibold mt-2 text-blue-800">
                        Puntuación: {selectedAssignment.score}/{selectedAssignment.maxScore}
                      </p>
                    )}
                  </div>
                )}

                {selectedAssignment.status !== 'completed' && selectedAssignment.status !== 'reviewed' && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Tu Respuesta</h4>
                    <Textarea
                      placeholder="Escribe tu análisis y respuesta aquí..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{response.length} caracteres</p>
                  </div>
                )}

                {(selectedAssignment.status === 'completed' || selectedAssignment.status === 'reviewed') && selectedAssignment.response && !selectedAssignment.feedback && (
                  <div className="bg-muted p-3 rounded">
                    <h4 className="font-semibold text-sm mb-2">Tu Respuesta (enviada)</h4>
                    <p className="text-sm text-muted-foreground">{selectedAssignment.response}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedAssignment(null)}>Cerrar</Button>
                {selectedAssignment.status !== 'completed' && selectedAssignment.status !== 'reviewed' && (
                  <>
                    <Button variant="outline" onClick={handleSaveProgress} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Progreso'}
                    </Button>
                    <Button onClick={handleMarkCompleted} disabled={loading || !response.trim()}>
                      Enviar para Revisión
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
