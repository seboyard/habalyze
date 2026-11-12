import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function InviteToChallenge({ challenge, currentUser, open, onOpenChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', currentUser?.email],
    queryFn: () => db.entities.Friendship.list(),
    enabled: !!currentUser && open,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users-invite'],
    queryFn: async () => {
      const response = await db.functions.invoke('listAllUsers');
      return response.data.users || [];
    },
    enabled: open,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['challenge-participants', challenge?.id],
    queryFn: () => db.entities.ChallengeParticipant.filter({ challenge_id: challenge.id }),
    enabled: !!challenge && open,
  });

  const inviteMutation = useMutation({
    mutationFn: async (friend) => {
      // Create notification for the friend
      await db.entities.Notification.create({
        user_email: friend.email,
        type: 'challenge_invite',
        title: '¡Invitación a desafío!',
        message: `${currentUser.full_name} te invitó al desafío: ${challenge.title}`,
        icon: challenge.icon || '🏆',
        link: createPageUrl('Challenges')
      });

      // Create friend activity
      await db.entities.FriendActivity.create({
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        activity_type: 'challenge_invite',
        title: `Invitó a ${friend.full_name} a un desafío`,
        description: `"${challenge.title}" - ${challenge.description || 'Únete y compite'}`,
        icon: challenge.icon || '🏆',
        metadata: {
          challenge_id: challenge.id,
          invited_user: friend.email,
          invited_user_name: friend.full_name
        }
      });
    },
    onSuccess: (_, friend) => {
      toast.success(`Invitación enviada a ${friend.full_name}`);
    }
  });

  const friendEmails = friendships
    .filter(f => f.user1_email === currentUser?.email || f.user2_email === currentUser?.email)
    .map(f => f.user1_email === currentUser?.email ? f.user2_email : f.user1_email);

  const friends = allUsers.filter(u => friendEmails.includes(u.email));
  const participantEmails = participants.map(p => p.user_email);
  
  const availableFriends = friends.filter(f => 
    !participantEmails.includes(f.email) &&
    f.email !== currentUser?.email &&
    (f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     f.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            Invitar Amigos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar amigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableFriends.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">
                {friends.length === 0 
                  ? 'No tienes amigos para invitar' 
                  : 'Todos tus amigos ya están en este desafío'}
              </p>
            ) : (
              availableFriends.map((friend) => (
                <div key={friend.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {friend.profile_picture ? (
                      <img src={friend.profile_picture} alt={friend.full_name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {friend.full_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{friend.full_name}</p>
                      {friend.username && (
                        <p className="text-xs text-purple-600">@{friend.username}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => inviteMutation.mutate(friend)}
                    disabled={inviteMutation.isPending}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    Invitar
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}