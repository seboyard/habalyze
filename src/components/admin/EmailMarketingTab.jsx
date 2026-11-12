import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, Send, Clock, BarChart3, Sparkles, Users, 
  Zap, CheckCircle2, AlertCircle, Loader2, Play,
  Eye, ChevronRight
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function EmailMarketingTab({ allUsers = [] }) {
  const [bulkDialog, setBulkDialog] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({ min_days: 3, max_days: '', campaign: 'reactivation' });
  const [sendingBulk, setSendingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [dryRunResult, setDryRunResult] = useState(null);
  const [loadingDryRun, setLoadingDryRun] = useState(false);
  const [singleEmailDialog, setSingleEmailDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailType, setEmailType] = useState('reactivation');
  const [daysInactive, setDaysInactive] = useState(3);
  const [sendingSingle, setSendingSingle] = useState(false);

  const now = new Date();

  const inactiveUsers = allUsers.filter(u => {
    if (!u.last_login_date) return false;
    return differenceInDays(now, new Date(u.last_login_date)) >= 3;
  }).sort((a, b) => {
    return differenceInDays(now, new Date(b.last_login_date)) - differenceInDays(now, new Date(a.last_login_date));
  });

  const segmentCounts = {
    early: inactiveUsers.filter(u => {
      const d = differenceInDays(now, new Date(u.last_login_date));
      return d >= 3 && d <= 3;
    }).length,
    medium: inactiveUsers.filter(u => {
      const d = differenceInDays(now, new Date(u.last_login_date));
      return d >= 4 && d <= 7;
    }).length,
    long: inactiveUsers.filter(u => {
      const d = differenceInDays(now, new Date(u.last_login_date));
      return d >= 8 && d <= 30;
    }).length,
    winback: inactiveUsers.filter(u => {
      const d = differenceInDays(now, new Date(u.last_login_date));
      return d > 30;
    }).length,
  };

  const handleDryRun = async () => {
    setLoadingDryRun(true);
    setDryRunResult(null);
    try {
      const res = await db.functions.invoke('sendBulkReactivation', {
        min_days_inactive: parseInt(bulkConfig.min_days) || 3,
        max_days_inactive: bulkConfig.max_days ? parseInt(bulkConfig.max_days) : null,
        dry_run: true
      });
      setDryRunResult(res.data);
    } catch (e) {
      toast.error('Error: ' + e.message);
    }
    setLoadingDryRun(false);
  };

  const handleSendBulk = async () => {
    setSendingBulk(true);
    setBulkResult(null);
    try {
      const res = await db.functions.invoke('sendBulkReactivation', {
        min_days_inactive: parseInt(bulkConfig.min_days) || 3,
        max_days_inactive: bulkConfig.max_days ? parseInt(bulkConfig.max_days) : null,
        dry_run: false
      });
      setBulkResult(res.data);
      toast.success(`✅ Campaña enviada: ${res.data.sent} emails enviados`);
    } catch (e) {
      toast.error('Error al enviar campaña: ' + e.message);
    }
    setSendingBulk(false);
  };

  const handleSendSingle = async () => {
    setSendingSingle(true);
    try {
      let fn = 'sendReactivationEmail';
      let payload = { user_email: selectedUser.email, days_inactive: daysInactive };
      if (emailType === 'weekly_digest') {
        fn = 'sendWeeklyDigest';
        payload = { user_email: selectedUser.email };
      } else if (emailType === 'motivational') {
        fn = 'sendMotivationalBoost';
        payload = { user_email: selectedUser.email, boost_type: 'general' };
      }
      await db.functions.invoke(fn, payload);
      toast.success(`Email enviado a ${selectedUser.full_name}`);
      setSingleEmailDialog(false);
    } catch (e) {
      toast.error('Error: ' + e.message);
    }
    setSendingSingle(false);
  };

  const campaigns = [
    {
      id: 'early',
      title: 'Reactivación Temprana',
      subtitle: '3 días sin login',
      description: 'Email cálido recordando que sus hábitos los esperan. Incluye stats personales y mensaje del Coach IA.',
      icon: '🔥',
      color: 'from-orange-500 to-amber-500',
      count: segmentCounts.early,
      days: '3 días',
    },
    {
      id: 'medium',
      title: 'Re-enganche Medio',
      subtitle: '4-7 días sin login',
      description: 'Destaca la mejor racha del usuario y ofrece estrategia del Coach IA para volver paso a paso.',
      icon: '💪',
      color: 'from-purple-500 to-violet-500',
      count: segmentCounts.medium,
      days: '4-7 días',
    },
    {
      id: 'long',
      title: 'Recuperación Larga',
      subtitle: '8-30 días sin login',
      description: 'Muestra todo lo logrado, ofrece regalo de bienvenida de regreso (50 monedas + caja sorpresa).',
      icon: '🌟',
      color: 'from-pink-500 to-rose-500',
      count: segmentCounts.long,
      days: '8-30 días',
    },
    {
      id: 'winback',
      title: 'Winback 30+ Días',
      subtitle: '+30 días sin login',
      description: 'Campaña de recuperación total con pack especial: 100 monedas + caja épica + plantillas premium.',
      icon: '🎁',
      color: 'from-red-500 to-pink-500',
      count: segmentCounts.winback,
      days: '+30 días',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Usuarios Inactivos', value: inactiveUsers.length, color: 'from-red-500 to-rose-500', icon: Users },
          { label: '3 días sin login', value: segmentCounts.early, color: 'from-orange-500 to-amber-500', icon: Clock },
          { label: '4-30 días', value: segmentCounts.medium + segmentCounts.long, color: 'from-purple-500 to-violet-500', icon: Clock },
          { label: '+30 días', value: segmentCounts.winback, color: 'from-red-600 to-rose-600', icon: Zap },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${s.color} flex items-center justify-center mb-2`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Send All Inactive Button */}
      <Card className="p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 backdrop-blur">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Campaña Masiva de Reactivación
            </h3>
            <p className="text-gray-300 text-sm mt-1">
              Envía emails personalizados a <strong className="text-white">{inactiveUsers.length} usuarios inactivos</strong>. 
              Cada email se adapta automáticamente según los días de inactividad.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button
              onClick={() => { setBulkDialog(true); setDryRunResult(null); setBulkResult(null); }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg"
            >
              <Send className="w-4 h-4 mr-2" />
              Lanzar Campaña
            </Button>
          </div>
        </div>
      </Card>

      {/* Campaign types */}
      <div className="grid md:grid-cols-2 gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="p-5 bg-white/10 backdrop-blur border-white/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${campaign.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {campaign.icon}
                </div>
                <div>
                  <h4 className="text-white font-bold">{campaign.title}</h4>
                  <p className="text-gray-400 text-xs">{campaign.subtitle}</p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-0">
                {campaign.count} usuarios
              </Badge>
            </div>
            <p className="text-gray-300 text-sm mb-4">{campaign.description}</p>
            <Button
              size="sm"
              className={`bg-gradient-to-r ${campaign.color} text-white border-0`}
              disabled={campaign.count === 0}
              onClick={() => {
                setBulkConfig({
                  min_days: campaign.id === 'early' ? 3 : campaign.id === 'medium' ? 4 : campaign.id === 'long' ? 8 : 31,
                  max_days: campaign.id === 'early' ? 3 : campaign.id === 'medium' ? 7 : campaign.id === 'long' ? 30 : '',
                  campaign: campaign.id
                });
                setBulkDialog(true);
                setDryRunResult(null);
                setBulkResult(null);
              }}
            >
              <Play className="w-3 h-3 mr-2" />
              Enviar a este segmento
            </Button>
          </Card>
        ))}
      </div>

      {/* Inactive users list */}
      <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Usuarios Inactivos ({inactiveUsers.length})</h3>
        </div>
        {inactiveUsers.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-400">¡Todos los usuarios están activos!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {inactiveUsers.map(user => {
              const days = differenceInDays(now, new Date(user.last_login_date));
              const color = days > 30 ? 'bg-red-500' : days > 7 ? 'bg-orange-500' : 'bg-yellow-500';
              return (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{user.full_name}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${color} text-white text-xs`}>{days}d inactivo</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-7 px-2"
                      onClick={() => {
                        setSelectedUser(user);
                        setDaysInactive(days);
                        setEmailType('reactivation');
                        setSingleEmailDialog(true);
                      }}
                    >
                      <Mail className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs">Email</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Bulk Campaign Dialog */}
      <Dialog open={bulkDialog} onOpenChange={setBulkDialog}>
        <DialogContent className="bg-gray-900 border-white/20 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" />
              Configurar Campaña Masiva
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Mín. días inactivo</label>
                <Input
                  type="number"
                  value={bulkConfig.min_days}
                  onChange={(e) => setBulkConfig({ ...bulkConfig, min_days: e.target.value })}
                  className="bg-white/10 border-white/20"
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Máx. días (vacío = sin límite)</label>
                <Input
                  type="number"
                  value={bulkConfig.max_days}
                  onChange={(e) => setBulkConfig({ ...bulkConfig, max_days: e.target.value })}
                  className="bg-white/10 border-white/20"
                  placeholder="Sin límite"
                />
              </div>
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-300">
              💡 Los emails se personalizan automáticamente: 3d = early, 4-7d = medium, 8-30d = long, 30d+ = winback con pack especial.
            </div>

            {dryRunResult && (
              <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                <p className="text-blue-300 font-bold mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Vista previa: {dryRunResult.would_send_to} usuarios recibirían el email
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {dryRunResult.users?.slice(0, 8).map((u, i) => (
                    <p key={i} className="text-xs text-blue-200">
                      {u.name} — {u.days_inactive} días ({u.email})
                    </p>
                  ))}
                  {dryRunResult.users?.length > 8 && (
                    <p className="text-xs text-blue-400">... y {dryRunResult.users.length - 8} más</p>
                  )}
                </div>
              </div>
            )}

            {bulkResult && (
              <div className={`p-4 rounded-lg border ${bulkResult.sent > 0 ? 'bg-green-500/10 border-green-400/20' : 'bg-red-500/10 border-red-400/20'}`}>
                <p className={`font-bold flex items-center gap-2 ${bulkResult.sent > 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {bulkResult.sent > 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  Resultado: {bulkResult.sent} enviados, {bulkResult.failed} fallidos
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setBulkDialog(false)} className="border-white/20 text-white">
              Cancelar
            </Button>
            <Button
              onClick={handleDryRun}
              disabled={loadingDryRun}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loadingDryRun ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
              Vista previa
            </Button>
            <Button
              onClick={handleSendBulk}
              disabled={sendingBulk}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {sendingBulk ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {sendingBulk ? 'Enviando...' : 'Enviar Campaña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Email Dialog */}
      <Dialog open={singleEmailDialog} onOpenChange={setSingleEmailDialog}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Enviar Email a {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Tipo</label>
              <Select value={emailType} onValueChange={setEmailType}>
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reactivation">🔄 Reactivación</SelectItem>
                  <SelectItem value="weekly_digest">📊 Resumen Semanal</SelectItem>
                  <SelectItem value="motivational">💪 Motivacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {emailType === 'reactivation' && (
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Días inactivo</label>
                <Input
                  type="number"
                  value={daysInactive}
                  onChange={(e) => setDaysInactive(parseInt(e.target.value) || 3)}
                  className="bg-white/10 border-white/20"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSingleEmailDialog(false)} className="border-white/20 text-white">
              Cancelar
            </Button>
            <Button onClick={handleSendSingle} disabled={sendingSingle} className="bg-blue-600 hover:bg-blue-700">
              {sendingSingle ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}