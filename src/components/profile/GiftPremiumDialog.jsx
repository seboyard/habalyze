import { db } from '@/api/base44Client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Crown, Sparkles, Check, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const premiumPlans = [
  {
    id: 'monthly',
    paypalPlanId: 'P-57C98285723689441VNFA3VYQ',
    name: '1 Mes Premium',
    price: 4.99,
    duration: 1,
    durationUnit: 'mes',
    popular: false,
  },
  {
    id: 'quarterly',
    paypalPlanId: 'P-75N68190GY568922TNFA3WKA',
    name: '3 Meses Premium',
    price: 11.99,
    duration: 3,
    durationUnit: 'meses',
    popular: true,
    savings: '20%',
  },
  {
    id: 'yearly',
    paypalPlanId: 'P-47Y60856ER183Z829NFA3WXI',
    name: '1 Año Premium',
    price: 39.99,
    duration: 12,
    durationUnit: 'meses',
    popular: false,
    savings: '33%',
  },
];

const premiumFeatures = [
  'Mensajes ilimitados con Coach IA',
  'Avatares y personalizaciones premium',
  'Análisis avanzado de hábitos',
  'Sin anuncios',
  'Prioridad en nuevas funciones',
  'Badges exclusivos',
];

export default function GiftPremiumDialog({ open, onOpenChange, recipientUser, currentUser }) {
  const [selectedPlan, setSelectedPlan] = useState('quarterly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!recipientUser || !currentUser) {
      toast.error('Error: usuario no encontrado');
      return;
    }

    setIsProcessing(true);
    
    try {
      const plan = premiumPlans.find(p => p.id === selectedPlan);
      const returnUrl = `${window.location.origin}${window.location.pathname}?gift_success=true&recipient=${encodeURIComponent(recipientUser.email)}`;
      const cancelUrl = `${window.location.origin}${window.location.pathname}?gift_cancelled=true`;

      const response = await db.functions.invoke('createPayPalSubscription', {
        plan_id: selectedPlan,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        custom_data: {
          gift_from: currentUser.email,
          gift_to: recipientUser.email,
          duration: plan.duration,
          duration_unit: plan.durationUnit
        }
      });

      if (response.data.approval_url) {
        window.location.href = response.data.approval_url;
      } else {
        toast.error('Error al crear la suscripción');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error purchasing gift:', error);
      toast.error('Error al procesar el pago');
      setIsProcessing(false);
    }
  };

  const plan = premiumPlans.find(p => p.id === selectedPlan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Regalar Premium</DialogTitle>
              <DialogDescription>
                Para {recipientUser?.display_name || recipientUser?.full_name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Beneficios Premium */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-900">Beneficios Premium</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {premiumFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-amber-800">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Planes */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Selecciona el plan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {premiumPlans.map((p) => (
                <motion.button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPlan === p.id
                      ? 'border-amber-500 bg-amber-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-amber-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {p.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      Popular
                    </Badge>
                  )}
                  {p.savings && (
                    <Badge className="absolute -top-2 left-2 bg-green-500 text-white text-xs">
                      Ahorra {p.savings}
                    </Badge>
                  )}
                  <div className="mb-2">
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.duration} {p.durationUnit}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">${p.price}</span>
                    <span className="text-sm text-gray-500">USD</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Plan seleccionado:</span>
              <span className="font-bold text-gray-800">{plan?.name}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Para:</span>
              <span className="font-medium text-gray-800">
                {recipientUser?.display_name || recipientUser?.full_name}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
              <span className="font-bold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-amber-600">${plan?.price} USD</span>
            </div>
          </div>

          {/* Mensaje personalizado */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                {recipientUser?.full_name} recibirá un mensaje especial
              </span>
            </div>
            <p className="text-xs text-purple-700">
              "¡{currentUser?.full_name || 'Tu amigo'} te ha regalado {plan?.duration} {plan?.durationUnit} de Premium! 🎁 
              Disfruta de todas las funciones exclusivas de Habalyze."
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceder al pago
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            🔒 Pago seguro • Procesado por PayPal
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}