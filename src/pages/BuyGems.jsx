import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Gem, Sparkles, Zap, Gift, Crown, Star, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const gemPackages = [
  {
    id: 'small',
    gems: 50,
    price: 1.99,
    badge: 'Pequeño',
    icon: Gem,
    color: 'from-cyan-400 to-blue-600',
    popular: false
  },
  {
    id: 'medium',
    gems: 150,
    price: 4.99,
    badge: 'Mediano',
    icon: Sparkles,
    color: 'from-violet-400 to-purple-600',
    popular: true,
    bonus: 25
  },
  {
    id: 'large',
    gems: 400,
    price: 9.99,
    badge: 'Grande',
    icon: Zap,
    color: 'from-fuchsia-400 to-pink-600',
    popular: false,
    bonus: 80
  },
  {
    id: 'mega',
    gems: 1000,
    price: 19.99,
    badge: 'Mega',
    icon: Crown,
    color: 'from-amber-400 to-orange-600',
    popular: false,
    bonus: 250
  }
];

export default function BuyGemsPage() {
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

    await new Promise(resolve => setTimeout(resolve, 2000));

    const totalGems = pkg.gems + (pkg.bonus || 0);
    const newGems = (user?.gems || 0) + totalGems;
    
    await db.auth.updateMe({ gems: newGems });

    const updatedUser = await db.auth.me();
    setUser(updatedUser);

    toast.success('¡Compra exitosa! 💎', {
      description: `Se agregaron ${totalGems} gemas a tu cuenta`,
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Comprar Gemas
            </h1>
            <p className="text-gray-600 mt-1">Moneda premium para items exclusivos</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white shadow-lg border-2 border-violet-200 sticky top-20">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-xl p-4 border-2 border-violet-300">
                  <p className="text-sm text-violet-700 mb-2">Tus Gemas</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl">💎</span>
                    <span className="text-3xl font-bold text-violet-700">{user?.gems || 0}</span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                  <p className="text-sm text-amber-700 mb-2">Tus Monedas</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-2xl font-bold text-amber-700">{user?.coins || 0}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl p-4 border border-violet-200">
                  <h4 className="font-bold text-violet-800 mb-2 flex items-center gap-2">
                    <Gem className="w-4 h-4" /> ¿Para qué sirven las gemas?
                  </h4>
                  <ul className="text-xs text-violet-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <Star className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Comprar items exclusivos y legendarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Desbloquear mascotas y efectos especiales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Acceso a cajas legendarias</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Artículos de edición limitada</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Gem Packages */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Gem className="w-6 h-6 text-violet-600" />
              Paquetes de Gemas
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {gemPackages.map((pkg, index) => {
                const Icon = pkg.icon;
                const totalGems = pkg.gems + (pkg.bonus || 0);
                
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "relative overflow-hidden transition-all hover:shadow-xl",
                      pkg.popular && "border-4 border-violet-400 scale-105"
                    )}>
                      {pkg.popular && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                          ¡MEJOR VALOR!
                        </div>
                      )}

                      <div className={cn("h-3 bg-gradient-to-r", pkg.color)} />

                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center",
                            pkg.color
                          )}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <Badge className={cn("bg-gradient-to-r text-white", pkg.color)}>
                              {pkg.badge}
                            </Badge>
                            <h3 className="font-bold text-2xl text-gray-800 mt-1">
                              {pkg.gems} <span className="text-lg">💎</span>
                            </h3>
                          </div>
                        </div>

                        {pkg.bonus && (
                          <div className="bg-fuchsia-50 border-2 border-fuchsia-300 rounded-lg p-3 mb-4">
                            <p className="text-fuchsia-700 font-bold text-center flex items-center justify-center gap-2">
                              <Gift className="w-4 h-4" />
                              ¡+{pkg.bonus} gemas de BONUS!
                            </p>
                            <p className="text-xs text-fuchsia-600 text-center mt-1">
                              Total: {totalGems} gemas
                            </p>
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <p className="text-4xl font-bold text-gray-800">${pkg.price}</p>
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
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Encriptación SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Pago seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Instantáneo</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}