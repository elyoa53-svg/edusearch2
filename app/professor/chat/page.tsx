'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { chatRepo, getChatResponse } from '@/lib/repository';
import { ChatMessage } from '@/lib/types';
import { PageHeader } from '@/components/shared-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const SUGGESTED_QUESTIONS = [
  '¿Cómo crear un caso clínico efectivo?',
  '¿Cuáles son los mejores criterios de evaluación?',
  '¿Cómo diseñar una rúbrica de evaluación?',
  '¿Qué elementos debe tener un buen caso clínico?',
  '¿Cómo proporcionar retroalimentación efectiva?',
  '¿Cómo usar la taxonomía de Bloom en objetivos?',
];

export default function ProfessorChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const userMessages = chatRepo.getByUser(user.id, 'professor');
    setMessages(userMessages);
  }, [user]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage = chatRepo.create({
      role: 'user',
      content: input.trim(),
      userId: user.id,
      context: 'professor',
    });
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = getChatResponse(input, 'professor');
      const assistantMessage = chatRepo.create({
        role: 'assistant',
        content: response,
        userId: user.id,
        context: 'professor',
      });
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Error al obtener respuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleClearChat = () => {
    if (user) {
      chatRepo.clear(user.id, 'professor');
      setMessages([]);
      toast.success('Chat limpiado');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Chat Educativo"
        description="Asistente para profesores sobre diseño de casos y evaluaciones"
        action={
          <Button variant="outline" onClick={handleClearChat} size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar Chat
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-96 flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">Conversación</CardTitle>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Inicia una conversación</p>
                    <p className="text-sm">Haz preguntas sobre diseño de casos clínicos y evaluaciones</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg p-3 ${msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                          }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm animate-pulse">Pensando...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <Separator />
            <CardContent className="pt-4 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preguntas Sugeridas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
                  onClick={() => handleSuggestedQuestion(q)}
                >
                  <span className="text-sm">{q}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
