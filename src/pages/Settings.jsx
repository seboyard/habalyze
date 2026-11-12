import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  ArrowLeft, LogOut, Settings, User, Link2, Unlink, 
  Instagram, Crown, Shield, Bell, Palette, Moon, Sun, 
  Trash2, Mail, Share2, ExternalLink, Check, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import LanguageSelector from '../components/common/LanguageSelector';
import TelegramIntegration from '../components/settings/TelegramIntegration';
import UnveilIntegration from '../components/integrations/UnveilIntegration';
import WhatsAppIntegration from '../components/settings/WhatsAppIntegration';

// Discord icon component
const DiscordIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// Telegram icon component
const TelegramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const socialLinks = [
  {
    id: 'telegram',
    name: 'Telegram',
    icon: TelegramIcon,
    color: 'bg-[#0088cc]',
    description: 'Recibe recordatorios diarios',
    placeholder: '@tu_usuario',
    features: ['Recordatorios de hábitos', 'Notificaciones de logros', 'Resúmenes semanales']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]',
    description: 'Comparte tu progreso',
    placeholder: '@tu_usuario',
    features: ['Compartir logros en stories', 'Invitar amigos', 'Badges exclusivos']
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: DiscordIcon,
    color: 'bg-[#5865F2]',
    description: 'Únete a la comunidad',
    placeholder: 'usuario#1234',
    features: ['Servidor exclusivo', 'Roles por nivel', 'Eventos comunitarios']
  }
];

