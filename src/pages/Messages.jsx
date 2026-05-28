import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Lock, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function Messages() {
  const { lang } = useI18n();
  const [user, setUser] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: threads = [], refetch: refetchThreads } = useQuery({
    queryKey: ['chat-threads', user?.email],
    queryFn: () => base44.entities.ChatThread.list('-updated_date', 50),
    enabled: !!user?.email,
    initialData: [],
  });

  // Initial load of messages
  useEffect(() => {
    if (selectedThread?.id) {
      base44.entities.ChatMessage.filter({ thread_id: selectedThread.id }, 'created_date', 100)
        .then(setMessages)
        .catch(() => {});
    }
  }, [selectedThread?.id]);

  // Subscribe to new messages in real-time
  useEffect(() => {
    if (!selectedThread?.id) return;
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data.thread_id === selectedThread.id) {
        if (event.type === 'create') {
          setMessages(prev => [...prev, event.data]);
          // Notify owner/renter about new message
          const otherEmail = selectedThread.participant_emails.find(e => e !== user?.email);
          base44.entities.Notification.create({
            user_email: otherEmail,
            type: 'system',
            title: lang === 'bg' ? 'Ново съобщение' : 'New message',
            message: `${user?.full_name || 'User'}: ${event.data.content.substring(0, 50)}${event.data.content.length > 50 ? '...' : ''}`,
            link: `/messages`,
          }).catch(() => {});
        }
      }
    });
    return unsubscribe;
  }, [selectedThread?.id, user?.email, lang]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;
    await base44.entities.ChatMessage.create({
      thread_id: selectedThread.id,
      sender_email: user.email,
      sender_name: user.full_name,
      content: newMessage,
    });
    await base44.entities.ChatThread.update(selectedThread.id, {
      last_message: newMessage,
      last_message_at: new Date().toISOString(),
    });
    setNewMessage('');
    refetchThreads();
  };

  const otherParticipant = (thread) => {
    const names = thread.participant_names || [];
    const emails = thread.participant_emails || [];
    const idx = emails.indexOf(user?.email);
    return names[idx === 0 ? 1 : 0] || emails[idx === 0 ? 1 : 0] || 'User';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-heading text-2xl font-bold mb-6">
        {lang === 'bg' ? 'Съобщения' : 'Messages'}
      </h1>

      <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Thread list */}
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={lang === 'bg' ? 'Търси...' : 'Search...'} className="pl-9 h-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{lang === 'bg' ? 'Няма съобщения' : 'No messages'}</p>
              </div>
            ) : (
              threads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`w-full text-left p-3 border-b border-border/30 hover:bg-muted/50 transition-colors ${selectedThread?.id === thread.id ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-semibold">{otherParticipant(thread)[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{otherParticipant(thread)}</p>
                      <p className="text-xs text-muted-foreground truncate">{thread.last_message}</p>
                    </div>
                    {!thread.is_unlocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="md:col-span-2 bg-card rounded-xl border border-border/50 flex flex-col overflow-hidden">
          {selectedThread ? (
            <>
              <div className="p-4 border-b border-border/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{otherParticipant(selectedThread)[0]}</span>
                </div>
                <span className="font-medium text-sm">{otherParticipant(selectedThread)}</span>
                {!selectedThread.is_unlocked && (
                  <Badge variant="outline" className="text-[10px] gap-1"><Lock className="w-3 h-3" />{lang === 'bg' ? 'Ограничен' : 'Restricted'}</Badge>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => {
                  const isMe = msg.sender_email === user?.email;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMe ? 'gradient-bg text-white' : 'bg-muted'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-muted-foreground'}`}>
                          {msg.created_date ? format(new Date(msg.created_date), 'HH:mm') : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-border/50 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={lang === 'bg' ? 'Напиши съобщение...' : 'Type a message...'}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  disabled={!selectedThread.is_unlocked}
                />
                <Button onClick={sendMessage} size="icon" className="gradient-bg text-white border-0 shrink-0" disabled={!selectedThread.is_unlocked}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">{lang === 'bg' ? 'Изберете разговор' : 'Select a conversation'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}