import { db } from '@/api/base44Client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bug, Star, ChevronRight, 
  AlertTriangle, CheckCircle2, Users, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

const SEVERITY_CONFIG = {
  crítico: { color: 'bg-red-500', text: 'Crítico' },
  alto: { color: 'bg-orange-500', text: 'Alto' },
  medio: { color: 'bg-yellow-500', text: 'Medio' },
  bajo: { color: 'bg-blue-500', text: 'Bajo' },
};

const STATUS_CONFIG = {
  abierto: { color: 'bg-red-500/20 text-red-300', label: 'Abierto' },
  en_revisión: { color: 'bg-yellow-500/20 text-yellow-300', label: 'En revisión' },
  resuelto: { color: 'bg-green-500/20 text-green-300', label: 'Resuelto' },
  no_reproducible: { color: 'bg-gray-500/20 text-gray-400', label: 'No reproducible' },
};

const TESTER_STATUS_CONFIG = {
  activo: 'bg-green-500',
  muy_activo: 'bg-emerald-400',
  inactivo: 'bg-gray-500',
  abandonó: 'bg-red-500',
};

const PLATFORM_ICONS = {
  'iOS Safari': '🍎',
  'iOS Chrome': '🍎🔵',
  'Android Chrome': '🤖',
  'Android Samsung Browser': '🤖🔵',
  'Desktop Chrome': '🖥️',
  'Desktop Firefox': '🦊',
  'Desktop Safari': '🖥️🍎',
  'Desktop Edge': '🌐',
};

