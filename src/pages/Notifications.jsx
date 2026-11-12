import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2, Filter, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import NotificationItem from '../components/notifications/NotificationItem';

export default function NotificationsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const user = await db.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', currentUser?.email],
    queryFn: () => db.entities.Notification.filter({ user_email: currentUser?.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users-for-notifications'],
    queryFn: async () => {
      const response = await db.functions.invoke('listAllUsers');
      return response.data.users || [];
    },
    staleTime: 300000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => db.entities.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => db.entities.Notification.update(n.id, { is_read: true }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Todas las notificaciones marcadas como leídas');
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => db.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notificación eliminada');
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(notifications.map(n => db.entities.Notification.delete(n.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Todas las notificaciones eliminadas');
    },
  });

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20 relative z-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg relative">
                <Bell className="w-8 h-8 text-white" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Notificaciones
                </h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Marcar todo
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearAllMutation.mutate()}
                  disabled={clearAllMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="grid grid-cols-5 w-full bg-white p-1 shadow-md border-2 border-gray-200">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                📬 Todas
              </TabsTrigger>
              <TabsTrigger value="unread" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-400 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                🔔 Sin leer
              </TabsTrigger>
              <TabsTrigger value="achievement_unlocked" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                🏆 Logros
              </TabsTrigger>
              <TabsTrigger value="challenge_new" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                ⚔️ Desafíos
              </TabsTrigger>
              <TabsTrigger value="friend_activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                👥 Amigos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200"
          >
            <BellOff className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg font-medium mb-2">No hay notificaciones</p>
            <p className="text-gray-400 text-sm">
              {filter === 'all' ? 'Tus notificaciones aparecerán aquí' : 'No hay notificaciones en esta categoría'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification, index) => {
                // Intentar extraer el email del usuario de los metadata o del mensaje
                let relatedUserEmail = notification.metadata?.from_user_email || notification.metadata?.user_email;
                
                // Si no está en metadata, intentar parsear del mensaje
                if (!relatedUserEmail && notification.message) {
                  const emailMatch = notification.message.match(/\(([^@)]+@[^)]+)\)/);
                  if (emailMatch) relatedUserEmail = emailMatch[1];
                }
                
                const relatedUser = relatedUserEmail ? allUsers.find(u => u.email === relatedUserEmail) : null;

                return (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    index={index}
                    onClick={() => handleNotificationClick(notification)}
                    onDelete={() => deleteNotificationMutation.mutate(notification.id)}
                    onMarkAsRead={() => markAsReadMutation.mutate(notification.id)}
                    relatedUser={relatedUser}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}