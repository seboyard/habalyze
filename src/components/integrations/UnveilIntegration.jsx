import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check, Link2, Unlink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Unveil neural graph icon
const UnveilIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="4" cy="6" r="1.5" fill="currentColor" />
    <circle cx="20" cy="6" r="1.5" fill="currentColor" />
    <circle cx="4" cy="18" r="1.5" fill="currentColor" />
    <circle cx="20" cy="18" r="1.5" fill="currentColor" />
    <circle cx="12" cy="3" r="1.5" fill="currentColor" />
    <circle cx="12" cy="21" r="1.5" fill="currentColor" />
    <line x1="12" y1="10" x2="5.5" y2="6.5" strokeWidth="1" />
    <line x1="12" y1="10" x2="18.5" y2="6.5" strokeWidth="1" />
    <line x1="12" y1="14" x2="5.5" y2="17.5" strokeWidth="1" />
    <line x1="12" y1="14" x2="18.5" y2="17.5" strokeWidth="1" />
    <line x1="12" y1="10" x2="12" y2="4.5" strokeWidth="1" />
    <line x1="12" y1="14" x2="12" y2="19.5" strokeWidth="1" />
  </svg>
);

export default function UnveilIntegration({ user, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const isConnected = user?.unveil_connected === true;

  const handleConnect = async () => {
    if (!token.trim()) {
      toast.error('Por favor pega tu Habalyze Token de Unveil');
      return;
    }
    setLoading(true);
    await db.auth.updateMe({
      unveil_token: token.trim(),
      unveil_connected: true,
      unveil_connected_at: new Date().toISOString()
    });
    setLoading(false);
    setShowModal(false);
    setToken('');
    toast.success('✓ Habalyze está enviando datos a Unveil');
    onUpdate?.();
  };

  const handleDisconnect = async () => {
    await db.auth.updateMe({
      unveil_token: null,
      unveil_connected: false,
      unveil_connected_at: null
    });
    toast.success('Desconectado de Unveil');
    onUpdate?.();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={`p-5 border-2 transition-all ${isConnected ? 'border-violet-300 bg-gradient-to-r from-violet-50 to-fuchsia-50' : 'border-gray-200'}`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <UnveilIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-gray-800 text-base">Unveil</h3>
                <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px]">Beta</Badge>
                {isConnected && (
                  <Badge className="bg-green-100 text-green-700 border border-green-300 text-[10px]">
                    <Check className="w-3 h-3 mr-1" /> Conectado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Tu diario neural. Unveil mapea tu mundo interior — pensamientos, emociones y patrones — 
                en un grafo 3D vivo. Al conectarlo con Habalyze, cada hábito que construyes se convierte 
                en parte de tu mapa mental.
              </p>
              {isConnected ? (
                <div className="space-y-2">
                  <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Habalyze está enviando datos a Unveil
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Unlink className="w-4 h-4 mr-1" /> Desconectar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
                  size="sm"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Conectar con Unveil
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <UnveilIcon className="w-5 h-5 text-white" />
              </div>
              Conectar con Unveil
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-5">
            {/* Steps */}
            <div className="space-y-3">
              {[
                { step: 1, text: 'Entra a Unveil → Perfil → Integraciones → Habalyze' },
                { step: 2, text: 'Copia tu Habalyze Token' },
                { step: 3, text: 'Pega el token aquí abajo' },
                { step: 4, text: 'Haz clic en "Vincular"' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {step}
                  </div>
                  <p className="text-sm text-gray-700">{text}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Token de Habalyze</label>
              <Input
                placeholder="Pega tu token aquí..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button
              onClick={handleConnect}
              disabled={loading || !token.trim()}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
            >
              {loading ? 'Vinculando...' : 'Vincular'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}