function ScoreBar({ label, value }) {
  const color = value >= 8 ? 'from-green-500 to-emerald-400' : value >= 6 ? 'from-yellow-500 to-amber-400' : 'from-red-500 to-orange-400';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${(value / 10) * 100}%` }} />
      </div>
      <span className="text-xs font-bold text-white w-6">{value}</span>
    </div>
  );
}

export default function BetaTestersTab() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [bugStatusUpdate, setBugStatusUpdate] = useState({});

  const { data: testers = [], isLoading } = useQuery({
    queryKey: ['beta-testers'],
    queryFn: () => db.entities.BetaTester.list('-overall_rating', 50),
  });

  const updateTesterMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.BetaTester.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['beta-testers']),
  });

  const filtered = testers.filter(t => {
    if (filterPlatform !== 'all' && t.platform !== filterPlatform) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const totalBugs = testers.flatMap(t => t.bugs || []).length;
  const openBugs = testers.flatMap(t => t.bugs || []).filter(b => b.status === 'abierto').length;
  const criticalBugs = testers.flatMap(t => t.bugs || []).filter(b => b.severity === 'crítico').length;
  const avgRating = testers.length > 0 ? (testers.reduce((s, t) => s + (t.overall_rating || 0), 0) / testers.length).toFixed(1) : 0;
  const whatsappUsers = testers.filter(t => t.whatsapp_connected).length;

  const handleBugStatusChange = (testerId, bugIdx, newStatus) => {
    const tester = testers.find(t => t.id === testerId);
    if (!tester) return;
    const updatedBugs = [...(tester.bugs || [])];
    updatedBugs[bugIdx] = { ...updatedBugs[bugIdx], status: newStatus };
    updateTesterMutation.mutate({ id: testerId, data: { bugs: updatedBugs } });
  };

  if (isLoading) return <div className="text-center py-12 text-gray-400">Cargando beta testers...</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Testers', value: testers.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Bugs totales', value: totalBugs, icon: Bug, color: 'from-orange-500 to-red-500' },
          { label: 'Bugs abiertos', value: openBugs, icon: AlertTriangle, color: 'from-red-500 to-pink-500' },
          { label: 'Críticos', value: criticalBugs, icon: AlertTriangle, color: 'from-red-600 to-rose-600' },
          { label: 'Rating Prom.', value: `${avgRating}/10`, icon: Star, color: 'from-amber-500 to-yellow-400' },
        ].map((s, i) => (
          <Card key={i} className="p-4 bg-white/10 backdrop-blur border-white/20">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las plataformas</SelectItem>
            {['iOS Safari', 'iOS Chrome', 'Android Chrome', 'Android Samsung Browser', 'Desktop Chrome', 'Desktop Firefox', 'Desktop Safari', 'Desktop Edge'].map(p => (
              <SelectItem key={p} value={p}>{PLATFORM_ICONS[p]} {p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="muy_activo">Muy activo</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
            <SelectItem value="abandonó">Abandonó</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tester cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((tester, i) => (
          <motion.div key={tester.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card
              className="p-5 bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-all"
              onClick={() => setSelected(tester)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {tester.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{tester.name}</h3>
                      <Badge className={`${TESTER_STATUS_CONFIG[tester.status]} text-white text-xs px-2 py-0`}>
                        {tester.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">{tester.occupation} · {tester.location}</p>
                    <p className="text-xs text-gray-500">{PLATFORM_ICONS[tester.platform]} {tester.platform}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-white">{tester.overall_rating}/10</span>
                  </div>
                  <p className="text-xs text-gray-400">{tester.days_using_app} días</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 line-clamp-2 mb-3">{tester.general_feedback}</p>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {(tester.bugs || []).length > 0 && (
                    <Badge className="bg-red-500/20 text-red-300 text-xs">
                      <Bug className="w-3 h-3 mr-1" />
                      {(tester.bugs || []).length} bugs
                    </Badge>
                  )}
                  {(tester.bugs || []).filter(b => b.severity === 'crítico').length > 0 && (
                    <Badge className="bg-red-700/40 text-red-200 text-xs">
                      🚨 {(tester.bugs || []).filter(b => b.severity === 'crítico').length} crítico(s)
                    </Badge>
                  )}
                  {tester.whatsapp_connected && (
                    <Badge className="bg-green-500/20 text-green-300 text-xs">📱 WhatsApp</Badge>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center font-bold">
                    {selected.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg">{selected.name}</p>
                    <p className="text-sm text-gray-400 font-normal">{selected.occupation} · {selected.age} años · {selected.location}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview">
                <TabsList className="bg-white/10">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">General</TabsTrigger>
                  <TabsTrigger value="bugs" className="data-[state=active]:bg-white/20">
                    Bugs ({(selected.bugs || []).length})
                  </TabsTrigger>
                  <TabsTrigger value="scores" className="data-[state=active]:bg-white/20">Usabilidad</TabsTrigger>
                  <TabsTrigger value="requests" className="data-[state=active]:bg-white/20">Peticiones</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-amber-400">{selected.overall_rating}/10</p>
                      <p className="text-xs text-gray-400">Rating</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-blue-400">{selected.days_using_app}</p>
                      <p className="text-xs text-gray-400">Días de uso</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-lg font-bold text-purple-400">{selected.tech_level}</p>
                      <p className="text-xs text-gray-400">Nivel tech</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl">
                    <h4 className="font-semibold text-white mb-2">💬 Feedback General</h4>
                    <p className="text-sm text-gray-300">{selected.general_feedback}</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl">
                    <h4 className="font-semibold text-white mb-2">🎯 Objetivos en la app</h4>
                    <ul className="space-y-1">
                      {(selected.goals_in_app || []).map((g, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-violet-400">•</span> {g}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge className={`${TESTER_STATUS_CONFIG[selected.status]} text-white`}>{selected.status}</Badge>
                    <Badge className="bg-white/10 text-gray-300">{PLATFORM_ICONS[selected.platform]} {selected.platform}</Badge>
                    {selected.whatsapp_connected && <Badge className="bg-green-500/20 text-green-300">📱 WhatsApp conectado</Badge>}
                  </div>

                  {selected.notes && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-sm text-yellow-300">📝 {selected.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="bugs" className="mt-4 space-y-3">
                  {(selected.bugs || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>Sin bugs reportados</p>
                    </div>
                  ) : (
                    (selected.bugs || []).map((bug, idx) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${SEVERITY_CONFIG[bug.severity]?.color || 'bg-gray-500'}`} />
                            <h4 className="font-semibold text-white text-sm">{bug.title}</h4>
                          </div>
                          <Select
                            value={bug.status}
                            onValueChange={(v) => handleBugStatusChange(selected.id, idx, v)}
                          >
                            <SelectTrigger className={`w-36 h-7 text-xs ${STATUS_CONFIG[bug.status]?.color || 'bg-gray-500/20'} border-0`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="abierto">🔴 Abierto</SelectItem>
                              <SelectItem value="en_revisión">🟡 En revisión</SelectItem>
                              <SelectItem value="resuelto">🟢 Resuelto</SelectItem>
                              <SelectItem value="no_reproducible">⚫ No reproducible</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{bug.description}</p>
                        <div className="flex gap-2">
                          <Badge className={`${SEVERITY_CONFIG[bug.severity]?.color || 'bg-gray-500'} text-white text-xs`}>
                            {bug.severity}
                          </Badge>
                          {bug.screen && (
                            <Badge className="bg-white/10 text-gray-400 text-xs">📍 {bug.screen}</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="scores" className="mt-4">
                  {selected.usability_scores ? (
                    <div className="p-4 bg-white/5 rounded-xl space-y-3">
                      <h4 className="font-semibold text-white mb-3">Puntuaciones por área</h4>
                      {Object.entries(selected.usability_scores).map(([key, val]) => (
                        <ScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">Sin puntuaciones registradas</div>
                  )}
                </TabsContent>

                <TabsContent value="requests" className="mt-4">
                  <div className="space-y-2">
                    {(selected.feature_requests || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-400">Sin peticiones registradas</div>
                    ) : (
                      (selected.feature_requests || []).map((req, i) => (
                        <div key={i} className="p-3 bg-white/5 rounded-xl flex items-start gap-2">
                          <span className="text-violet-400 mt-0.5">💡</span>
                          <p className="text-sm text-gray-300">{req}</p>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}