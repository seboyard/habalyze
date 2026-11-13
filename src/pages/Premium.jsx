import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Check, Brain, Sparkles, TrendingUp, Zap, Star, MessageCircle, BarChart3, Target, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, addMonths, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const TRIAL_DAYS = 7;

const plans = [
  {
    id: 'monthly',
    name: 'Mensual',
    price: 4.99,
    period: 'mes',
    months: 1,
    popular: false
  },
  {
    id: 'quarterly',
    name: 'Trimestral',
    price: 11.99,
    originalPrice: 14.97,
    period: '3 meses',
    months: 3,
    popular: true,
    savings: 20
  },
  {
    id: 'yearly',
    name: 'Anual',
    price: 39.99,
    originalPrice: 59.88,
    period: 'año',
    months: 12,
    popular: false,
    savings: 33
  }
];

const premiumFeatures = [
  {
    icon: Brain,
    title: 'Coach IA Avanzado',
    description: 'Análisis profundo de patrones, predicciones y consejos proactivos personalizados',
    color: 'text-purple-600 bg-purple-100'
  },
  {
    icon: BarChart3,
    title: 'Estadísticas Detalladas',
    description: 'Reportes semanales automáticos, tendencias a largo plazo y métricas avanzadas',
    color: 'text-blue-600 bg-blue-100'
  },
  {
    icon: Target,
    title: 'Metas Inteligentes',
    description: 'El Coach te sugiere nuevos hábitos basados en tu progreso y objetivos',
    color: 'text-green-600 bg-green-100'
  },
  {
    icon: MessageCircle,
    title: 'Chat Ilimitado',
    description: 'Sin límite de mensajes con el Coach IA y respuestas más elaboradas',
    color: 'text-pink-600 bg-pink-100'
  },
  {
    icon: Sparkles,
    title: 'Items Exclusivos',
    description: 'Acceso a items premium del avatar solo para suscriptores',
    color: 'text-amber-600 bg-amber-100'
  },
  {
    icon: Shield,
    title: 'Protección de Racha',
    description: '3 protecciones de racha gratis al mes para no perder tu progreso',
    color: 'text-red-600 bg-red-100'
  }
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('quarterly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTrialStarted, setShowTrialStarted] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await db.auth.me();
      setUser(currentUser);
      
      // Check for success parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        toast.success('¡Bienvenido a Premium! 👑', {
          description: 'Tu suscripción ha sido activada correctamente',
          duration: 5000
        });
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    };
    loadUser();
  }, []);

  const handleStartTrial = async () => {
    if (user?.has_used_trial) {
      toast.error('Ya has usado tu prueba gratuita');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const trialEnd = format(addDays(new Date(), TRIAL_DAYS), 'yyyy-MM-dd');
    
    await db.auth.updateMe({
      is_premium: true,
      premium_until: trialEnd,
      has_used_trial: true,
      trial_started: format(new Date(), 'yyyy-MM-dd')
    });

    const updatedUser = await db.auth.me();
    setUser(updatedUser);
    setShowTrialStarted(true);

    toast.success('¡Prueba gratuita activada! 🎉', {
      description: `Disfruta de Premium por ${TRIAL_DAYS} días`,
      duration: 5000
    });

    setIsProcessing(false);
  };

  const canStartTrial = !user?.has_used_trial && !user?.is_premium;

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      const response = await db.functions.invoke('createPayPalSubscription', {
        plan_id: selectedPlan,
        return_url: `${window.location.origin}${createPageUrl('Premium')}?success=true`,
        cancel_url: `${window.location.origin}${createPageUrl('Premium')}`
      });

      if (response.data.approval_url) {
        window.location.href = response.data.approval_url;
      } else if (response.data.local_only) {
        const until = new Date();
        until.setDate(until.getDate() + 30);
        await db.auth.updateMe({
          is_premium: true,
          premium_until: until.toISOString(),
          has_used_trial: true,
        });
        const updatedUser = await db.auth.me();
        setUser(updatedUser);
        toast.success('Premium simulado en este navegador', {
          description: 'No se conectó PayPal y no hubo ningún cobro.',
        });
        setIsProcessing(false);
      } else {
        throw new Error('No approval URL received');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Error al iniciar suscripción', {
        description: 'Por favor, inténtalo de nuevo'
      });
      setIsProcessing(false);
    }
  };

  const isPremiumActive = user?.is_premium && user?.premium_until && new Date(user.premium_until) > new Date();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2B1741] text-[#FFF4DD] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-white/80 hover:text-white hover:bg-white/10 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-6 shadow-2xl"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Habalyze Premium
          </h1>
          <p className="text-xl text-[#BA92EB] max-w-2xl mx-auto">
            El premium añade coach y cosméticos. Los hábitos de siempre siguen gratis, y PayPal todavía no cobra.
          </p>
        </div>

        {isPremiumActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-400/50 rounded-2xl p-6 mb-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-amber-400" />
              <span className="text-xl font-bold text-amber-400">¡Ya eres Premium!</span>
            </div>
            <p className="text-purple-200">
              Tu suscripción está activa hasta el {format(new Date(user.premium_until), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
            {user?.has_used_trial && user?.trial_started && (
              <Badge className="mt-2 bg-purple-500/30 text-purple-200">
                Prueba gratuita iniciada el {format(new Date(user.trial_started), "d 'de' MMMM", { locale: es })}
              </Badge>
            )}
          </motion.div>
        )}

        {/* Free Trial Banner */}
        {canStartTrial && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400/50 rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">¡Prueba Premium GRATIS!</h3>
                  <p className="text-emerald-200">{TRIAL_DAYS} días para experimentar todas las funciones</p>
                </div>
              </div>
              <Button
                onClick={handleStartTrial}
                disabled={isProcessing}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-6"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Activando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Empezar Prueba Gratis
                  </>
                )}
              </Button>
            </div>
            <p className="text-emerald-300/70 text-xs mt-3 text-center">
              Sin tarjeta de crédito • Se cancela automáticamente • Sin compromiso
            </p>
          </motion.div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-5 bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-all h-full">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", feature.color)}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-purple-200">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pricing */}
        {!isPremiumActive && (
          <>
            <h2 className="text-2xl font-bold text-white text-center mb-6">Elige tu plan</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className="cursor-pointer"
                >
                  <Card className={cn(
                    "relative overflow-hidden transition-all p-6",
                    selectedPlan === plan.id
                      ? "bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-amber-300"
                      : "bg-white/10 backdrop-blur border-white/20 hover:border-white/40",
                    plan.popular && selectedPlan !== plan.id && "ring-2 ring-amber-400"
                  )}>
                    {plan.popular && (
                      <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
                        Popular
                      </Badge>
                    )}
                    {plan.savings && (
                      <Badge className={cn(
                        "absolute top-3 left-3",
                        selectedPlan === plan.id ? "bg-white text-amber-600" : "bg-green-500 text-white"
                      )}>
                        -{plan.savings}%
                      </Badge>
                    )}

                    <div className="text-center pt-4">
                      <h3 className={cn(
                        "text-lg font-bold mb-2",
                        selectedPlan === plan.id ? "text-white" : "text-white"
                      )}>
                        {plan.name}
                      </h3>
                      
                      {plan.originalPrice && (
                        <p className={cn(
                          "text-sm line-through",
                          selectedPlan === plan.id ? "text-white/60" : "text-purple-300"
                        )}>
                          ${plan.originalPrice}
                        </p>
                      )}
                      
                      <div className="flex items-baseline justify-center gap-1 my-2">
                        <span className={cn(
                          "text-4xl font-bold",
                          selectedPlan === plan.id ? "text-white" : "text-white"
                        )}>
                          ${plan.price}
                        </span>
                        <span className={cn(
                          "text-sm",
                          selectedPlan === plan.id ? "text-white/80" : "text-purple-200"
                        )}>
                          /{plan.period}
                        </span>
                      </div>

                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 mx-auto mt-4 flex items-center justify-center",
                        selectedPlan === plan.id
                          ? "border-white bg-white"
                          : "border-white/40"
                      )}>
                        {selectedPlan === plan.id && (
                          <Check className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-12 py-6 text-lg rounded-xl shadow-2xl"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Suscribirme a Premium
                  </>
                )}
              </Button>
              <p className="text-purple-300 text-sm mt-4">
                Cancela cuando quieras • Sin compromisos
              </p>
            </div>
          </>
        )}

        {/* Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h3 className="text-xl font-bold text-white text-center mb-6">Comparación de planes</h3>
          <Card className="overflow-hidden bg-white/10 backdrop-blur border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4 text-purple-200 font-medium">Característica</th>
                    <th className="text-center p-4 text-purple-200 font-medium">Gratis</th>
                    <th className="text-center p-4 text-amber-400 font-bold">Premium 👑</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  <tr className="border-b border-white/10">
                    <td className="p-4">Mensajes al Coach IA</td>
                    <td className="text-center p-4 text-purple-300">10/día</td>
                    <td className="text-center p-4 text-amber-400 font-bold">Ilimitados</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Análisis de patrones</td>
                    <td className="text-center p-4 text-purple-300">Básico</td>
                    <td className="text-center p-4 text-amber-400 font-bold">Avanzado + Predicciones</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Reportes semanales</td>
                    <td className="text-center p-4 text-red-400">✗</td>
                    <td className="text-center p-4 text-green-400">✓</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Sugerencias proactivas</td>
                    <td className="text-center p-4 text-red-400">✗</td>
                    <td className="text-center p-4 text-green-400">✓</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Protección de racha</td>
                    <td className="text-center p-4 text-red-400">✗</td>
                    <td className="text-center p-4 text-green-400">3/mes</td>
                  </tr>
                  <tr>
                    <td className="p-4">Items exclusivos</td>
                    <td className="text-center p-4 text-red-400">✗</td>
                    <td className="text-center p-4 text-green-400">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}