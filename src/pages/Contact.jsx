import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Send, Loader2, CheckCircle } from 'lucide-react';

export default function Contact() {
  const { lang } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = lang === 'bg' ? 'Полето е задължително' : 'Required';
    if (!form.email.trim()) e.email = lang === 'bg' ? 'Полето е задължително' : 'Required';
    if (!form.subject.trim()) e.subject = lang === 'bg' ? 'Полето е задължително' : 'Required';
    if (!form.message.trim()) e.message = lang === 'bg' ? 'Полето е задължително' : 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          {lang === 'bg' ? 'Свържете се с нас' : 'Contact Us'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'bg' ? 'Имате въпрос? Ние сме тук да помогнем.' : "Have a question? We're here to help."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card><CardContent className="p-5 flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Email</h3>
              <a href="mailto:stanislav@rentmemarket.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                stanislav@rentmemarket.com
              </a>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-5 flex items-start gap-3">
            <Phone className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">{lang === 'bg' ? 'Телефон' : 'Phone'}</h3>
              <a href="tel:+19073139614" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                (907) 313-9614
              </a>
            </div>
          </CardContent></Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <CheckCircle className="w-14 h-14 text-green-500" />
                  <h3 className="font-heading text-xl font-bold text-gray-900">
                    {lang === 'bg' ? 'Съобщението е изпратено!' : 'Message sent!'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {lang === 'bg'
                      ? 'Ще се свържем с вас в рамките на 24 часа.'
                      : "We'll get back to you within 24 hours."}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    {lang === 'bg' ? 'Изпрати ново съобщение' : 'Send another message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>{lang === 'bg' ? 'Име' : 'Name'}</Label>
                      <Input
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className={`mt-1 ${errors.name ? 'border-red-400' : ''}`}
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className={`mt-1 ${errors.email ? 'border-red-400' : ''}`}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <Label>{lang === 'bg' ? 'Тема' : 'Subject'}</Label>
                    <Input
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className={`mt-1 ${errors.subject ? 'border-red-400' : ''}`}
                    />
                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <Label>{lang === 'bg' ? 'Съобщение' : 'Message'}</Label>
                    <Textarea
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      className={`mt-1 ${errors.message ? 'border-red-400' : ''}`}
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  </div>
                  <Button type="submit" disabled={loading} className="gradient-bg text-white border-0 gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {lang === 'bg' ? 'Изпрати' : 'Send'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
