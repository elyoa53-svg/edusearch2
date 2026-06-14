'use client';

import React, { useState } from 'react';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Triangle } from 'lucide-react';

interface PyramidLevel {
  id: number;
  level: number;
  spanish: string;
  english: string;
  description: string;
  examples: string[];
  color: string;
  textColor: string;
}

const pyramidLevels: PyramidLevel[] = [
  {
    id: 1,
    level: 5,
    spanish: 'Opinión de Expertos (Nivel V)',
    english: 'Expert Opinion (Level V)',
    description: 'Opiniones de expertos sin base en estudios controlados. Incluye editorialistas, paneles, reportes de consenso.',
    examples: [
      'Editoriales de revistas médicas',
      'Opiniones de expertos en conferencias',
      'Reportes anecdóticos',
      'Análisis de casos individuales sin comparación',
    ],
    color: 'bg-red-100',
    textColor: 'text-red-900',
  },
  {
    id: 2,
    level: 4,
    spanish: 'Series de Casos (Nivel IV)',
    english: 'Case Series (Level IV)',
    description: 'Informes de series de casos clínicos. Describe características y resultados de múltiples casos sin grupo de comparación.',
    examples: [
      'Descripción de 10 pacientes con diabetes tipo 2',
      'Seguimiento de casos de neumonía severa',
      'Reportes de reacciones adversas a medicamentos',
    ],
    color: 'bg-orange-100',
    textColor: 'text-orange-900',
  },
  {
    id: 3,
    level: 4,
    spanish: 'Casos y Controles (Nivel IV)',
    english: 'Case-Control Studies (Level IV)',
    description: 'Estudios retrospectivos que comparan casos con controles. Investigan factores de riesgo mirando hacia el pasado.',
    examples: [
      'Comparación de pacientes con infarto vs sin infarto para identificar factores de riesgo',
      'Análisis de hábitos de fumadores vs no fumadores con cáncer pulmonar',
      'Investigación de exposiciones en pacientes con malformaciones congénitas',
    ],
    color: 'bg-amber-100',
    textColor: 'text-amber-900',
  },
  {
    id: 4,
    level: 3,
    spanish: 'Estudios de Cohorte (Nivel III)',
    english: 'Cohort Studies (Level III)',
    description: 'Estudios prospectivos que siguen grupos de individuos a lo largo del tiempo. Miden desenlaces en expuestos vs no expuestos.',
    examples: [
      'Seguimiento de 1000 pacientes con HTA durante 5 años',
      'Estudio de desarrollo de diabetes en individuos con síndrome metabólico',
      'Investigación de progresión de enfermedad pulmonar obstructiva crónica',
    ],
    color: 'bg-yellow-100',
    textColor: 'text-yellow-900',
  },
  {
    id: 5,
    level: 2,
    spanish: 'Ensayos Clínicos Aleatorizados (Nivel II)',
    english: 'Randomized Controlled Trials (Level II)',
    description: 'Estudios prospectivos donde se asignan aleatoriamente participantes a intervención o control. Gold standard de evidencia.',
    examples: [
      'Ensayo de nuevo fármaco anti-diabético vs placebo',
      'Estudio de efectividad de programa de ejercicios vs control',
      'Investigación de nuevas técnicas quirúrgicas vs estándar',
    ],
    color: 'bg-blue-100',
    textColor: 'text-blue-900',
  },
  {
    id: 6,
    level: 1,
    spanish: 'Revisiones Sistemáticas (Nivel I)',
    english: 'Systematic Reviews (Level I)',
    description: 'Revisión exhaustiva y crítica de todos los estudios sobre un tema usando metodología explícita y reproducible.',
    examples: [
      'Revisión Cochrane de tratamientos para neumonía',
      'Revisión sistemática de intervenciones para depresión',
      'Meta-análisis de técnicas diagnósticas para cáncer de mama',
    ],
    color: 'bg-cyan-100',
    textColor: 'text-cyan-900',
  },
  {
    id: 7,
    level: 1,
    spanish: 'Metaanálisis (Nivel I)',
    english: 'Meta-Analysis (Level I)',
    description: 'Análisis estadístico cuantitativo que combina resultados de múltiples estudios para obtener conclusiones más robustas.',
    examples: [
      'Metaanálisis de eficacia de agonistas GLP-1 en diabetes',
      'Análisis combinado de troponinas de alta sensibilidad en infarto agudo',
      'Síntesis cuantitativa de estudios sobre vacunación en embarazo',
    ],
    color: 'bg-emerald-100',
    textColor: 'text-emerald-900',
  },
  {
    id: 8,
    level: 1,
    spanish: 'Guías de Práctica Clínica (Nivel I)',
    english: 'Clinical Practice Guidelines (Level I)',
    description: 'Recomendaciones basadas en evidencia desarrolladas por expertos y organizaciones profesionales para orientar decisiones clínicas.',
    examples: [
      'Guía ATS/IDSA para manejo de neumonía adquirida en comunidad',
      'Guía ADA para estándares de cuidado en diabetes',
      'Protocolos ESC para manejo de síncope',
    ],
    color: 'bg-green-100',
    textColor: 'text-green-900',
  },
];

