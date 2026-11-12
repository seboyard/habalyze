import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Users, Crown, X, Check, Clock, Mail, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProjectCollaborators({ project, collaborators, currentUser, isOwner, onRefresh }) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ['friends-for-collab', currentUser?.email],
    queryFn: async () => {
      const friendships = await db.entities.Friendship.list();
      const myFriendships = friendships.filter(f => 
        f.user1_email === currentUser?.email || f.user2_email === currentUser?.email
      );
      
      const friendEmails = myFriendships.map(f => 
        f.user1_email === currentUser?.email ? f.user2_email : f.user1_email
      );
      
      const users = await db.entities.User.list();
      return users.filter(u => friendEmails.includes(u.email));
    },
    enabled: !!currentUser && showInviteDialog,
  });

  const inviteMutation = useMutation({
    mutationFn: async (friend) => {
      // Check if already invited
      const existing = collaborators.find(c => c.user_email === friend.email);
      if (existing) {
        throw new Error('Este usuario ya está invitado');
      }

      await db.entities.ProjectCollaborator.create({
        project_id: project.id,
        user_email: friend.email,
        user_name: friend.full_name,
        role: 'collaborator',
        status: 'pending',
        invited_by: currentUser.email
      });

      // Send notification
      await db.entities.Notification.create({
        user_email: friend.email,
        type: 'project_invite',
        title: 'Invitación a proyecto',
        message: `${currentUser.full_name} te invitó a colaborar en "${project.name}"`,
        icon: '📁',
        link: createPageUrl('Projects')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-collaborators']);
      toast.success('Invitación enviada');
      onRefresh?.();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaborator) => {
      await db.entities.ProjectCollaborator.delete(collaborator.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-collaborators']);
      toast.success('Colaborador eliminado');
      onRefresh?.();
    }
  });

  const filteredFriends = friends.filter(f => 
    f.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !collaborators.some(c => c.user_email === f.email)
  );

  const pendingCollabs = collaborators.filter(c => c.status === 'pending');
  const acceptedCollabs = collaborators.filter(c => c.status === 'accepted');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-800">Colaboradores ({acceptedCollabs.length})</h3>
        </div>
        {isOwner && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md">
                <UserPlus className="w-4 h-4 mr-2" />
                Invitar Amigo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar colaborador</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar amigos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredFriends.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      {searchQuery ? 'No se encontraron amigos' : 'No tienes amigos para invitar'}
                    </p>
                  ) : (
                    filteredFriends.map(friend => (
                      <Card key={friend.email} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                            {friend.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{friend.full_name}</p>
                            <p className="text-xs text-gray-500">Nivel {friend.level || 1}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => inviteMutation.mutate(friend)}
                          disabled={inviteMutation.isPending}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Invitar
                        </Button>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Owner */}
      <Card className="p-3 bg-purple-50 border-purple-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-800">
                {project.created_by === currentUser?.email ? 'Tú' : (project.created_by_name || 'Propietario')}
              </p>
              <Badge className="bg-purple-100 text-purple-700 text-xs">Owner</Badge>
            </div>
            <p className="text-xs text-gray-500">{project.created_by}</p>
          </div>
        </div>
      </Card>

      {/* Pending invitations */}
      {pendingCollabs.length > 0 && (
        <div>
          <p className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Pendientes ({pendingCollabs.length})
          </p>
          <div className="space-y-2">
            {pendingCollabs.map(collab => (
              <Card key={collab.id} className="p-3 bg-amber-50 border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
                      {collab.user_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{collab.user_name}</p>
                      <p className="text-xs text-amber-600">Esperando respuesta</p>
                    </div>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCollaboratorMutation.mutate(collab)}
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Accepted collaborators */}
      {acceptedCollabs.length > 0 && (
        <div className="space-y-2">
          {acceptedCollabs.map(collab => (
            <Card key={collab.id} className="p-3">
              <div className="flex items-center justify-between">
                <Link to={`${createPageUrl('Profile')}?user=${collab.user_email}`}>
                  <div className="flex items-center gap-3 hover:opacity-80">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                      {collab.user_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{collab.user_name}</p>
                      <p className="text-xs text-gray-500">
                        Unido {collab.joined_date && format(new Date(collab.joined_date), "d MMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                </Link>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCollaboratorMutation.mutate(collab)}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {acceptedCollabs.length === 0 && pendingCollabs.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-4">
          No hay colaboradores aún
        </p>
      )}
    </div>
  );
}