'use client';

import { useState, useEffect } from 'react';
import { configRepo, resetDatabase } from '@/lib/repository';
import { SystemConfig } from '@/lib/types';
import { PageHeader } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Building2, Shield, Palette, Bell, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [institutionName, setInstitutionName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [alertFrequency, setAlertFrequency] = useState('daily');
  const [passwordPolicy, setPasswordPolicy] = useState('strong');
  const [sessionDuration, setSessionDuration] = useState('30');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const current = configRepo.get();
    setConfig(current);
    const settings = JSON.parse(localStorage.getItem('edusearch_settings') || '{}');
    setInstitutionName(settings.institutionName || 'EduSearch');
    setLogoUrl(settings.logoUrl || '');
    setDescription(settings.description || '');
    setTheme(settings.theme || 'light');
    setPrimaryColor(settings.primaryColor || '#3b82f6');
    setEmailNotifications(settings.emailNotifications !== false);
    setAlertFrequency(settings.alertFrequency || 'daily');
    setPasswordPolicy(settings.passwordPolicy || 'strong');
    setSessionDuration(settings.sessionDuration || '30');
  }, []);

  const handleSaveSettings = () => {
    const settings = {
      institutionName,
      logoUrl,
      description,
      theme,
      primaryColor,
      emailNotifications,
      alertFrequency,
      passwordPolicy,
      sessionDuration,
    };
    localStorage.setItem('edusearch_settings', JSON.stringify(settings));
    toast.success('Configuración guardada exitosamente');
  };

  const handleResetDemo = () => {
    resetDatabase();
    setShowResetConfirm(false);
    toast.success('Base de datos restablecida a valores de demostración');
  };

  const permissions = [
    { name: 'Crear usuarios', roles: ['admin'], icon: '👥' },
    { name: 'Editar configuración', roles: ['admin'], icon: '⚙️' },
    { name: 'Ver audit logs', roles: ['admin'], icon: '📋' },
    { name: 'Crear casos clínicos', roles: ['admin', 'professor'], icon: '📚' },
    { name: 'Evaluar respuestas', roles: ['admin', 'professor'], icon: '✅' },
    { name: 'Realizar búsquedas', roles: ['admin', 'professor', 'student'], icon: '🔍' },
    { name: 'Verificar fuentes', roles: ['admin', 'professor', 'student'], icon: '🔐' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración de Administración"
        description="Manage institutional settings and preferences"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Perfil Institucional
          </CardTitle>
          <CardDescription>Configure your institution information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nombre de la Institución</Label>
            <Input
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="EduSearch"
            />
          </div>
          <div>
            <Label>URL del Logo</Label>
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Una descripción breve de tu institución..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuración de Seguridad
          </CardTitle>
          <CardDescription>Manage security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Politica de Contrasenas</Label>
              <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weak">Debil (6+ caracteres)</SelectItem>
                  <SelectItem value="medium">Media (8+ caracteres, numeros)</SelectItem>
                  <SelectItem value="strong">Fuerte (12+ caracteres, simbolos)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duracion de Sesion</Label>
              <Select value={sessionDuration} onValueChange={setSessionDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="480">8 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline" className="ml-auto">Matriz de Permisos</Badge>
            Roles y Permisos
          </CardTitle>
          <CardDescription>View role-based access control matrix</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {permissions.map((perm, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{perm.icon}</span>
                  <span className="font-medium">{perm.name}</span>
                </div>
                <div className="flex gap-2">
                  {perm.roles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role === 'admin' ? 'Administrador' :
                       role === 'professor' ? 'Profesor' :
                       'Estudiante'}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Preferencias Visuales
          </CardTitle>
          <CardDescription>Customize appearance settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tema</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Color Primario</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-14"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configuración de Notificaciones
          </CardTitle>
          <CardDescription>Manage notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <Label>Notificaciones por Email</Label>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          {emailNotifications && (
            <div>
              <Label>Frecuencia de Alertas</Label>
              <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Inmediata</SelectItem>
                  <SelectItem value="hourly">Cada hora</SelectItem>
                  <SelectItem value="daily">Diaria</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSaveSettings} className="flex-1">
          Guardar Configuración
        </Button>
        <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <Button
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer Datos de Demostración
          </Button>
          <AlertDialogContent>
            <AlertDialogTitle>Restablecer base de datos</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea restablecer la base de datos a los datos de demostración? Se perderán todos los cambios realizados.
            </AlertDialogDescription>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetDemo}>
                Restablecer
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
