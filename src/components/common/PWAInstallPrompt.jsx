import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PWAInstallPrompt({ userPrefs }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    if (userPrefs?.pwa_install_prompted || userPrefs?.pwa_install_dismissed) {
      return;
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 10 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [userPrefs]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.info('La instalación no está disponible en este navegador');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('¡App instalada! Ahora puedes acceder desde tu pantalla de inicio 🎉');
      
      // Mark as installed
      if (userPrefs?.id) {
        await db.entities.UserPreferences.update(userPrefs.id, {
          pwa_install_prompted: true,
          pwa_install_dismissed: false
        });
      }
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = async () => {
    setShowPrompt(false);
    
    // Mark as dismissed
    if (userPrefs?.id) {
      await db.entities.UserPreferences.update(userPrefs.id, {
        pwa_install_prompted: true,
        pwa_install_dismissed: true
      });
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 z-50 md:max-w-sm"
        >
          <Card className="p-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none shadow-2xl">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                  Instala Habalyze
                  <Zap className="w-4 h-4 text-yellow-300" />
                </h3>
                <p className="text-sm text-violet-100 mb-3">
                  Accede más rápido y recibe notificaciones en tu pantalla de inicio
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    className="bg-white text-violet-600 hover:bg-violet-50 flex-1"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Instalar
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    size="sm"
                  >
                    Ahora no
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}