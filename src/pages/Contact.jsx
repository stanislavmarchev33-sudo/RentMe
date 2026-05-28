import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

export default function Contact() {
  const { lang } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1000));
    toast.success(lang === 'bg' ? 'Съобщението е изпратено!' : 'Message sent!');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          {lang === 'bg' ? 'Свържете се с нас' : 'Contact Us'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'bg' ? 'Имате въпрос? Ние сме тук да помогнем.' : 'Have a question? We\'re here to help.'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card><CardContent className="p-5 flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Email</h3>
              <p className="text-sm text-muted-foreground">support@rentme.bg</p>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-5 flex items-start gap-3">
            <Phone className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">{lang === 'bg' ? 'Телефон' : 'Phone'}</h3>
              <p className="text-sm text-muted-foreground">+359 2 123 4567</p>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-5 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">{lang === 'bg' ? 'Адрес' : 'Address'}</h3>
              <p className="text-sm text-muted-foreground">{lang === 'bg' ? 'бул. Витоша 100, София' : '100 Vitosha Blvd, Sofia'}</p>
            </div>
          </CardContent></Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>{lang === 'bg' ? 'Име' : 'Name'}</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="mt-1" /></div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="mt-1" /></div>
                </div>
                <div><Label>{lang === 'bg' ? 'Тема' : 'Subject'}</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required className="mt-1" /></div>
                <div><Label>{lang === 'bg' ? 'Съобщение' : 'Message'}</Label><Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5} required className="mt-1" /></div>
                <Button type="submit" disabled={loading} className="gradient-bg text-white border-0 gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {lang === 'bg' ? 'Изпрати' : 'Send'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}