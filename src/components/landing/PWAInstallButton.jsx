import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const isIOSDevice = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isAndroidDevice = () => /Android/.test(navigator.userAgent);
const isIOSChrome = () => isIOSDevice() && /CriOS/.test(navigator.userAgent);
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export default function PWAInstallButton({ inline = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Already installed — never show
    if (isStandalone()) return;

    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    if (!inline && lastDismissed) {
      const days = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (days < 7) return;
    }

    // iOS: show immediately (no beforeinstallprompt on iOS)
    if (isIOSDevice()) {
      if (inline) {
        setShowButton(true);
      } else {
        setTimeout(() => setShowButton(true), 3000);
      }
      return;
    }

    // Android / Chrome: listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Android fallback: if event never fires, show button anyway after delay
    const fallback = setTimeout(() => {
      if (isAndroidDevice()) setShowButton(true);
    }, inline ? 0 : 4000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(fallback);
    };
  }, [inline]);

  const handleInstall = async () => {
    if (isIOSDevice()) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          toast.success('¡App instalada correctamente! 🎉');
        } else {
          toast.info('Instalación cancelada');
        }
        setShowButton(false);
        setDeferredPrompt(null);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      } catch {
        toast.error('Error al instalar.');
      }
      return;
    }

    // Android fallback — no native prompt available
    toast.info('📱 Abre el menú del navegador (⋮) y toca "Instalar app" o "Añadir a pantalla de inicio"', {
      duration: 10000,
    });
  };

  const handleDismiss = () => {
    setShowButton(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // iOS modal
  const IOSGuideModal = () => (
    <AnimatePresence>
      {showIOSGuide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[200] flex items-end justify-center"
          onClick={() => setShowIOSGuide(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-3xl w-full max-w-lg shadow-2xl pb-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-2">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 text-xl">Instalar en iPhone / iPad</h3>
                <button onClick={() => setShowIOSGuide(false)} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <ol className="space-y-5">
                {/* Step 1 */}
                <li className="flex gap-4">
                  <span className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Abre esta página en <span className="text-blue-600">Safari</span></p>
                    <p className="text-sm text-gray-500 mt-0.5">La instalación solo funciona desde Safari (no Chrome ni Firefox en iOS)</p>
                  </div>
                </li>

                {/* Step 2 */}
                <li className="flex gap-4">
                  <span className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Toca el botón <span className="text-blue-600">Compartir</span> de Safari</p>
                    <p className="text-sm text-gray-500 mt-0.5">Es el ícono de caja con flecha hacia arriba en la barra inferior</p>
                    {/* Visual mockup of Safari bar */}
                    <div className="mt-3 bg-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between border border-gray-200">
                      <span className="text-gray-400 text-xs">←</span>
                      <div className="flex items-center gap-1 bg-white rounded-lg px-3 py-1.5 shadow-sm border border-gray-200 flex-1 mx-3">
                        <span className="text-xs text-gray-400 truncate">habalyze.db.app</span>
                      </div>
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                        className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                      >
                        {/* Share icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </li>

                {/* Step 3 */}
                <li className="flex gap-4">
                  <span className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Toca <span className="text-blue-600">"Añadir a pantalla de inicio"</span></p>
                    <p className="text-sm text-gray-500 mt-0.5">Desliza hacia abajo en el menú hasta encontrar esta opción</p>
                    {/* Visual mockup of the option */}
                    <div className="mt-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 opacity-40">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-base">🔗</div>
                        <span className="text-sm text-gray-600">Copiar enlace</span>
                      </div>
                      <motion.div
                        animate={{ backgroundColor: ['#f5f3ff', '#ede9fe', '#f5f3ff'] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
                      >
                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-base">➕</div>
                        <span className="text-sm font-semibold text-gray-900">Añadir a pantalla de inicio</span>
                      </motion.div>
                      <div className="flex items-center gap-3 px-4 py-3 opacity-40">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-base">📤</div>
                        <span className="text-sm text-gray-600">Compartir...</span>
                      </div>
                    </div>
                  </div>
                </li>

                {/* Step 4 */}
                <li className="flex gap-4">
                  <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">✓</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Toca <span className="text-blue-600">"Añadir"</span> arriba a la derecha</p>
                    <p className="text-sm text-gray-500 mt-0.5">¡Habalyze aparecerá en tu pantalla de inicio!</p>
                  </div>
                </li>
              </ol>

              <Button
                onClick={() => setShowIOSGuide(false)}
                className="w-full mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-3 rounded-2xl text-base"
              >
                ¡Entendido!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!showButton) return <IOSGuideModal />;

  if (inline) {
    return (
      <>
        <IOSGuideModal />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-4 shadow-xl border-2 border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">📱 Instala Habalyze</h3>
                <p className="text-xs text-violet-100">Accede más rápido desde tu pantalla de inicio</p>
              </div>
            </div>
            <Button
              onClick={handleInstall}
              className="w-full bg-white text-violet-600 hover:bg-violet-50 font-bold"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Añadir a Pantalla de Inicio
            </Button>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <IOSGuideModal />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 left-4 right-4 z-50 lg:bottom-4"
        >
          <div className="max-w-md mx-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-4 shadow-2xl border-2 border-white/20 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="font-bold text-white text-sm">Instala Habalyze</h3>
                <p className="text-xs text-violet-100">Acceso rápido desde tu pantalla de inicio</p>
              </div>
            </div>
            <Button
              onClick={handleInstall}
              className="w-full mt-3 bg-white text-violet-600 hover:bg-violet-50"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Añadir a Inicio
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}