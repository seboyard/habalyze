import { db } from '@/api/base44Client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, Instagram, Loader2 } from 'lucide-react';

import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ShareImageModal({ open, onOpenChange, eventType, eventData, user }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState('');

  React.useEffect(() => {
    if (open && !imageUrl && !isGenerating) {
      generateImage();
    }
  }, [open]);

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const response = await db.functions.invoke('generateShareImage', {
        event_type: eventType,
        data: eventData
      });

      setImageUrl(response.data.image_url);
      setTitle(response.data.title);
    } catch (error) {
      toast.error('Error al generar la imagen');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habalyze-${eventType}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Imagen descargada');
    } catch (error) {
      toast.error('Error al descargar la imagen');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(imageUrl);
    toast.success('Link copiado al portapapeles');
  };

  const handleShareInstagram = () => {
    // First download, then show instructions
    handleDownload();
    toast.success('Imagen descargada. Ahora puedes subirla a Instagram desde tu galería', {
      duration: 5000
    });
  };

  const handleShareGeneric = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'habalyze-share.png', { type: 'image/png' });
        
        await navigator.share({
          title: title,
          text: `${title}\n\n¡Únete a Habalyze y mejora tus hábitos!`,
          files: [file]
        });
        
        toast.success('¡Compartido!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          handleDownload();
        }
      }
    } else {
      handleDownload();
      toast.success('Imagen descargada. Compártela en tus redes sociales favoritas');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ¡Comparte tu logro!
          </DialogTitle>
          <DialogDescription>
            Descarga y comparte esta imagen en tus redes sociales
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              <p className="text-sm text-gray-600">Generando tu imagen...</p>
            </div>
          ) : imageUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="rounded-xl overflow-hidden border-2 border-purple-200 shadow-lg">
                <img 
                  src={imageUrl} 
                  alt="Share" 
                  className="w-full h-auto"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleShareInstagram}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>

                <Button
                  onClick={handleShareGeneric}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-2 border-purple-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>

                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="border-2 border-purple-300"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-700 text-center">
                  💡 <strong>Tip:</strong> Compartir en redes sociales ayuda a que más personas conozcan Habalyze y mejoren sus vidas
                </p>
              </div>
            </motion.div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}