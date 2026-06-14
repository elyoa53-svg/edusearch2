'use client';

import { useState, useEffect } from 'react';
import { configRepo } from '@/lib/repository';
import { SystemConfig, SourceType } from '@/lib/types';
import { PageHeader } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const current = configRepo.get();
    setConfig(current);
  }, []);

  if (!config) return null;

  const handleSave = () => {
    configRepo.set(config);
    setIsSaved(true);
    toast.success('Configuración guardada exitosamente');
  };

  const handleReset = () => {
    configRepo.reset();
    const reset = configRepo.get();
    setConfig(reset);
    setIsSaved(true);
    toast.success('Configuración restablecida a valores por defecto');
  };

  const handleChange = (updates: Partial<SystemConfig>) => {
    setConfig({ ...config, ...updates });
    setIsSaved(false);
  };

  const handleSearchConfigChange = (updates: Partial<typeof config.searchConfig>) => {
    handleChange({ searchConfig: { ...config.searchConfig, ...updates } });
  };

  const handleVerificationConfigChange = (updates: Partial<typeof config.verificationConfig>) => {
    handleChange({ verificationConfig: { ...config.verificationConfig, ...updates } });
  };

  const handleSecurityConfigChange = (updates: Partial<typeof config.securityConfig>) => {
    handleChange({ securityConfig: { ...config.securityConfig, ...updates } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración del Sistema"
        description="Manage system settings and platform configuration"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer Valores
            </Button>
            <Button onClick={handleSave} disabled={isSaved}>
              <Settings className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>Basic platform settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nombre de la Plataforma</Label>
            <Input
              value={config.platformName}
              onChange={(e) => handleChange({ platformName: e.target.value })}
              placeholder="EduSearch"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>Modo de Mantenimiento</Label>
            <Switch
              checked={config.maintenanceMode}
              onCheckedChange={(checked) => handleChange({ maintenanceMode: checked })}
            />
          </div>
          <div>
            <Label>Límite de Usuarios</Label>
            <Input
              type="number"
              value={config.userLimit}
              onChange={(e) => handleChange({ userLimit: parseInt(e.target.value) })}
              min={1}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Búsqueda</CardTitle>
          <CardDescription>Search engine settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Máximo de Resultados</Label>
            <Input
              type="number"
              value={config.searchConfig.maxResults}
              onChange={(e) => handleSearchConfigChange({ maxResults: parseInt(e.target.value) })}
              min={1}
              max={500}
            />
          </div>
          <div>
            <Label>Filtro Predeterminado</Label>
            <Select
              value={config.searchConfig.defaultFilter}
              onValueChange={(v) => handleSearchConfigChange({ defaultFilter: v as SourceType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Artículo</SelectItem>
                <SelectItem value="book">Libro</SelectItem>
                <SelectItem value="clinical_guide">Guía Clínica</SelectItem>
                <SelectItem value="systematic_review">Revisión Sistemática</SelectItem>
                <SelectItem value="clinical_trial">Ensayo Clínico</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>Habilitar IA en Búsquedas</Label>
            <Switch
              checked={config.searchConfig.enableAI}
              onCheckedChange={(checked) => handleSearchConfigChange({ enableAI: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Verificación</CardTitle>
          <CardDescription>Source verification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <Label>Modo Estricto</Label>
            <Switch
              checked={config.verificationConfig.strictMode}
              onCheckedChange={(checked) => handleVerificationConfigChange({ strictMode: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>Verificación Automática</Label>
            <Switch
              checked={config.verificationConfig.autoVerify}
              onCheckedChange={(checked) => handleVerificationConfigChange({ autoVerify: checked })}
            />
          </div>
          <div>
            <Label>Puntuación Mínima de Confiabilidad: {config.verificationConfig.minReliabilityScore}%</Label>
            <Slider
              value={[config.verificationConfig.minReliabilityScore]}
              onValueChange={(v) => handleVerificationConfigChange({ minReliabilityScore: v[0] })}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Seguridad</CardTitle>
          <CardDescription>Security and access control settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Máximo de Intentos de Acceso</Label>
            <Input
              type="number"
              value={config.securityConfig.maxLoginAttempts}
              onChange={(e) => handleSecurityConfigChange({ maxLoginAttempts: parseInt(e.target.value) })}
              min={1}
              max={20}
            />
          </div>
          <div>
            <Label>Tiempo de Sesión (minutos)</Label>
            <Input
              type="number"
              value={config.securityConfig.sessionTimeout}
              onChange={(e) => handleSecurityConfigChange({ sessionTimeout: parseInt(e.target.value) })}
              min={1}
              max={1440}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>Autenticación de Dos Factores</Label>
            <Switch
              checked={config.securityConfig.twoFactorAuth}
              onCheckedChange={(checked) => handleSecurityConfigChange({ twoFactorAuth: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
