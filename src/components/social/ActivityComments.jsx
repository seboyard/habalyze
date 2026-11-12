import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ActivityComments({ activityId, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['activity-comments', activityId],
    queryFn: () => db.entities.ActivityComment.filter({ activity_id: activityId }, '-created_date'),
    enabled: showComments,
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      await db.entities.ActivityComment.create({
        activity_id: activityId,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        comment: newComment
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activity-comments']);
      setNewComment('');
      toast.success('Comentario añadido');
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (comment) => {
      await db.entities.ActivityComment.update(comment.id, {
        likes: (comment.likes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activity-comments']);
    }
  });

  return (
    <div className="mt-3 space-y-2">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}</span>
      </button>

      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 pt-2 border-t border-gray-200"
        >
          {/* Comment input */}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="min-h-[60px] text-sm"
            />
            <Button
              size="sm"
              onClick={() => addCommentMutation.mutate()}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">{comment.user_name}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                  <button
                    onClick={() => likeCommentMutation.mutate(comment)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    {comment.likes > 0 && <span>{comment.likes}</span>}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}