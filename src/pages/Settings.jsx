import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { User, Bell, Globe, Shield, Save, Loader2 } from 'lucide-react';

export default function Settings() {
  const { lang, switchLang } = useI18n();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ phone: '', city: '', bio: '' });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setProfile({ phone: u.phone || '', city: u.city || '', bio: u.bio || '' });
    }).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    await base44.auth.updateMe(profile);
    toast.success(lang === 'bg' ? 'Запазено!' : 'Saved!');
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-heading text-2xl md:text-3xl font-bold mb-8">
        {lang === 'bg' ? 'Настройки' : 'Settings'}
      </h1>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> {lang === 'bg' ? 'Профил' : 'Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{lang === 'bg' ? 'Име' : 'Name'}</Label>
              <Input value={user?.full_name || ''} disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label>{lang === 'bg' ? 'Телефон' : 'Phone'}</Label>
              <Input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>{lang === 'bg' ? 'Град' : 'City'}</Label>
              <Input value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} className="mt-1" />
            </div>
            <Button onClick={saveProfile} disabled={saving} className="gradient-bg text-white border-0 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {lang === 'bg' ? 'Запази' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" /> {lang === 'bg' ? 'Език' : 'Language'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant={lang === 'bg' ? 'default' : 'outline'} onClick={() => switchLang('bg')}>🇧🇬 Български</Button>
              <Button variant={lang === 'en' ? 'default' : 'outline'} onClick={() => switchLang('en')}>🇬🇧 English</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" /> {lang === 'bg' ? 'Известия' : 'Notifications'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{lang === 'bg' ? 'Email известия' : 'Email notifications'}</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{lang === 'bg' ? 'Известия за нови заявки' : 'New request notifications'}</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{lang === 'bg' ? 'Маркетинг' : 'Marketing'}</span>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}