const accentColors = [
  { id: 'purple', name: 'Púrpura', color: 'bg-purple-500' },
  { id: 'blue', name: 'Azul', color: 'bg-blue-500' },
  { id: 'green', name: 'Verde', color: 'bg-green-500' },
  { id: 'orange', name: 'Naranja', color: 'bg-orange-500' },
  { id: 'pink', name: 'Rosa', color: 'bg-pink-500' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [linkedAccounts, setLinkedAccounts] = useState({});
  const [linkDialog, setLinkDialog] = useState({ open: false, social: null });
  const [linkInput, setLinkInput] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [theme, setTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('purple');
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    achievements: true,
    social: true,
    marketing: false
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();
      setUser(currentUser);
      setLinkedAccounts(currentUser.linked_accounts || {});
      setTheme(currentUser.theme || 'light');
      setAccentColor(currentUser.accent_color || 'purple');
      setNotifications(currentUser.notification_settings || {
        dailyReminders: true,
        achievements: true,
        social: true,
        marketing: false
      });
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    db.auth.logout(createPageUrl('Landing'));
  };

  const handleLinkAccount = async () => {
    if (!linkInput.trim()) {
      toast.error('Por favor ingresa tu usuario');
      return;
    }

    const newLinkedAccounts = {
      ...linkedAccounts,
      [linkDialog.social.id]: linkInput.trim()
    };

    await db.auth.updateMe({ linked_accounts: newLinkedAccounts });
    setLinkedAccounts(newLinkedAccounts);
    setLinkDialog({ open: false, social: null });
    setLinkInput('');
    toast.success(t('settings.accountLinked'));
  };

  const handleUnlinkAccount = async (socialId) => {
    const newLinkedAccounts = { ...linkedAccounts };
    delete newLinkedAccounts[socialId];

    await db.auth.updateMe({ linked_accounts: newLinkedAccounts });
    setLinkedAccounts(newLinkedAccounts);
    toast.success(t('settings.accountUnlinked'));
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    await db.auth.updateMe({ theme: newTheme });

    // Apply theme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast.success(`${t(`settings.${newTheme}`)} ${t('settings.themeActivated')}`);
  };

  const handleAccentColorChange = async (newColor) => {
    setAccentColor(newColor);
    await db.auth.updateMe({ accent_color: newColor });
    toast.success(t('settings.updateAccent'));
  };

  const handleNotificationChange = async (key, value) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    await db.auth.updateMe({ notification_settings: newNotifications });
  };

  const handleShareProgress = async (platform) => {
    const shareText = `🎯 ¡Llevo ${user?.level || 1} niveles en Habalyze! Mis hábitos van mejorando cada día. ¿Te unes? #Habalyze #Habits`;
    
    if (platform === 'telegram' && linkedAccounts.telegram) {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(shareText);
      toast.success('Texto copiado para compartir en Instagram');
    } else if (platform === 'discord' && linkedAccounts.discord) {
      navigator.clipboard.writeText(shareText);
      toast.success('Texto copiado para compartir en Discord');
    }
  };

  const isPremiumActive = user?.is_premium && user?.premium_until && new Date(user.premium_until) > new Date();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen p-4 md:p-8 pb-24 transition-colors",
      theme === 'dark' 
        ? "bg-gray-900" 
        : "bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50"
    )}>
      <div className="max-w-2xl md:max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className={theme === 'dark' ? "text-white" : ""}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>

        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 mt-4">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", `bg-${accentColor}-500`)}>
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-gray-800")}>{t('settings.title')}</h1>
            <p className={theme === 'dark' ? "text-gray-400" : "text-gray-500"}>{t('settings.manageAccount')}</p>
          </div>
        </div>

        {/* User Info Card */}
        <Card className={cn("p-6 mb-6 border-2", theme === 'dark' ? "bg-gray-800 border-gray-700" : "border-purple-100")}>
          <div className="flex items-center gap-4">
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold", `bg-gradient-to-br from-${accentColor}-400 to-${accentColor}-600`)}>
              {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
            </div>
            <div className="flex-1">
              <h2 className={cn("font-bold text-lg", theme === 'dark' ? "text-white" : "text-gray-800")}>{user.full_name || t('settings.user', 'Usuario')}</h2>
              <p className={theme === 'dark' ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn(`bg-${accentColor}-100 text-${accentColor}-700`)}>{t('common.level')} {user.level || 1}</Badge>
                {isPremiumActive && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <Crown className="w-3 h-3 mr-1" /> Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Language Selector */}
        <div className="mb-6">
          <h2 className={cn("text-lg font-bold mb-4 flex items-center gap-2", theme === 'dark' ? "text-white" : "text-gray-800")}>
            <Globe className={`w-5 h-5 text-${accentColor}-600`} />
            {t('settings.language')}
          </h2>

          <Card className={cn("p-4 border-2", theme === 'dark' ? "bg-gray-800 border-gray-700" : "border-gray-200")}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={cn("font-semibold", theme === 'dark' ? "text-white" : "text-gray-800")}>{t('settings.language')} / Language</h3>
                <p className={cn("text-sm", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{t('settings.selectLanguage')}</p>
              </div>
              <LanguageSelector />
            </div>
          </Card>
        </div>

        {/* Theme & Appearance */}
        <div className="mb-6">
          <h2 className={cn("text-lg font-bold mb-4 flex items-center gap-2", theme === 'dark' ? "text-white" : "text-gray-800")}>
            <Palette className={`w-5 h-5 text-${accentColor}-600`} />
            {t('settings.appearance')}
          </h2>
          
          <Card className={cn("p-4 mb-3 border-2", theme === 'dark' ? "bg-gray-800 border-gray-700" : "border-gray-200")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <h3 className={cn("font-semibold", theme === 'dark' ? "text-white" : "text-gray-800")}>{t('settings.darkMode')}</h3>
                  <p className={cn("text-sm", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{t('settings.reduceBrightness')}</p>
                </div>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={(checked) => handleThemeChange(checked ? 'dark' : 'light')}
              />
            </div>
          </Card>

          <Card className={cn("p-4 border-2", theme === 'dark' ? "bg-gray-800 border-gray-700" : "border-gray-200")}>
            <h3 className={cn("font-semibold mb-3", theme === 'dark' ? "text-white" : "text-gray-800")}>{t('settings.accentColor')}</h3>
            <div className="flex gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleAccentColorChange(color.id)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-all",
                    color.color,
                    accentColor === color.id ? "ring-4 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"
                  )}
                  title={color.name}
                >
                  {accentColor === color.id && <Check className="w-5 h-5 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h2 className={cn("text-lg font-bold mb-4 flex items-center gap-2", theme === 'dark' ? "text-white" : "text-gray-800")}>
            <Bell className={`w-5 h-5 text-${accentColor}-600`} />
            Notificaciones
          </h2>
          
          <Card className={cn("divide-y", theme === 'dark' ? "bg-gray-800 border-gray-700 divide-gray-700" : "border-gray-200 divide-gray-100")}>
            {[
              { key: 'dailyReminders', label: 'Recordatorios diarios', desc: 'Te recordamos completar tus hábitos' },
              { key: 'achievements', label: 'Logros y recompensas', desc: 'Cuando desbloqueas algo nuevo' },
              { key: 'social', label: 'Actividad social', desc: 'Amigos, duelos y gremios' },
              { key: 'marketing', label: 'Novedades y ofertas', desc: 'Nuevas funciones y promociones' },
            ].map((item) => (
              <div key={item.key} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className={cn("font-medium", theme === 'dark' ? "text-white" : "text-gray-800")}>{item.label}</h3>
                  <p className={cn("text-sm", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{item.desc}</p>
                </div>
                <Switch 
                  checked={notifications[item.key]} 
                  onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                />
              </div>
            ))}
          </Card>
        </div>

        {/* WhatsApp Coach Integration */}
        <div className="mb-6">
          <WhatsAppIntegration user={user} />
        </div>

        {/* Telegram Integration */}
        <div className="mb-6">
          <TelegramIntegration 
            user={user} 
            onUpdate={async () => {
              const updatedUser = await db.auth.me();
              setUser(updatedUser);
            }} 
          />
        </div>

        {/* Conexiones / Integraciones */}
        <div className="mb-6">
          <h2 className={cn("text-lg font-bold mb-4 flex items-center gap-2", theme === 'dark' ? "text-white" : "text-gray-800")}>
            <Link2 className={`w-5 h-5 text-${accentColor}-600`} />
            Conexiones
          </h2>
          <UnveilIntegration
            user={user}
            onUpdate={async () => {
              const updatedUser = await db.auth.me();
              setUser(updatedUser);
            }}
          />
        </div>

        {/* Social Links Section */}
        <div className="mb-6">
          <h2 className={cn("text-lg font-bold mb-4 flex items-center gap-2", theme === 'dark' ? "text-white" : "text-gray-800")}>
            <Link2 className={`w-5 h-5 text-${accentColor}-600`} />
            Cuentas Vinculadas
          </h2>
          <div className="space-y-3">
            {socialLinks.map((social) => {
              const isLinked = linkedAccounts[social.id];
              const Icon = social.icon;
              
              return (
                <motion.div
                  key={social.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={cn(
                    "p-4 border-2 transition-all",
                    isLinked 
                      ? "border-green-200 bg-green-50/50" 
                      : theme === 'dark' ? "bg-gray-800 border-gray-700" : "border-gray-200"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", social.color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={cn("font-semibold", theme === 'dark' && !isLinked ? "text-white" : "text-gray-800")}>{social.name}</h3>
                          {isLinked ? (
                            <p className="text-sm text-green-600">{linkedAccounts[social.id]}</p>
                          ) : (
                            <p className={cn("text-sm", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{social.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isLinked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShareProgress(social.id)}
                            className="text-purple-600"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        )}
                        {isLinked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnlinkAccount(social.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Unlink className="w-4 h-4 mr-1" />
                            {t('settings.unlink')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setLinkDialog({ open: true, social });
                              setLinkInput('');
                            }}
                            className={cn("text-white", social.color)}
                          >
                            <Link2 className="w-4 h-4 mr-1" />
                            {t('settings.linkAccount')}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Features when linked */}
                    {isLinked && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs text-gray-500 mb-2">Funciones disponibles:</p>
                        <div className="flex flex-wrap gap-2">
                          {social.features.map((feature, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <Check className="w-3 h-3 mr-1" /> {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Admin Panel Access */}
        {user?.role === 'admin' && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h3 className="font-bold">{t('settings.adminPanel')}</h3>
                  <p className="text-sm text-red-100">{t('settings.manageUsers')}</p>
                </div>
              </div>
              <Button
                onClick={() => navigate(createPageUrl('AdminPanel'))}
                className="bg-white text-red-600 hover:bg-red-50"
              >
                {t('settings.goToPanel')}
              </Button>
            </div>
          </Card>
        )}

        {/* Premium Section */}
        {!isPremiumActive && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8" />
                <div>
                  <h3 className="font-bold">{t('settings.getPremium')}</h3>
                  <p className="text-sm text-purple-100">{t('settings.unlockFeatures')}</p>
                </div>
              </div>
              <Button
                onClick={() => navigate(createPageUrl('Premium'))}
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                {t('settings.viewPlans')}
              </Button>
            </div>
          </Card>
        )}

        {/* Danger Zone */}
        <div className="space-y-3">
          {/* Logout */}
          <Card className={cn("p-4 border-2", theme === 'dark' ? "bg-gray-800 border-gray-700" : "border-gray-200")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", theme === 'dark' ? "bg-gray-700" : "bg-gray-100")}>
                  <LogOut className={cn("w-5 h-5", theme === 'dark' ? "text-gray-300" : "text-gray-600")} />
                </div>
                <div>
                  <h3 className={cn("font-semibold", theme === 'dark' ? "text-white" : "text-gray-800")}>{t('settings.logout')}</h3>
                  <p className={cn("text-sm", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{t('settings.logoutAccount')}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                    {t('settings.loggingOut')}
                  </>
                ) : (
                  t('settings.logout')
                )}
              </Button>
            </div>
          </Card>

          {/* Delete Account */}
          <Card className="p-4 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-700">{t('settings.deleteAccount')}</h3>
                  <p className="text-sm text-red-500">{t('settings.deleteAccountPermanent')}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialog(true)}
              >
                {t('common.delete')}
              </Button>
            </div>
          </Card>

          {/* Privacy Policy Link */}
          <Card className={cn("p-4 border-2 mt-3", theme === 'dark' ? "bg-gray-800 border-gray-700" : "border-gray-200")}>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate(createPageUrl('PrivacyPolicy'))}
            >
              <Shield className="w-5 h-5 mr-3" />
              Política de Privacidad
            </Button>
          </Card>
        </div>
      </div>

      {/* Link Account Dialog */}
      <Dialog open={linkDialog.open} onOpenChange={(open) => setLinkDialog({ ...linkDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {linkDialog.social && (
                <>
                  <linkDialog.social.icon className="w-5 h-5" />
                  Vincular {linkDialog.social?.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              Ingresa tu nombre de usuario de {linkDialog.social?.name} para vincularlo a tu cuenta.
            </p>
            <Input
              placeholder={linkDialog.social?.placeholder}
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              className="mb-4"
            />
            {linkDialog.social && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Al vincular podrás:</p>
                <ul className="space-y-1">
                  {linkDialog.social.features.map((feature, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialog({ open: false, social: null })}>
              Cancelar
            </Button>
            <Button onClick={handleLinkAccount} className={cn("text-white", linkDialog.social?.color)}>
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Eliminar Cuenta
            </DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente tu cuenta y todos tus datos. No podrás recuperarlos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Perderás todo tu progreso, incluyendo:
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Nivel {user?.level || 1} y {user?.experience || 0} XP</li>
              <li>• {user?.coins || 0} monedas y {user?.gems || 0} gemas</li>
              <li>• Todos tus hábitos y rachas</li>
              <li>• Items y logros desbloqueados</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                try {
                  // Delete user entities first
                  const habits = await db.entities.Habit.filter({ created_by: user.email });
                  const projects = await db.entities.Project.filter({ created_by: user.email });
                  const goals = await db.entities.Goal.filter({ created_by: user.email });
                  
                  // Delete all user data
                  for (const habit of habits) {
                    await db.entities.Habit.delete(habit.id);
                  }
                  for (const project of projects) {
                    const tasks = await db.entities.ProjectTask.filter({ project_id: project.id });
                    for (const task of tasks) {
                      await db.entities.ProjectTask.delete(task.id);
                    }
                    await db.entities.Project.delete(project.id);
                  }
                  for (const goal of goals) {
                    await db.entities.Goal.delete(goal.id);
                  }
                  
                  // Clear all logs and user-specific data
                  const logs = await db.entities.HabitLog.filter({ created_by: user.email });
                  for (const log of logs) {
                    await db.entities.HabitLog.delete(log.id);
                  }
                  
                  const prefs = await db.entities.UserPreferences.filter({ user_email: user.email });
                  for (const pref of prefs) {
                    await db.entities.UserPreferences.delete(pref.id);
                  }
                  
                  toast.success('Cuenta eliminada. Cerrando sesión...');
                  setDeleteDialog(false);
                  setTimeout(() => {
                    db.auth.logout(createPageUrl('Landing'));
                  }, 2000);
                } catch (error) {
                  toast.error('Error al eliminar la cuenta. Contacta a soporte.');
                }
              }}
            >
              Entiendo, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}