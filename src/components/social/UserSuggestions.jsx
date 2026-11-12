import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Target, Sparkles } from 'lucide-react';
import PixelAvatar from '../avatar/PixelAvatar';

export default function UserSuggestions({ 
  allUsers, 
  currentUser, 
  friendEmails, 
  pendingRequests,
  allHabits,
  friendships,
  onSendRequest 
}) {
  if (!currentUser) return null;

  const pendingEmails = pendingRequests.map(r => r.to_user_email);
  
  // Get current user's habits
  const myHabits = allHabits.filter(h => h.created_by === currentUser.email);
  const myHabitIcons = myHabits.map(h => h.icon);

  // Calculate suggestions
  const suggestions = allUsers
    .filter(u => u && u.email)
    .filter(u => 
      u.email !== currentUser.email && 
      !friendEmails.includes(u.email) &&
      !pendingEmails.includes(u.email)
    )
    .map(user => {
      // Check for similar habits
      const userHabits = allHabits.filter(h => h.created_by === user.email);
      const userHabitIcons = userHabits.map(h => h.icon);
      const commonHabits = myHabitIcons.filter(icon => userHabitIcons.includes(icon));
      
      // Check for mutual friends
      const userFriends = friendships
        .filter(f => f.user1_email === user.email || f.user2_email === user.email)
        .map(f => f.user1_email === user.email ? f.user2_email : f.user1_email);
      const mutualFriends = friendEmails.filter(email => userFriends.includes(email));
      
      // Calculate score
      const score = commonHabits.length * 2 + mutualFriends.length * 3;
      
      return {
        user,
        commonHabits: commonHabits.length,
        mutualFriends: mutualFriends.length,
        score
      };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-2xl border-2 border-dashed border-gray-200">
        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay sugerencias por ahora</p>
        <p className="text-sm text-gray-400 mt-1">Busca usuarios manualmente arriba</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        Personas que podrías conocer
      </h3>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-lg transition-all border-2 border-amber-100 hover:border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center gap-3 mb-3">
                {suggestion.user.profile_picture ? (
                  <img src={suggestion.user.profile_picture} alt={suggestion.user.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-300" />
                ) : (
                  <PixelAvatar user={suggestion.user} size="small" showLevel={false} />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 truncate">{suggestion.user.full_name}</h4>
                  {suggestion.user.username && (
                    <p className="text-xs text-purple-600">@{suggestion.user.username}</p>
                  )}
                  <p className="text-xs text-gray-500">Nivel {suggestion.user.level || 1}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {suggestion.mutualFriends > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-white">
                    <Users className="w-3 h-3 mr-1" />
                    {suggestion.mutualFriends} amigo{suggestion.mutualFriends > 1 ? 's' : ''} en común
                  </Badge>
                )}
                {suggestion.commonHabits > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-white">
                    <Target className="w-3 h-3 mr-1" />
                    {suggestion.commonHabits} hábito{suggestion.commonHabits > 1 ? 's' : ''} similar{suggestion.commonHabits > 1 ? 'es' : ''}
                  </Badge>
                )}
              </div>

              <Button
                onClick={() => onSendRequest(suggestion.user)}
                size="sm"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}