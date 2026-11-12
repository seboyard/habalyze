import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Heart } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PixelAvatar from '../avatar/PixelAvatar';

export default function ProfileComments({ comments, currentUser, isOwnProfile, onAddComment, isSubmitting }) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      {!isOwnProfile && currentUser && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Deja un comentario
          </h4>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe algo bonito..."
            className="mb-3"
            rows={3}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Link to={`${createPageUrl('Profile')}?user=${comment.commenter_email}`}>
                  <div className="w-10 h-10">
                    <PixelAvatar user={{ email: comment.commenter_email, full_name: comment.commenter_name }} size="small" showLevel={false} />
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      to={`${createPageUrl('Profile')}?user=${comment.commenter_email}`}
                      className="font-medium text-gray-800 hover:text-purple-600"
                    >
                      {comment.commenter_name}
                    </Link>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{comment.content}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {comments.length === 0 && (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Aún no hay comentarios</p>
            {!isOwnProfile && <p className="text-sm text-gray-400">¡Sé el primero en dejar uno!</p>}
          </Card>
        )}
      </div>
    </div>
  );
}