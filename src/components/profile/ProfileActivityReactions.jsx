import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Heart, ThumbsUp, Flame, Star, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const reactionTypes = [
  { type: 'like', icon: ThumbsUp, color: 'text-blue-500', label: '👍' },
  { type: 'love', icon: Heart, color: 'text-red-500', label: '❤️' },
  { type: 'fire', icon: Flame, color: 'text-orange-500', label: '🔥' },
  { type: 'star', icon: Star, color: 'text-yellow-500', label: '⭐' },
  { type: 'celebrate', icon: Sparkles, color: 'text-purple-500', label: '🎉' },
  { type: 'trophy', icon: Trophy, color: 'text-amber-500', label: '🏆' },
];

export default function ProfileActivityReactions({ activityId, currentUser }) {
  const [showPicker, setShowPicker] = useState(false);
  const queryClient = useQueryClient();

  const { data: reactions = [] } = useQuery({
    queryKey: ['activity-reactions', activityId],
    queryFn: () => db.entities.ActivityReaction.filter({ activity_id: activityId }),
    staleTime: 30000,
  });

  const addReactionMutation = useMutation({
    mutationFn: async (reactionType) => {
      const existing = reactions.find(r => r.user_email === currentUser.email);
      
      if (existing) {
        if (existing.reaction_type === reactionType) {
          await db.entities.ActivityReaction.delete(existing.id);
        } else {
          await db.entities.ActivityReaction.update(existing.id, { reaction_type: reactionType });
        }
      } else {
        await db.entities.ActivityReaction.create({
          activity_id: activityId,
          user_email: currentUser.email,
          user_name: currentUser.full_name,
          reaction_type: reactionType
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activity-reactions', activityId]);
      setShowPicker(false);
    },
  });

  const myReaction = reactions.find(r => r.user_email === currentUser?.email);
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-2 mt-3 relative">
      {/* Quick reaction button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          if (myReaction) {
            addReactionMutation.mutate(myReaction.reaction_type);
          } else {
            setShowPicker(!showPicker);
          }
        }}
        className="h-7 px-2 text-xs"
      >
        {myReaction ? (
          <>
            <span className="mr-1">
              {reactionTypes.find(r => r.type === myReaction.reaction_type)?.label}
            </span>
            Quitar
          </>
        ) : (
          <>
            <Heart className="w-3 h-3 mr-1" />
            Reaccionar
          </>
        )}
      </Button>

      {/* Reaction counts */}
      {Object.entries(reactionCounts).map(([type, count]) => {
        const reaction = reactionTypes.find(r => r.type === type);
        return (
          <button
            key={type}
            onClick={() => addReactionMutation.mutate(type)}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border hover:bg-gray-50 transition-all text-xs"
          >
            <span>{reaction?.label}</span>
            <span className="font-semibold text-gray-700">{count}</span>
          </button>
        );
      })}

      {/* Reaction picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-2 flex gap-1 z-10"
          >
            {reactionTypes.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => addReactionMutation.mutate(reaction.type)}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center text-xl"
              >
                {reaction.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}