'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VerificationStatus } from '@/lib/types';

export function StatCard({ title, value, description, icon, trend }: {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-emerald-600' : 'text-red-600')}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export function TrafficLight({ status }: { status: VerificationStatus }) {
  const config = {
    reliable: { color: 'bg-emerald-500', label: 'Confiable', ring: 'ring-emerald-500/30' },
    caution: { color: 'bg-amber-500', label: 'Precaución', ring: 'ring-amber-500/30' },
    unreliable: { color: 'bg-red-500', label: 'No confiable', ring: 'ring-red-500/30' },
  };
  const c = config[status];
  return (
    <div className="flex items-center gap-2">
      <div className={cn('h-3 w-3 rounded-full ring-2', c.color, c.ring)} />
      <span className="text-sm font-medium">{c.label}</span>
    </div>
  );
}

export function EvidenceBadge({ level }: { level: number }) {
  const colors: Record<number, string> = {
    1: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    2: 'bg-blue-100 text-blue-800 border-blue-200',
    3: 'bg-amber-100 text-amber-800 border-amber-200',
    4: 'bg-orange-100 text-orange-800 border-orange-200',
    5: 'bg-red-100 text-red-800 border-red-200',
  };
  const labels: Record<number, string> = {
    1: 'Nivel I',
    2: 'Nivel II',
    3: 'Nivel III',
    4: 'Nivel IV',
    5: 'Nivel V',
  };
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold', colors[level] || colors[5])}>
      {labels[level] || `Nivel ${level}`}
    </span>
  );
}

export function SourceTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    article: 'Artículo',
    book: 'Libro',
    clinical_guide: 'Guía Clínica',
    systematic_review: 'Revisión Sistemática',
    clinical_trial: 'Ensayo Clínico',
    web: 'Web',
  };
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {labels[type] || type}
    </span>
  );
}

export function ReliabilityBadge({ reliability }: { reliability: string }) {
  const config: Record<string, { class: string; label: string }> = {
    high: { class: 'bg-emerald-100 text-emerald-800', label: 'Alta' },
    medium: { class: 'bg-amber-100 text-amber-800', label: 'Media' },
    low: { class: 'bg-red-100 text-red-800', label: 'Baja' },
  };
  const c = config[reliability] || config.medium;
  return <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', c.class)}>{c.label}</span>;
}

export function PageHeader({ title, description, action }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