export default function StudentPyramidPage() {
  const [selectedLevel, setSelectedLevel] = useState<PyramidLevel | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleOpenLevel = (level: PyramidLevel) => {
    setSelectedLevel(level);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pirámide de Evidencia"
        description="Comprende los niveles de evidencia para evaluar la calidad de fuentes académicas"
      />

      <Card>
        <CardHeader>
          <CardTitle>Niveles de Evidencia</CardTitle>
          <CardDescription>Haz clic en cada nivel para más detalles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-2xl mx-auto">
            {pyramidLevels.map((level) => {
              const widthPercent = 100 - (level.level - 1) * 10;
              return (
                <button
                  key={level.id}
                  onClick={() => handleOpenLevel(level)}
                  className={`w-full ${level.color} ${level.textColor} p-4 rounded-lg font-semibold transition-all hover:shadow-md hover:scale-105 cursor-pointer`}
                  style={{ width: `${widthPercent}%`, marginLeft: 'auto', marginRight: 'auto' }}
                >
                  <div className="text-center">
                    <p className="font-bold">{level.spanish}</p>
                    <p className="text-xs opacity-75">{level.english}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guía Rápida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <p className="font-semibold">Nivel I - Mayor Calidad de Evidencia</p>
            <p className="text-muted-foreground">Revisiones sistemáticas, metaanálisis y guías clínicas basadas en evidencia. Son las más confiables para tomar decisiones.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Nivel II - Buena Evidencia</p>
            <p className="text-muted-foreground">Ensayos clínicos aleatorizados. Tienen grupos de comparación y asignación aleatoria.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Nivel III - Evidencia Moderada</p>
            <p className="text-muted-foreground">Estudios de cohorte prospectivos. Observacionales pero con seguimiento estructurado.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Nivel IV - Evidencia Limitada</p>
            <p className="text-muted-foreground">Estudios casos-controles y series de casos. Menos rigurosos pero útiles para generación de hipótesis.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Nivel V - Menor Calidad de Evidencia</p>
            <p className="text-muted-foreground">Opiniones de expertos. Menos confiables pero pueden orientar cuando no hay mejor evidencia.</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          {selectedLevel && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedLevel.spanish}</DialogTitle>
                <DialogDescription>{selectedLevel.english}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Descripción</h4>
                  <p className="text-sm text-muted-foreground">{selectedLevel.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Ejemplos</h4>
                  <ul className="space-y-2">
                    {selectedLevel.examples.map((example, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`${selectedLevel.color} ${selectedLevel.textColor} p-3 rounded`}>
                  <p className="text-sm font-semibold">Nivel: {selectedLevel.level}</p>
                  <p className="text-xs">
                    {selectedLevel.level === 1 && 'Mayor confiabilidad para tomar decisiones clínicas'}
                    {selectedLevel.level === 2 && 'Buena confiabilidad, estudio experimental'}
                    {selectedLevel.level === 3 && 'Confiabilidad moderada, estudio observacional con seguimiento'}
                    {selectedLevel.level === 4 && 'Confiabilidad limitada, puede requerir triangulación'}
                    {selectedLevel.level === 5 && 'Menor confiabilidad, usar solo cuando no hay mejor evidencia'}
                  </p>
                </div>

                <Button onClick={() => setShowDialog(false)} className="w-full">
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
