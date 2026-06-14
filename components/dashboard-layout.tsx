'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu, LogOut, BookOpen, GraduationCap, Shield, Search, FileText,
  MessageSquare, Library, ChevronRight, BarChart3, Users, Settings,
  Activity, TestTube, ClipboardList, Layers, CheckCircle, Home
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const studentNav: NavItem[] = [
  { title: 'Dashboard', href: '/student', icon: <Home className="h-4 w-4" /> },
  { title: 'Búsqueda', href: '/student/search', icon: <Search className="h-4 w-4" /> },
  { title: 'Casos', href: '/student/cases', icon: <FileText className="h-4 w-4" /> },
  { title: 'Chat', href: '/student/chat', icon: <MessageSquare className="h-4 w-4" /> },
  { title: 'Bibliografía', href: '/student/bibliography', icon: <Library className="h-4 w-4" /> },
  { title: 'Pirámide', href: '/student/pyramid', icon: <Layers className="h-4 w-4" /> },
  { title: 'Verificar', href: '/student/verify', icon: <CheckCircle className="h-4 w-4" /> },
];

const professorNav: NavItem[] = [
  { title: 'Dashboard', href: '/professor', icon: <Home className="h-4 w-4" /> },
  { title: 'Búsqueda', href: '/professor/search', icon: <Search className="h-4 w-4" /> },
  { title: 'Casos', href: '/professor/cases', icon: <FileText className="h-4 w-4" /> },
  { title: 'Estudiantes', href: '/professor/students', icon: <Users className="h-4 w-4" /> },
  { title: 'Evaluaciones', href: '/professor/evaluations', icon: <ClipboardList className="h-4 w-4" /> },
  { title: 'Analíticas', href: '/professor/analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { title: 'Hedges', href: '/professor/hedges', icon: <Layers className="h-4 w-4" /> },
  { title: 'Chat', href: '/professor/chat', icon: <MessageSquare className="h-4 w-4" /> },
];

const adminNav: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: <Home className="h-4 w-4" /> },
  { title: 'Usuarios', href: '/admin/users', icon: <Users className="h-4 w-4" /> },
  { title: 'Sistema', href: '/admin/system', icon: <Settings className="h-4 w-4" /> },
  { title: 'Salud', href: '/admin/health', icon: <Activity className="h-4 w-4" /> },
  { title: 'Testing', href: '/admin/testing', icon: <TestTube className="h-4 w-4" /> },
  { title: 'Auditoría', href: '/admin/audit', icon: <ClipboardList className="h-4 w-4" /> },
  { title: 'Ajustes', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
  { title: 'Chat', href: '/admin/chat', icon: <MessageSquare className="h-4 w-4" /> },
];

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'student': return studentNav;
    case 'professor': return professorNav;
    case 'admin': return adminNav;
    default: return [];
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'student': return 'Alumno';
    case 'professor': return 'Profesor';
    case 'admin': return 'Administrador';
    default: return role;
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'student': return <GraduationCap className="h-4 w-4" />;
    case 'professor': return <BookOpen className="h-4 w-4" />;
    case 'admin': return <Shield className="h-4 w-4" />;
    default: return null;
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case 'student': return 'bg-blue-500';
    case 'professor': return 'bg-emerald-500';
    case 'admin': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
}

function SidebarContent({ navItems, pathname, user, onLogout, onNavigate }: {
  navItems: NavItem[];
  pathname: string;
  user: { name: string; email: string; role: string };
  onLogout: () => void | Promise<void>;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">EduSearch</span>
        </div>
      </div>

      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className={cn('h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-sm', getRoleColor(user.role))}>
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <div className="flex items-center gap-1">
              {getRoleIcon(user.role)}
              <span className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${user.role}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.icon}
                <span className="flex-1">{item.title}</span>
                {item.badge && <Badge variant="secondary" className="text-xs">{item.badge}</Badge>}
                {isActive && <ChevronRight className="h-3 w-3" />}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const getPageTitle = () => {
    const item = navItems.find(i => pathname === i.href || (i.href !== `/${user.role}` && pathname.startsWith(i.href)));
    if (item) return item.title;
    if (pathname === `/${user.role}`) return 'Dashboard';
    return 'EduSearch';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-card">
        <SidebarContent
          navItems={navItems}
          pathname={pathname}
          user={user}
          onLogout={logout}
        />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent
                navItems={navItems}
                pathname={pathname}
                user={user}
                onLogout={logout}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              {getRoleIcon(user.role)}
              <span>{getRoleLabel(user.role)}</span>
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
