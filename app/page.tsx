'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen, Search, Shield, GraduationCap, CheckCircle, Library,
  Layers, MessageSquare, ArrowRight, Users, BarChart3, FileText
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EduSearch</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-800 mb-6">
              <Search className="h-4 w-4" />
              Plataforma educativa basada en evidencia
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Búsqueda académica con <span className="text-blue-600">rigor científico</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              EduSearch es la plataforma que transforma la manera en que alumnos y profesores buscan, verifican y aplican
              fuentes académicas. Con herramientas de búsqueda avanzada, verificación de confiabilidad y generación de bibliografías.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Comenzar ahora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Iniciar sesión</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Students */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-4">
              <GraduationCap className="h-4 w-4" /> Para Alumnos
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Herramientas de búsqueda y análisis</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Desarrolla competencias en búsqueda académica, análisis crítico de fuentes y redacción científica basada en evidencia.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Search className="h-6 w-6 text-blue-600" />, title: 'Búsqueda Académica', desc: 'Busca fuentes con filtros por tipo, nivel de evidencia y año. Encuentra artículos, guías clínicas y revisiones sistemáticas.' },
              { icon: <CheckCircle className="h-6 w-6 text-emerald-600" />, title: 'Verificación de Fuentes', desc: 'Verifica la confiabilidad de cualquier fuente con nuestro semáforo de evidencia. Análisis de autoría, DOI y sesgo.' },
              { icon: <Library className="h-6 w-6 text-purple-600" />, title: 'Generador de Bibliografía', desc: 'Crea bibliografías en formato APA y Vancouver. Añade, edita y organiza tus fuentes académicas.' },
              { icon: <Layers className="h-6 w-6 text-amber-600" />, title: 'Pirámide de Evidencia', desc: 'Visualiza los niveles de evidencia científica. Comprende la jerarquía desde opinión de expertos hasta metaanálisis.' },
              { icon: <FileText className="h-6 w-6 text-rose-600" />, title: 'Casos Clínicos', desc: 'Resuelve casos asignados por tus profesores. Desarrolla análisis basados en evidencia y recibe retroalimentación.' },
              { icon: <MessageSquare className="h-6 w-6 text-cyan-600" />, title: 'Chat Educativo', desc: 'Consulta dudas sobre búsqueda académica, evaluación de fuentes y metodología de investigación.' },
            ].map((f, i) => (
              <Card key={i} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2">{f.icon}</div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features for Professors */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 mb-4">
              <BookOpen className="h-4 w-4" /> Para Profesores
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Gestión y evaluación educativa</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Crea casos clínicos, asigna actividades, evalúa competencias y monitorea el progreso de tus estudiantes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <FileText className="h-6 w-6 text-emerald-600" />, title: 'Crear Casos Clínicos', desc: 'Diseña casos con objetivos, criterios de evaluación y recursos sugeridos. Asigna a estudiantes individuales o grupos.' },
              { icon: <Users className="h-6 w-6 text-blue-600" />, title: 'Gestión de Estudiantes', desc: 'Monitorea el progreso, competencias y rendimiento de cada estudiante. Filtra por grupo y estado.' },
              { icon: <BarChart3 className="h-6 w-6 text-amber-600" />, title: 'Analíticas', desc: 'Visualiza métricas de progreso, competencias y actividad. Gráficos de rendimiento y heatmap de habilidades.' },
              { icon: <CheckCircle className="h-6 w-6 text-purple-600" />, title: 'Evaluaciones', desc: 'Evalúa respuestas con rúbricas personalizadas. Proporciona retroalimentación específica y calificaciones.' },
              { icon: <Layers className="h-6 w-6 text-rose-600" />, title: 'Hedges', desc: 'Crea y gestiona criterios de búsqueda, verificación y evaluación. Define reglas para mejorar la calidad académica.' },
              { icon: <Search className="h-6 w-6 text-cyan-600" />, title: 'Búsqueda y Recomendación', desc: 'Busca fuentes académicas y recomiéndalas a tus estudiantes para enriquecer los casos clínicos.' },
            ].map((f, i) => (
              <Card key={i} className="transition-shadow hover:shadow-lg bg-white">
                <CardHeader>
                  <div className="mb-2">{f.icon}</div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features for Admins */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 mb-4">
              <Shield className="h-4 w-4" /> Para Administradores
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Control total de la plataforma</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Gestiona usuarios, monitorea la salud del sistema, ejecuta pruebas y revisa auditorías.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Users className="h-6 w-6 text-amber-600" />, title: 'Gestión de Usuarios', desc: 'CRUD completo, roles, filtros, importar y exportar CSV.' },
              { icon: <Shield className="h-6 w-6 text-blue-600" />, title: 'Configuración', desc: 'Modo mantenimiento, seguridad, límites y ajustes del sistema.' },
              { icon: <BarChart3 className="h-6 w-6 text-emerald-600" />, title: 'Salud del Sistema', desc: 'Monitoreo de servicios, latencia, uptime y errores.' },
              { icon: <FileText className="h-6 w-6 text-purple-600" />, title: 'Auditoría', desc: 'Logs de acciones, filtros avanzados y exportación de reportes.' },
            ].map((f, i) => (
              <Card key={i} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2">{f.icon}</div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Comienza a usar EduSearch hoy</h2>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto">
            Regístrate gratis y accede a todas las herramientas de búsqueda académica, verificación de fuentes y gestión educativa.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Crear cuenta <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>EduSearch - Plataforma Educativa Basada en Evidencia</p>
        </div>
      </footer>
    </div>
  );
}
