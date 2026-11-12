import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Link2, Check, Clock, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InvitationStatsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: myInvitations = [] } = useQuery({
    queryKey: ['my-invitations', user?.email],
    queryFn: () => db.entities.Invitation.filter({ referrer_email: user?.email }, '-created_date'),
    enabled: !!user,
    staleTime: 30000,
  });

  const acceptedCount = myInvitations.filter(i => i.status === 'accepted').length;
  const pendingCount = myInvitations.filter(i => i.status === 'pending').length;
  const totalRewards = acceptedCount * 100; // 100 coins per referral

  const methodIcons = {
    link: Link2,
    email: Mail,
    whatsapp: Users,
    telegram: Users
  };

  const methodColors = {
    link: 'text-blue-500',
    email: 'text-purple-500',
    whatsapp: 'text-green-500',
    telegram: 'text-cyan-500'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Mis Invitaciones
        </h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{acceptedCount}</p>
                <p className="text-sm text-green-600">Aceptadas</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
                <p className="text-sm text-amber-600">Pendientes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">{totalRewards}</p>
                <p className="text-sm text-purple-600">Monedas ganadas</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Invitations List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Historial de Invitaciones</h2>
          {myInvitations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aún no has enviado invitaciones</p>
              <p className="text-sm text-gray-400 mt-1">Comparte tu link para empezar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myInvitations.map((invitation) => {
                const MethodIcon = methodIcons[invitation.method] || Users;
                const methodColor = methodColors[invitation.method] || 'text-gray-500';
                
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center ${methodColor}`}>
                        <MethodIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800">
                          {invitation.invited_email || 'Link compartido'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(invitation.created_date), "d 'de' MMM, yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <Badge 
                      className={
                        invitation.status === 'accepted' 
                          ? 'bg-green-100 text-green-700' 
                          : invitation.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {invitation.status === 'accepted' && <Check className="w-3 h-3 mr-1" />}
                      {invitation.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {invitation.status === 'accepted' ? 'Aceptada' : 'Pendiente'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}