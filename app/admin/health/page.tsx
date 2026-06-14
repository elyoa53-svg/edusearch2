'use client';

import { useState, useEffect } from 'react';
import { healthRepo } from '@/lib/repository';
import { SystemHealth } from '@/lib/types';
import { PageHeader } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, RefreshCw, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function HealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const current = healthRepo.get();
    setHealth(current);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const updated = healthRepo.refresh();
      setHealth(updated);
      setIsRefreshing(false);
      toast.success('Health status actualizado');
    }, 800);
  };

  if (!health) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <div className="h-3 w-3 rounded-full bg-emerald-500" />;
      case 'warning':
        return <div className="h-3 w-3 rounded-full bg-amber-500" />;
      case 'critical':
        return <div className="h-3 w-3 rounded-full bg-red-500" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-500" />;
    }
  };

  const healthyCount = health.services.filter(s => s.status === 'healthy').length;
  const warningCount = health.services.filter(s => s.status === 'warning').length;
  const criticalCount = health.services.filter(s => s.status === 'critical').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salud del Sistema"
        description="Monitor system health and service status"
        action={
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estado General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-4 w-4 rounded-full ${
                health.overall === 'healthy' ? 'bg-emerald-500' :
                health.overall === 'warning' ? 'bg-amber-500' :
                'bg-red-500'
              }`} />
              <span className="text-2xl font-bold">
                {health.overall === 'healthy' ? 'Saludable' :
                 health.overall === 'warning' ? 'Advertencia' :
                 'Crítico'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Actualizado: {new Date(health.lastUpdated).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.uptime}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Tasa de disponibilidad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Errores Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{health.errorCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span>En las últimas 24 horas</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Servicios Saludables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{healthyCount}</div>
            <p className="text-xs text-muted-foreground">De {health.services.length} servicios</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alertas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{warningCount + criticalCount}</div>
            <p className="text-xs text-muted-foreground">{warningCount} advertencias, {criticalCount} críticas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Servicios</CardTitle>
          <CardDescription>Individual service health status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {health.services.map((service) => (
              <div key={service.name} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <div>
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-xs text-muted-foreground">{service.message}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(service.status)} variant="outline">
                    {service.status === 'healthy' ? 'Saludable' :
                     service.status === 'warning' ? 'Advertencia' :
                     'Crítico'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Latencia</p>
                    <p className="font-semibold">{service.latency}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uptime</p>
                    <p className="font-semibold">{service.uptime}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Último Chequeo</p>
                    <p className="font-semibold text-xs">
                      {new Date(service.lastChecked).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
