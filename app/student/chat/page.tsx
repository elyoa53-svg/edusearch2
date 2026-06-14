'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { chatRepo, getChatResponse } from '@/lib/repository';
import { ChatMessage } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Send, Trash2, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const suggestedQuestions = [
  'Cómo hacer una búsqueda académica efectiva',
  'Qué es la pirámide de evidencia',
  'Cómo verificar una fuente confiable',
  'Formato APA vs Vancouver',
  'Consejos para análisis crítico de estudios',
];

export default function StudentChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      const chatMessages = chatRepo.getByUser(user.id, 'student');
      setMessages(chatMessages);
    }
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || !user?.id) return;

    setLoading(true);

    try {
      const userMessage = chatRepo.create({
        role: 'user',
        content: messageText,
        userId: user.id,
        context: 'student',
      });

      setMessages(prev => [...prev, userMessage]);
      setInput('');

      setTimeout(() => {
        const response = getChatResponse(messageText, 'student');
        const assistantMessage = chatRepo.create({
          role: 'assistant',
          content: response,
          userId: user.id,
          context: 'student',
        });
        setMessages(prev => [...prev, assistantMessage]);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (user?.id) {
      chatRepo.clear(user.id, 'student');
      setMessages([]);
      toast.success('Chat limpiado');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat Educativo"
        description="Obtén ayuda sobre búsquedas, casos y más"
        action={
          messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Limpiar Chat
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-96 flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between">
              {messages.length === 0 ? (
                <EmptyState
                  icon={<MessageSquare className="h-12 w-12" />}
                  title="Comienza la conversación"
                  description="Pregunta sobre búsquedas académicas, niveles de evidencia, bibliografía y más"
                />
              ) : (
                <>
                  <div className="space-y-4">
                    {messages.map((msg) => (
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
                        </div>
                      </div>
                    ))}
                  </div>
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
              disabled={loading}
            />
            <Button onClick={() => handleSendMessage()} disabled={loading || !input.trim()} className="gap-2">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-sm">Preguntas Sugeridas</h3>
              </div>
              <div className="space-y-2">
                {suggestedQuestions.map((q, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendMessage(q)}
                    disabled={loading}
                    className="h-auto justify-start text-left whitespace-normal text-xs"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
