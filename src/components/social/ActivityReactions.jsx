import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const reactions = [
  { type: 'like', emoji: '👍', label: 'Me gusta' },
  { type: 'love', emoji: '❤️', label: 'Me encanta' },
  { type: 'fire', emoji: '🔥', label: '¡En llamas!' },
  { type: 'clap', emoji: '👏', label: 'Aplausos' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrar' },
  { type: 'support', emoji: '💪', label: 'Apoyo' },
];

export default function ActivityReactions({ activityId, currentUser }) {
  const [showPicker, setShowPicker] = useState(false);
  const queryClient = useQueryClient();

  const { data: allReactions = [] } = useQuery({
    queryKey: ['activity-reactions', activityId],
    queryFn: () => db.entities.ActivityReaction.filter({ activity_id: activityId }),
    staleTime: 30000,
  });

  const myReaction = allReactions.find(r => r.user_email === currentUser?.email);

  const addReactionMutation = useMutation({
    mutationFn: async (reactionType) => {
      if (myReaction) {
        if (myReaction.reaction_type === reactionType) {
          await db.entities.ActivityReaction.delete(myReaction.id);
        } else {
          await db.entities.ActivityReaction.update(myReaction.id, { reaction_type: reactionType });
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
    }
  });

  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.type] = allReactions.filter(ar => ar.reaction_type === r.type).length;
    return acc;
  }, {});

  const totalReactions = allReactions.length;
  const topReactions = reactions
    .filter(r => reactionCounts[r.type] > 0)
    .sort((a, b) => reactionCounts[b.type] - reactionCounts[a.type])
    .slice(0, 3);

  return (
    <div className="flex items-center gap-2 mt-2">
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs gap-1",
              myReaction && "bg-purple-50 text-purple-600"
            )}
          >
            {myReaction ? (
              <span>{reactions.find(r => r.type === myReaction.reaction_type)?.emoji}</span>
            ) : (
              <span>👍</span>
            )}
            <span>Reaccionar</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {reactions.map((reaction) => (
              <motion.button
                key={reaction.type}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addReactionMutation.mutate(reaction.type)}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xl hover:bg-gray-100 transition-colors",
                  myReaction?.reaction_type === reaction.type && "bg-purple-100"
                )}
                title={reaction.label}
              >
                {reaction.emoji}
              </motion.button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {totalReactions > 0 && (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            {topReactions.map((reaction) => (
              <span key={reaction.type} className="text-sm">{reaction.emoji}</span>
            ))}
          </div>
          <span className="text-xs text-gray-500">{totalReactions}</span>
        </div>
      )}
    </div>
  );
}