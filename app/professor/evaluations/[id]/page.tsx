'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sbEvaluationRepo, sbAssignmentRepo } from '@/lib/supabase-repository';
import { Evaluation } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EvaluationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const evalId = params.id as string;
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rubricScores, setRubricScores] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!evalId) return;
    sbEvaluationRepo.getById(evalId).then(eval_data => {
      if (eval_data) {
        setEvaluation(eval_data);
        setFeedback(eval_data.feedback || '');
        const scores: Record<number, number> = {};
        eval_data.rubric.forEach((item, idx) => {
          scores[idx] = item.score || 0;
        });
        setRubricScores(scores);
      }
      setLoading(false);
    });
  }, [evalId]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!evaluation) {
    return <EmptyState icon={<AlertTriangle className="h-8 w-8" />} title="Evaluación no encontrada" />;
  }

  const totalScore = Object.values(rubricScores).reduce((a, b) => a + b, 0);
  const maxTotal = evaluation.rubric.reduce((sum, item) => sum + item.maxScore, 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedRubric = evaluation.rubric.map((item, idx) => ({
        ...item,
        score: rubricScores[idx] || 0,
      }));

      await sbEvaluationRepo.update(evaluation.id, {
        rubric: updatedRubric,
        feedback: feedback.trim(),
        score: totalScore,
        status: 'reviewed',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'professor',
      });

      if (evaluation.assignmentId) {
        await sbAssignmentRepo.update(evaluation.assignmentId, {
          score: totalScore,
          feedback: feedback.trim(),
          status: 'reviewed',
        });
      }

      toast.success('Evaluación guardada');
      router.push('/professor/evaluations');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Evaluación"
        description={`${evaluation.studentName} - ${evaluation.caseTitle}`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Estudiante</CardTitle></CardHeader>
          <CardContent><p className="font-medium">{evaluation.studentName}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Caso</CardTitle></CardHeader>
          <CardContent><p className="font-medium">{evaluation.caseTitle}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Estado</CardTitle></CardHeader>
          <CardContent>
            <Badge className={evaluation.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
              {evaluation.status === 'reviewed' ? 'Revisada' : 'Pendiente'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Respuesta del Estudiante</CardTitle></CardHeader>
        <CardContent className="bg-muted p-4 rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{evaluation.response}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rúbrica de Evaluación</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {evaluation.rubric.map((item, idx) => (
            <div key={idx} className="space-y-3 pb-6 border-b last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between">
                <label className="font-medium">{item.criterion}</label>
                <span className="text-sm text-muted-foreground">Máx: {item.maxScore} pts</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max={item.maxScore}
                  value={rubricScores[idx] || 0}
                  onChange={(e) => setRubricScores({
                    ...rubricScores,
                    [idx]: Math.min(Math.max(0, parseInt(e.target.value) || 0), item.maxScore)
                  })}
                  className="w-24"
                />
                <span className="text-sm font-medium">/ {item.maxScore}</span>
              </div>
              {item.comment && (
                <p className="text-sm text-muted-foreground italic">{item.comment}</p>
              )}
            </div>
          ))}

          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Puntuación Total</span>
              <span className="text-2xl font-bold">{totalScore} / {maxTotal}</span>
            </div>
            <div className="h-4 w-full rounded-full bg-secondary overflow-hidden mt-3">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${maxTotal > 0 ? (totalScore / maxTotal) * 100 : 0}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Retroalimentación</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Proporciona retroalimentación específica al estudiante..."
            rows={6}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          Guardar y Marcar Como Revisada
        </Button>
        <Button variant="outline" onClick={() => router.back()}>Volver</Button>
      </div>
    </div>
  );
}
