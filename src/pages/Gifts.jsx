import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, Send, Inbox, Clock, Check, Coins, Package, Heart, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import confetti from 'canvas-confetti';

export default function GiftsPage() {
  const [user, setUser] = useState(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [newGift, setNewGift] = useState({
    receiver_email: '',
    gift_type: 'coins',
    coins_amount: 10,
    message: ''
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: receivedGifts = [] } = useQuery({
    queryKey: ['received-gifts', user?.email],
    queryFn: () => db.entities.Gift.filter({ receiver_email: user?.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: sentGifts = [] } = useQuery({
    queryKey: ['sent-gifts', user?.email],
    queryFn: () => db.entities.Gift.filter({ sender_email: user?.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', user?.email],
    queryFn: async () => {
      const friendships = await db.entities.Friendship.list();
      return friendships.filter(f => 
        f.user1_email === user?.email || f.user2_email === user?.email
      ).map(f => ({
        email: f.user1_email === user?.email ? f.user2_email : f.user1_email,
        name: f.user1_email === user?.email ? f.user2_name : f.user1_name
      }));
    },
    enabled: !!user,
  });

  const pendingGifts = receivedGifts.filter(g => g.status === 'pending');
  const claimedGifts = receivedGifts.filter(g => g.status === 'claimed');

  const sendGiftMutation = useMutation({
    mutationFn: async (giftData) => {
      // Deduct coins from sender
      if (giftData.gift_type === 'coins') {
        await db.auth.updateMe({
          coins: (user.coins || 0) - giftData.coins_amount
        });
      }

      await db.entities.Gift.create({
        gift_id: `gift_${Date.now()}`,
        sender_email: user.email,
        sender_name: user.full_name,
        receiver_email: giftData.receiver_email,
        receiver_name: friends.find(f => f.email === giftData.receiver_email)?.name || 'Amigo',
        gift_type: giftData.gift_type,
        coins_amount: giftData.coins_amount,
        message: giftData.message,
        status: 'pending',
        sent_date: new Date().toISOString()
      });

      // Send notification
      await db.entities.Notification.create({
        user_email: giftData.receiver_email,
        type: 'reward_claimed',
        title: '¡Tienes un regalo! 🎁',
        message: `${user.full_name} te ha enviado un regalo`,
        icon: '🎁'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sent-gifts']);
      setShowSendDialog(false);
      setNewGift({ receiver_email: '', gift_type: 'coins', coins_amount: 10, message: '' });
      toast.success('¡Regalo enviado! 🎁');
      db.auth.me().then(setUser);
    }
  });

  const claimGiftMutation = useMutation({
    mutationFn: async (gift) => {
      // Add coins to receiver
      if (gift.gift_type === 'coins') {
        await db.auth.updateMe({
          coins: (user.coins || 0) + gift.coins_amount
        });
      }

      await db.entities.Gift.update(gift.id, {
        status: 'claimed',
        claimed_date: new Date().toISOString()
      });

      return gift;
    },
    onSuccess: (gift) => {
      queryClient.invalidateQueries(['received-gifts']);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EC4899', '#8B5CF6']
      });
      
      toast.success(`¡Regalo reclamado! +${gift.coins_amount} monedas`);
      db.auth.me().then(setUser);
    }
  });

  const coinOptions = [10, 25, 50, 100, 250, 500];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-violet-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Gift className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Regalos</h1>
                <p className="text-pink-100 text-sm">Comparte con tus amigos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl px-4 py-2">
                <span className="text-2xl">💰</span>
                <span className="font-bold ml-1">{user.coins || 0}</span>
              </div>
              <Button 
                onClick={() => setShowSendDialog(true)} 
                className="bg-white text-purple-600 hover:bg-purple-50"
                disabled={friends.length === 0}
              >
                <Send className="w-4 h-4 mr-2" /> Enviar
              </Button>
            </div>
          </div>

          {/* Pending Gifts Alert */}
          {pendingGifts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white/20 rounded-xl p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-xl">🎁</span>
              </div>
              <div className="flex-1">
                <p className="font-bold">¡Tienes {pendingGifts.length} regalo{pendingGifts.length > 1 ? 's' : ''} pendiente{pendingGifts.length > 1 ? 's' : ''}!</p>
                <p className="text-sm text-pink-100">Reclámalo{pendingGifts.length > 1 ? 's' : ''} abajo</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="received" className="relative">
              <Inbox className="w-4 h-4 mr-2" />
              Recibidos
              {pendingGifts.length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 p-0 flex items-center justify-center">
                  {pendingGifts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">
              <Send className="w-4 h-4 mr-2" />
              Enviados
            </TabsTrigger>
          </TabsList>

          {/* Received Gifts */}
          <TabsContent value="received" className="space-y-6">
            {/* Pending */}
            {pendingGifts.length > 0 && (
              <div>
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Por Reclamar
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingGifts.map((gift, i) => (
                    <motion.div
                      key={gift.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="overflow-hidden border-2 border-amber-200 hover:shadow-lg transition-shadow">
                        <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-4 text-white text-center">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                            className="text-5xl mb-2"
                          >
                            🎁
                          </motion.div>
                          <p className="font-bold">De: {gift.sender_name}</p>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-center gap-2 bg-amber-50 rounded-lg p-3">
                            <Coins className="w-5 h-5 text-amber-600" />
                            <span className="text-2xl font-bold text-amber-600">{gift.coins_amount}</span>
                            <span className="text-amber-600">monedas</span>
                          </div>
                          
                          {gift.message && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-600 italic">"{gift.message}"</p>
                            </div>
                          )}
                          
                          <Button
                            onClick={() => claimGiftMutation.mutate(gift)}
                            disabled={claimGiftMutation.isPending}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Reclamar Regalo
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Claimed History */}
            <div>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Historial
              </h2>
              {claimedGifts.length === 0 ? (
                <Card className="p-8 text-center bg-white/80">
                  <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No has recibido regalos aún</p>
                  <p className="text-sm text-gray-400">¡Agrega amigos para intercambiar regalos!</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {claimedGifts.map((gift) => (
                    <Card key={gift.id} className="p-3 flex items-center gap-3 bg-green-50 border-green-200">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{gift.sender_name}</p>
                        <p className="text-xs text-gray-500">
                          {gift.claimed_date && format(new Date(gift.claimed_date), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700">
                        +{gift.coins_amount} 💰
                      </Badge>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Sent Gifts */}
          <TabsContent value="sent">
            {sentGifts.length === 0 ? (
              <Card className="p-8 text-center bg-white/80">
                <Send className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No has enviado regalos aún</p>
                <Button 
                  onClick={() => setShowSendDialog(true)} 
                  className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  Enviar mi primer regalo
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {sentGifts.map((gift) => (
                  <Card key={gift.id} className={cn(
                    "p-3 flex items-center gap-3",
                    gift.status === 'claimed' ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      gift.status === 'claimed' ? "bg-green-100" : "bg-amber-100"
                    )}>
                      {gift.status === 'claimed' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Para: {gift.receiver_name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(gift.sent_date), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-amber-100 text-amber-700">
                        {gift.coins_amount} 💰
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {gift.status === 'claimed' ? 'Reclamado' : 'Pendiente'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Gift Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              Enviar Regalo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Select Friend */}
            <div>
              <label className="text-sm font-medium mb-1 block">Para</label>
              <Select
                value={newGift.receiver_email}
                onValueChange={(v) => setNewGift({ ...newGift, receiver_email: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un amigo" />
                </SelectTrigger>
                <SelectContent>
                  {friends.map((friend) => (
                    <SelectItem key={friend.email} value={friend.email}>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        {friend.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium mb-2 block">Cantidad de Monedas</label>
              <div className="grid grid-cols-3 gap-2">
                {coinOptions.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setNewGift({ ...newGift, coins_amount: amount })}
                    disabled={amount > (user.coins || 0)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-center transition-all",
                      newGift.coins_amount === amount
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300",
                      amount > (user.coins || 0) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="text-xl">💰</span>
                    <p className="font-bold text-amber-600">{amount}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Tienes {user.coins || 0} monedas</p>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium mb-1 block">Mensaje (opcional)</label>
              <Textarea
                value={newGift.message}
                onChange={(e) => setNewGift({ ...newGift, message: e.target.value })}
                placeholder="¡Felicidades por tu racha! 🎉"
                maxLength={100}
              />
            </div>

            <Button
              onClick={() => sendGiftMutation.mutate(newGift)}
              disabled={!newGift.receiver_email || newGift.coins_amount > (user.coins || 0) || sendGiftMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
            >
              {sendGiftMutation.isPending ? 'Enviando...' : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar {newGift.coins_amount} monedas
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}