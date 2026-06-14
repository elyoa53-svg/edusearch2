'use client';

import { useState, useEffect } from 'react';
import { testRepo } from '@/lib/repository';
import { TestCase } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Zap, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TestingPage() {
  const [tests, setTests] = useState<TestCase[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const allTests = testRepo.getAll();
    setTests(allTests);
  }, []);

  const handleRunTest = (testId: string) => {
    setRunningTests(new Set(runningTests).add(testId));
    testRepo.runTest(testId);
    const updated = testRepo.getAll();
    setTests(updated);

    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const passed = Math.random() > 0.2;
      const duration = (Math.random() * 2 + 0.5).toFixed(1);
      testRepo.completeTest(testId, passed, parseFloat(duration));

      const finalUpdated = testRepo.getAll();
      setTests(finalUpdated);
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });

      const test = finalUpdated.find(t => t.id === testId);
      if (test) {
        setSelectedTest(test);
        toast.success(`Test ${test.status === 'passed' ? 'passed' : 'failed'}`);
      }
    }, delay);
  };

  const handleRunAllTests = () => {
    const testIds = tests.filter(t => t.status !== 'running').map(t => t.id);
    testIds.forEach(id => handleRunTest(id));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <AlertCircle className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-emerald-100 text-emerald-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const runningCount = tests.filter(t => t.status === 'running').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de Pruebas"
        description="Run and monitor system tests"
        action={
          <Button onClick={handleRunAllTests} disabled={runningCount > 0}>
            <Play className="h-4 w-4 mr-2" />
            Ejecutar Todas las Pruebas
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Exitosas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{passedCount}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fallidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{failedCount}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En Ejecución</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{runningCount}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Casos de Prueba ({tests.length})</CardTitle>
          <CardDescription>Tasa de éxito: {passedCount > 0 ? Math.round((passedCount / (passedCount + failedCount)) * 100) : 0}%</CardDescription>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <EmptyState title="Sin pruebas" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Último Ejecutado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.status)}
                          <Badge className={getStatusColor(test.status)}>
                            {test.status === 'passed' ? 'Exitosa' :
                             test.status === 'failed' ? 'Fallida' :
                             test.status === 'running' ? 'En ejecución' :
                             'Pendiente'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {test.duration ? `${test.duration}s` : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {test.lastRun ? new Date(test.lastRun).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleRunTest(test.id)}
                          disabled={runningTests.has(test.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Ejecutar
                        </Button>
                        {test.logs.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTest(test)}
                            className="ml-2"
                          >
                            Logs
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTest && selectedTest.logs.length > 0 && (
        <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
          <DialogContent className="max-w-2xl max-h-96">
            <DialogHeader>
              <DialogTitle>{selectedTest.name} - Logs</DialogTitle>
              <DialogDescription>Test execution details and logs</DialogDescription>
            </DialogHeader>
            <ScrollArea className="w-full h-64 rounded-md border bg-muted p-4">
              <div className="font-mono text-sm space-y-2">
                {selectedTest.logs.map((log, i) => (
                  <div key={i} className="text-muted-foreground">
                    <span className="text-primary">{'>'}</span> {log}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
