import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import PixelAvatar from '../avatar/PixelAvatar';

export default function FriendRequests({ requests, onAccept, onReject }) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No tienes solicitudes pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request, index) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-white rounded-full border-2 border-purple-200 p-0.5">
                  <PixelAvatar user={{ email: request.from_user_email, full_name: request.from_user_name }} size="small" showLevel={false} showCoins={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{request.from_user_name}</h3>
                  {request.from_username && (
                    <p className="text-xs text-purple-600">@{request.from_username}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(request.created_date), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onAccept(request)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(request)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}