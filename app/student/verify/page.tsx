'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { verificationRepo, simulateVerification } from '@/lib/repository';
import { VerificationResult } from '@/lib/types';
import { PageHeader, TrafficLight, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentVerifyPage() {
  const { user } = useAuth();
  const [inputType, setInputType] = useState<'url' | 'title' | 'doi'>('url');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    if (user?.id) {
      const verifications = verificationRepo.getByUser(user.id);
      setResults(verifications);
    }
  }, [user?.id]);

  const handleVerify = async () => {
    if (!inputValue.trim() || !user?.id) {
      toast.error('Ingresa un valor a verificar');
      return;
    }

    setLoading(true);

    try {
      const verificationData = simulateVerification(inputValue, inputType);
      const result = verificationRepo.create({
        ...verificationData,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });

      setResults(prev => [result, ...prev]);
      setSelectedResult(result);
      setInputValue('');
      toast.success('Verificación completada');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = (status: string): string[] => {
    const recommendations: Record<string, string[]> = {
      reliable: [
        'Esta fuente parece confiable. Puedes usarla con confianza en tu análisis.',
        'Verifica que el estudio sea relevante para tu pregunta clínica específica.',
        'Revisa el año de publicación para asegurar información actual.',
      ],
      caution: [
        'Ten precaución al usar esta fuente. Busca fuentes adicionales para triangulación.',
        'Revisa críticamente la metodología del estudio.',
        'Complementa con guías clínicas u otras revisiones sistemáticas.',
      ],
      unreliable: [
        'No recomendamos usar esta fuente como evidencia primaria.',
        'Busca fuentes alternativas más confiables.',
        'Si necesitas usarla, hazlo de manera muy crítica y complementada.',
      ],
    };
    return recommendations[status] || recommendations.caution;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verificador de Fuentes"
        description="Valida la confiabilidad de tus fuentes académicas"
      />

      <Card>
        <CardHeader>
          <CardTitle>Verificar Fuente</CardTitle>
          <CardDescription>Ingresa una URL, título o DOI para validar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={inputType} onValueChange={(v: string) => setInputType(v as 'url' | 'title' | 'doi')}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="title">Titulo</SelectItem>
                <SelectItem value="doi">DOI</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={
                inputType === 'url' ? 'https://...' : inputType === 'doi' ? '10.xxxx/xxxxx' : 'Título del estudio'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleVerify()}
              disabled={loading}
            />
            <Button onClick={handleVerify} disabled={loading || !inputValue.trim()} className="gap-2">
              <Zap className="h-4 w-4" />
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedResult && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resultado de Verificación</CardTitle>
              <TrafficLight status={selectedResult.status} />
            </div>
            <CardDescription>Fuente: {selectedResult.input}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Puntuación General</h4>
                <span className="text-2xl font-bold text-primary">{selectedResult.overallScore}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    selectedResult.overallScore >= 70
                      ? 'bg-emerald-500'
                      : selectedResult.overallScore >= 40
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${selectedResult.overallScore}%` }}
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Criterios de Evaluación</h4>
              <div className="space-y-2">
                {selectedResult.criteria.map((criterion, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border rounded">
                    <div className="flex-shrink-0 mt-1">
                      {criterion.passed ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{criterion.name}</p>
                      <p className="text-xs text-muted-foreground">{criterion.detail}</p>
                      <p className="text-xs text-muted-foreground mt-1">Peso: {criterion.weight}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recomendaciones</h4>
              <div className="space-y-2">
                {getRecommendations(selectedResult.status).map((rec, i) => (
                  <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                    • {rec}
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" onClick={() => setSelectedResult(null)} className="w-full">
              Cerrar Resultado
            </Button>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Verificaciones</CardTitle>
            <CardDescription>Últimas verificaciones realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.slice(0, 10).map((result) => (
                <button
                  key={result.id}
                  onClick={() => setSelectedResult(result)}
                  className="w-full text-left p-3 border rounded hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{result.input}</p>
                      <p className="text-xs text-muted-foreground">{result.inputType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          result.status === 'reliable'
                            ? 'bg-emerald-100 text-emerald-800'
                            : result.status === 'caution'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                        }
                      >
                        {result.overallScore}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results.length === 0 && !selectedResult && (
        <EmptyState
          icon={<Zap className="h-12 w-12" />}
          title="Sin verificaciones"
          description="Comienza verificando una fuente para ver su confiabilidad"
        />
      )}
    </div>
  );
}
