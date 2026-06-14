'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { chatRepo, getChatResponse } from '@/lib/repository';
import { ChatMessage } from '@/lib/types';
import { PageHeader } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Zap, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

const SUGGESTED_QUESTIONS = [
  '¿Cuál es el estado actual del sistema?',
  '¿Cuántos usuarios activos hay en el sistema?',
  '¿Cuáles son las alertas de seguridad más críticas?',
  '¿Qué acciones realizaron los administradores hoy?',
  '¿Cuál es el servicio con mayor latencia?',
];

export default function AdminChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const userMessages = chatRepo.getByUser(user.id, 'admin');
      setMessages(userMessages);
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
      role: 'user',
      content: input,
      userId: user.id,
      context: 'admin',
    };

    const savedUserMsg = chatRepo.create(userMessage);
    setMessages(prev => [...prev, savedUserMsg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const response = getChatResponse(input, 'admin');
      const assistantMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: response,
        userId: user.id,
        context: 'admin',
      };

      const savedAssistantMsg = chatRepo.create(assistantMessage);
      setMessages(prev => [...prev, savedAssistantMsg]);
      setIsLoading(false);
    }, 800);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat Educativo - Administración"
        description="Get AI-powered insights about system status and administration"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Soporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Obtén ayuda sobre gestión de usuarios y configuración del sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Consulta sobre problemas de seguridad y alertas del sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Analiza el rendimiento del sistema y las métricas clave
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Auditoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Revisa logs de auditoría y actividades del sistema
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col h-[600px]">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
          <CardDescription>
            {messages.length === 0
              ? 'Haz una pregunta sobre el estado del sistema'
              : `${messages.length} mensajes en esta conversación`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Inicia una conversación</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.role === 'user' ? 'opacity-70' : 'opacity-60'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {messages.length === 0 && (
            <div className="p-4 border-t">
              <p className="text-sm font-medium mb-3">Preguntas sugeridas:</p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => handleSuggestedQuestion(q)}
                  >
                    <span className="text-sm">{q}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t p-4 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
