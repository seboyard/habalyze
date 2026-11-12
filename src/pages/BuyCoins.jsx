import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Sparkles, Zap, Gift, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import HabboAvatar from '../components/avatar/HabboAvatar';

const coinPackages = [
  {
    id: 'starter',
    coins: 100,
    price: 0.99,
    badge: 'Iniciador',
    icon: Sparkles,
    color: 'from-blue-400 to-blue-600',
    popular: false
  },
  {
    id: 'popular',
    coins: 500,
    price: 3.99,
    badge: 'Popular',
    icon: Zap,
    color: 'from-purple-400 to-pink-600',
    popular: true,
    bonus: 50
  },
  {
    id: 'mega',
    coins: 1200,
    price: 7.99,
    badge: 'Mega',
    icon: Gift,
    color: 'from-orange-400 to-red-600',
    popular: false,
    bonus: 200
  },
  {
    id: 'ultimate',
    coins: 3000,
    price: 14.99,
    badge: 'Ultimate',
    icon: Crown,
    color: 'from-amber-400 to-yellow-600',
    popular: false,
    bonus: 700
  }
];

export default function BuyCoinsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const handlePurchase = async (pkg) => {
    setIsProcessing(true);
    setSelectedPackage(pkg.id);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add coins to user
    const totalCoins = pkg.coins + (pkg.bonus || 0);
    const newCoins = (user?.coins || 0) + totalCoins;
    
    await db.auth.updateMe({
      coins: newCoins
    });

    const updatedUser = await db.auth.me();
    setUser(updatedUser);

    toast.success('¡Compra exitosa! 🎉', {
      description: `Se agregaron ${totalCoins} monedas a tu cuenta`,
      duration: 5000
    });

    setIsProcessing(false);
    setSelectedPackage(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl('Shop'))}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Comprar Monedas
            </h1>
            <p className="text-gray-600 mt-1">Consigue monedas para personalizar tu avatar</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white shadow-lg border-2 border-amber-200 sticky top-4">
              <div className="text-center mb-6">
                <HabboAvatar user={user} size="large" showLevel={true} showCoins={false} />
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4 border-2 border-amber-300">
                  <p className="text-sm text-amber-700 mb-2">Saldo actual</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl">💰</span>
                    <span className="text-3xl font-bold text-amber-700">{user?.coins || 0}</span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium mb-2">💡 Consejo</p>
                  <p className="text-xs text-purple-600">
                    También puedes ganar monedas manteniendo rachas largas de hábitos: 50 monedas por 7 días, 100 por 14 días, y 250 por 30 días.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Coin Packages */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-amber-600" />
              Paquetes de Monedas
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {coinPackages.map((pkg, index) => {
                const Icon = pkg.icon;
                const totalCoins = pkg.coins + (pkg.bonus || 0);
                
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "relative overflow-hidden transition-all hover:shadow-xl",
                      pkg.popular && "border-4 border-purple-400 scale-105"
                    )}>
                      {pkg.popular && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                          ¡MÁS POPULAR!
                        </div>
                      )}

                      <div className={cn(
                        "h-3 bg-gradient-to-r",
                        pkg.color
                      )} />

                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center",
                            pkg.color
                          )}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <Badge className={cn(
                              "bg-gradient-to-r text-white",
                              pkg.color
                            )}>
                              {pkg.badge}
                            </Badge>
                            <h3 className="font-bold text-2xl text-gray-800 mt-1">
                              {pkg.coins} <span className="text-lg">💰</span>
                            </h3>
                          </div>
                        </div>

                        {pkg.bonus && (
                          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 mb-4">
                            <p className="text-green-700 font-bold text-center flex items-center justify-center gap-2">
                              <Gift className="w-4 h-4" />
                              ¡+{pkg.bonus} monedas de BONUS!
                            </p>
                            <p className="text-xs text-green-600 text-center mt-1">
                              Total: {totalCoins} monedas
                            </p>
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <p className="text-4xl font-bold text-gray-800">
                            ${pkg.price}
                          </p>
                          <p className="text-sm text-gray-500">USD</p>
                        </div>

                        <Button
                          onClick={() => handlePurchase(pkg)}
                          disabled={isProcessing}
                          className={cn(
                            "w-full bg-gradient-to-r text-white font-bold",
                            pkg.color,
                            "hover:opacity-90 transition-opacity"
                          )}
                        >
                          {isProcessing && selectedPackage === pkg.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Comprar Ahora
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-white rounded-2xl p-6 border-2 border-gray-200"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                Pago Seguro
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✓</span>
                  <span>Encriptación SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">✓</span>
                  <span>Pago seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">✓</span>
                  <span>Instantáneo</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                * Esta es una demostración. En producción, se integraría con Stripe, PayPal u otro procesador de pagos real.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}