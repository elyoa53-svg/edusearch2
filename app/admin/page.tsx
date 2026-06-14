'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sbUserRepo, sbAuditRepo } from '@/lib/supabase-repository';
import { healthRepo } from '@/lib/repository';
import { User, AuditLog, SystemHealth } from '@/lib/types';
import { StatCard, PageHeader } from '@/components/shared-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, AlertCircle, Activity, Settings, Zap, FileText, BarChart3, ClipboardCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sbUserRepo.getAll(),
      sbAuditRepo.getAll(),
    ]).then(([allUsers, allLogs]) => {
      setUsers(allUsers);
      setLogs(allLogs.slice(0, 5));
      setHealth(healthRepo.get());
      setLoading(false);
    });
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.active).length;
  const professors = users.filter(u => u.role === 'professor').length;
  const students = users.filter(u => u.role === 'student').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de Administración"
        description="Gestión de usuarios, sistema y monitoreo"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de Usuarios" value={totalUsers} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Usuarios Activos" value={activeUsers} icon={<Activity className="h-4 w-4" />} />
        <StatCard title="Profesores" value={professors} icon={<BarChart3 className="h-4 w-4" />} />
        <StatCard title="Estudiantes" value={students} icon={<Users className="h-4 w-4" />} />
      </div>

      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Estado general de la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  health.overall === 'healthy' ? 'bg-emerald-500' :
                  health.overall === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span className="font-medium">
                  {health.overall === 'healthy' ? 'Sistema Saludable' :
                   health.overall === 'warning' ? 'Advertencia' : 'Sistema Crítico'}
                </span>
              </div>
              <Badge variant={health.overall === 'healthy' ? 'default' : health.overall === 'warning' ? 'secondary' : 'destructive'}>
                {health.overall}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Uptime General</p><p className="font-semibold">{health.uptime}%</p></div>
              <div><p className="text-muted-foreground">Errores Detectados</p><p className="font-semibold">{health.errorCount}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Logs de Auditoría Recientes</CardTitle>
            <CardDescription>Últimas 5 entradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sin logs disponibles</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{log.userName}</p>
                      <p className="text-xs text-muted-foreground">{log.action} • {log.resource}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas Recientes</CardTitle>
            <CardDescription>Alertas activas del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!health || health.services.filter(s => s.status !== 'healthy').length === 0 ? (
                <p className="text-muted-foreground text-sm">Sin alertas activas</p>
              ) : (
                health.services.filter(s => s.status !== 'healthy').map((service) => (
                  <div key={service.name} className="flex items-start gap-2 p-2 rounded-md bg-muted">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acceso Rápido</CardTitle>
          <CardDescription>Tareas de administración frecuentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/admin/users" className="block">
              <Button variant="outline" className="w-full justify-start"><Users className="h-4 w-4 mr-2" />Gestión de Usuarios</Button>
            </Link>
            <Link href="/admin/system" className="block">
              <Button variant="outline" className="w-full justify-start"><Settings className="h-4 w-4 mr-2" />Configuración del Sistema</Button>
            </Link>
            <Link href="/admin/health" className="block">
              <Button variant="outline" className="w-full justify-start"><Zap className="h-4 w-4 mr-2" />Salud del Sistema</Button>
            </Link>
            <Link href="/admin/testing" className="block">
              <Button variant="outline" className="w-full justify-start"><ClipboardCheck className="h-4 w-4 mr-2" />Panel de Pruebas</Button>
            </Link>
            <Link href="/admin/audit" className="block">
              <Button variant="outline" className="w-full justify-start"><FileText className="h-4 w-4 mr-2" />Logs de Auditoría</Button>
            </Link>
            <Link href="/admin/settings" className="block">
              <Button variant="outline" className="w-full justify-start"><Settings className="h-4 w-4 mr-2" />Configuración</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
