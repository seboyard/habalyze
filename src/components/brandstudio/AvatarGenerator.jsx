import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, Save, Scissors, Shirt, Palette, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

import PixelAvatar, {
  skinTones,
  faceExpressions,
  hairStyles,
  hairColors,
  shirtStyles,
  pantsStyles,
  shoesStyles,
  clothingColors,
  accessories,
  pets,
  visualEffects,
} from '../avatar/PixelAvatar';

const categories = [
  { id: 'face',        label: 'Cara',       icon: '😊' },
  { id: 'skin',        label: 'Piel',        icon: '🎨' },
  { id: 'hair',        label: 'Cabello',     icon: '💇' },
  { id: 'shirt',       label: 'Camisa',      icon: '👕' },
  { id: 'pants',       label: 'Pantalón',    icon: '👖' },
  { id: 'shoes',       label: 'Zapatos',     icon: '👟' },
  { id: 'accessories', label: 'Accesorios',  icon: '🎀' },
  { id: 'effects',     label: 'Efectos',     icon: '✨' },
];

const animationOptions = [
  { id: 'idle',    icon: '🧍', label: 'Quieto' },
  { id: 'wave',    icon: '👋', label: 'Saludo' },
  { id: 'dance',   icon: '💃', label: 'Bailar' },
  { id: 'jump',    icon: '🦘', label: 'Saltar' },
  { id: 'bounce',  icon: '⬆️', label: 'Rebotar' },
  { id: 'spin',    icon: '🔄', label: 'Girar' },
  { id: 'float',   icon: '☁️', label: 'Flotar' },
  { id: 'excited', icon: '🤩', label: 'Emoción' },
  { id: 'sleep',   icon: '😴', label: 'Dormir' },
  { id: 'none',    icon: '⏸️', label: 'Estático' },
];

const DEFAULT_CONFIG = {
  face: 'happy',
  skinColor: 'light',
  hairStyle: 'short',
  hairColor: 'brown',
  shirtStyle: 'tshirt',
  shirtColor: '#7e57c2',
  pantsStyle: 'jeans',
  pantsColor: '#2196f3',
  shoesStyle: 'sneakers',
  shoesColor: '#212121',
  hat: null,
  hatColor: '#3498db',
  glasses: null,
  scarf: null,
  scarfColor: '#e74c3c',
  gloves: null,
  glovesColor: '#1a1a1a',
  backpack: null,
  backpackColor: '#795548',
  pet: null,
  effect: null,
};

function buildPrompt(config) {
  const face = faceExpressions[config.face]?.name || config.face;
  const skin = skinTones[config.skinColor]?.name || config.skinColor;
  const hair = `${hairStyles[config.hairStyle]?.name || config.hairStyle} ${hairColors[config.hairColor]?.name || config.hairColor}`;
  const shirt = `${shirtStyles[config.shirtStyle]?.name || config.shirtStyle} (${config.shirtColor})`;
  const pants = `${pantsStyles[config.pantsStyle]?.name || config.pantsStyle} (${config.pantsColor})`;
  const shoes = `${shoesStyles[config.shoesStyle]?.name || config.shoesStyle} (${config.shoesColor})`;
  const hat = config.hat ? `hat: ${config.hat}` : 'no hat';
  const glasses = config.glasses ? `glasses: ${config.glasses}` : 'no glasses';
  const petStr = config.pet ? `with pet: ${pets[config.pet]?.name || config.pet}` : 'no pet';
  const effect = config.effect ? `visual effect: ${visualEffects[config.effect]?.name || config.effect}` : 'no effect';
  return `Pixel art character for Habalyze app. Expression: ${face}. Skin: ${skin}. Hair: ${hair}. Shirt: ${shirt}. Pants: ${pants}. Shoes: ${shoes}. ${hat}. ${glasses}. ${petStr}. ${effect}. Brand color: #7c3aed (violet). Clean pixel art, cute and friendly, modern game style, transparent background.`;
}

export default function AvatarGenerator() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeCategory, setActiveCategory] = useState('face');
  const [previewAnimation, setPreviewAnimation] = useState('idle');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const updateConfig = (key, value) => {
    setConfig(c => ({ ...c, [key]: value }));
    setPreviewAnimation('jump');
    setTimeout(() => setPreviewAnimation('idle'), 600);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Escribe un nombre para el avatar'); return; }
    setSaving(true);
    const prompt = buildPrompt(config);
    await db.entities.BrandAsset.create({
      name: name.trim(),
      category: 'avatar',
      config,
      preview_description: prompt,
      prompt_text: prompt,
    });
    toast.success('Avatar guardado en la biblioteca');
    setName('');
    setSaving(false);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(buildPrompt(config));
    toast.success('Prompt copiado al portapapeles');
  };

  const previewUser = { avatar_config: config, level: 1, coins: 0 };

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-8">
      {/* Preview Panel */}
      <div className="lg:sticky lg:top-4 h-fit space-y-4">
        <Card className="overflow-hidden border-2 border-violet-200 shadow-xl">
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-3 text-center">
            <h2 className="text-white font-bold">Vista Previa</h2>
          </div>
          <div className="p-6 bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 flex flex-col items-center">
            <motion.div
              key={JSON.stringify(config)}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <PixelAvatar user={previewUser} size="xlarge" showLevel={false} showCoins={false} animation={previewAnimation} />
            </motion.div>

            {/* Animation selector */}
            <div className="mt-4 w-full">
              <p className="text-xs font-medium text-gray-600 mb-2 text-center">Animación</p>
              <div className="grid grid-cols-5 gap-1">
                {animationOptions.map(anim => (
                  <Button
                    key={anim.id}
                    size="sm"
                    variant={previewAnimation === anim.id ? 'default' : 'outline'}
                    onClick={() => setPreviewAnimation(anim.id)}
                    className={cn('text-sm p-1 h-9', previewAnimation === anim.id && 'bg-violet-600')}
                    title={anim.label}
                  >
                    {anim.icon}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Save / Copy */}
        <div className="space-y-2">
          <Input
            placeholder="Nombre del avatar (ej: Mascota celebrando)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button variant="outline" onClick={handleCopyPrompt} className="flex-1 border-violet-300 text-violet-700 hover:bg-violet-50">
              <Copy className="w-4 h-4 mr-2" />
              Copiar prompt
            </Button>
          </div>
        </div>
      </div>

      {/* Customization Panel */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all border-2 text-sm',
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent shadow-lg'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
              )}
            >
              <span className="text-base">{cat.icon}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Face */}
          {activeCategory === 'face' && (
            <motion.div key="face" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">😊 Expresión Facial</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {Object.entries(faceExpressions).map(([id, face]) => (
                    <motion.button key={id} onClick={() => updateConfig('face', id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={cn('p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1',
                        config.face === id ? 'border-pink-500 bg-pink-50 shadow-lg' : 'border-gray-200 hover:border-pink-300 bg-gray-50')}>
                      <div className="w-12 h-14 flex items-center justify-center">
                        <PixelAvatar user={{ avatar_config: { ...config, face: id } }} size="small" showLevel={false} animation="none" />
                      </div>
                      <span className="text-[10px] font-medium text-gray-600 truncate w-full text-center">{face.name}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Skin */}
          {activeCategory === 'skin' && (
            <motion.div key="skin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg space-y-5">
                <Label className="text-lg font-bold flex items-center gap-2 text-gray-800"><Palette className="w-5 h-5 text-amber-500" /> Tono de Piel</Label>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Tonos Naturales</p>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                    {Object.entries(skinTones).slice(0, 10).map(([id, tone]) => (
                      <motion.button key={id} onClick={() => updateConfig('skinColor', id)} whileHover={{ scale: 1.15, y: -3 }}>
                        <div className={cn('w-10 h-10 rounded-xl border-4 transition-all shadow-md',
                          config.skinColor === id ? 'border-violet-500 ring-4 ring-violet-200 scale-110' : 'border-white hover:border-violet-300')}
                          style={{ backgroundColor: tone.base }} />
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-sm font-medium text-purple-700 mb-3">✨ Tonos Fantasía</p>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                    {Object.entries(skinTones).slice(10).map(([id, tone]) => (
                      <motion.button key={id} onClick={() => updateConfig('skinColor', id)} whileHover={{ scale: 1.15, y: -3 }}>
                        <div className={cn('w-10 h-10 rounded-xl border-4 transition-all shadow-md',
                          config.skinColor === id ? 'border-purple-500 ring-4 ring-purple-200 scale-110' : 'border-white hover:border-purple-300')}
                          style={{ backgroundColor: tone.base }} />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Hair */}
          {activeCategory === 'hair' && (
            <motion.div key="hair" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800"><Scissors className="w-5 h-5 text-pink-500" /> Estilo de Cabello</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {Object.entries(hairStyles).map(([id, style]) => (
                    <motion.button key={id} onClick={() => updateConfig('hairStyle', id)} whileHover={{ scale: 1.05 }}
                      className={cn('p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1',
                        config.hairStyle === id ? 'border-pink-500 bg-pink-50 shadow-lg' : 'border-gray-200 hover:border-pink-300 bg-gray-50')}>
                      <div className="w-12 h-14 flex items-center justify-center">
                        <PixelAvatar user={{ avatar_config: { ...config, hairStyle: id } }} size="small" showLevel={false} animation="none" />
                      </div>
                      <span className="text-[9px] font-medium text-gray-600">{style.name}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 text-gray-800">🎨 Color de Cabello</Label>
                <div className="grid grid-cols-10 gap-2">
                  {Object.entries(hairColors).map(([id, color]) => (
                    <motion.button key={id} onClick={() => updateConfig('hairColor', id)} whileHover={{ scale: 1.2 }}
                      className={cn('w-7 h-7 rounded-lg border-3 transition-all shadow-sm',
                        config.hairColor === id ? 'border-violet-500 ring-2 ring-violet-300 scale-110' : 'border-gray-200')}
                      style={{ backgroundColor: color.base }} />
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Shirt */}
          {activeCategory === 'shirt' && (
            <motion.div key="shirt" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800"><Shirt className="w-5 h-5 text-blue-500" /> Estilo de Camisa</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(shirtStyles).map(([id, style]) => (
                    <motion.button key={id} onClick={() => updateConfig('shirtStyle', id)} whileHover={{ scale: 1.05 }}
                      className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        config.shirtStyle === id ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300 bg-gray-50')}>
                      <div className="w-12 h-14 flex items-center justify-center">
                        <PixelAvatar user={{ avatar_config: { ...config, shirtStyle: id } }} size="small" showLevel={false} animation="none" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{style.name}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 text-gray-800">🎨 Color de Camisa</Label>
                <div className="grid grid-cols-11 gap-2">
                  {Object.entries(clothingColors).map(([id, color]) => (
                    <motion.button key={id} onClick={() => updateConfig('shirtColor', color)} whileHover={{ scale: 1.2 }}
                      className={cn('w-7 h-7 rounded-lg border-3 transition-all',
                        config.shirtColor === color ? 'border-blue-500 ring-2 ring-blue-300 scale-110' : 'border-gray-200')}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Pants */}
          {activeCategory === 'pants' && (
            <motion.div key="pants" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 text-gray-800">👖 Estilo de Pantalón</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(pantsStyles).map(([id, style]) => (
                    <motion.button key={id} onClick={() => updateConfig('pantsStyle', id)} whileHover={{ scale: 1.05 }}
                      className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        config.pantsStyle === id ? 'border-indigo-500 bg-indigo-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                      <div className="w-12 h-14 flex items-center justify-center">
                        <PixelAvatar user={{ avatar_config: { ...config, pantsStyle: id } }} size="small" showLevel={false} animation="none" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{style.name}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 text-gray-800">🎨 Color de Pantalón</Label>
                <div className="grid grid-cols-11 gap-2">
                  {Object.entries(clothingColors).map(([id, color]) => (
                    <motion.button key={id} onClick={() => updateConfig('pantsColor', color)} whileHover={{ scale: 1.2 }}
                      className={cn('w-7 h-7 rounded-lg border-3 transition-all',
                        config.pantsColor === color ? 'border-indigo-500 ring-2 ring-indigo-300 scale-110' : 'border-gray-200')}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Shoes */}
          {activeCategory === 'shoes' && (
            <motion.div key="shoes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 text-gray-800">👟 Estilo de Zapatos</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(shoesStyles).map(([id, style]) => (
                    <motion.button key={id} onClick={() => updateConfig('shoesStyle', id)} whileHover={{ scale: 1.05 }}
                      className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        config.shoesStyle === id ? 'border-green-500 bg-green-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                      <div className="w-12 h-14 flex items-center justify-center">
                        <PixelAvatar user={{ avatar_config: { ...config, shoesStyle: id } }} size="small" showLevel={false} animation="none" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{style.name}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 text-gray-800">🎨 Color de Zapatos</Label>
                <div className="grid grid-cols-11 gap-2">
                  {Object.entries(clothingColors).map(([id, color]) => (
                    <motion.button key={id} onClick={() => updateConfig('shoesColor', color)} whileHover={{ scale: 1.2 }}
                      className={cn('w-7 h-7 rounded-lg border-3 transition-all',
                        config.shoesColor === color ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-gray-200')}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Accessories */}
          {activeCategory === 'accessories' && (
            <motion.div key="accessories" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {/* Hats */}
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 text-gray-800">🎩 Sombreros</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <motion.button onClick={() => updateConfig('hat', null)} whileHover={{ scale: 1.05 }}
                    className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      !config.hat ? 'border-rose-500 bg-rose-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                    <span className="text-2xl">❌</span>
                    <span className="text-xs font-medium text-gray-600">Ninguno</span>
                  </motion.button>
                  {Object.keys(accessories.hats).map(id => (
                    <motion.button key={id} onClick={() => updateConfig('hat', id)} whileHover={{ scale: 1.05 }}
                      className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        config.hat === id ? 'border-rose-500 bg-rose-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                      <div className="w-12 h-14 flex items-center justify-center">
                        <PixelAvatar user={{ avatar_config: { ...config, hat: id } }} size="small" showLevel={false} animation="none" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 capitalize">{id}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>

              {/* Glasses */}
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 text-gray-800">👓 Gafas</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  <motion.button onClick={() => updateConfig('glasses', null)} whileHover={{ scale: 1.05 }}
                    className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      !config.glasses ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                    <span className="text-2xl">❌</span>
                    <span className="text-xs font-medium text-gray-600">Ninguno</span>
                  </motion.button>
                  {Object.keys(accessories.glasses).map(id => (
                    <motion.button key={id} onClick={() => updateConfig('glasses', id)} whileHover={{ scale: 1.05 }}
                      className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        config.glasses === id ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                      <div className="w-12 h-14 flex items-center justify-center">
                        <PixelAvatar user={{ avatar_config: { ...config, glasses: id } }} size="small" showLevel={false} animation="none" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 capitalize">{id}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>

              {/* Scarves */}
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 text-gray-800">🧣 Bufandas</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <motion.button onClick={() => updateConfig('scarf', null)} whileHover={{ scale: 1.05 }}
                    className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      !config.scarf ? 'border-red-500 bg-red-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                    <span className="text-2xl">❌</span>
                    <span className="text-xs font-medium text-gray-600">Ninguno</span>
                  </motion.button>
                  {Object.keys(accessories.scarves).map(id => (
                    <motion.button key={id} onClick={() => updateConfig('scarf', id)} whileHover={{ scale: 1.05 }}
                      className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        config.scarf === id ? 'border-red-500 bg-red-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                      <div className="w-12 h-14 flex items-center justify-center">
                        <PixelAvatar user={{ avatar_config: { ...config, scarf: id } }} size="small" showLevel={false} animation="none" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 capitalize">{id}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>

              {/* Backpacks */}
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 text-gray-800">🎒 Mochilas y Alas</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <motion.button onClick={() => updateConfig('backpack', null)} whileHover={{ scale: 1.05 }}
                    className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      !config.backpack ? 'border-emerald-500 bg-emerald-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                    <span className="text-2xl">❌</span>
                    <span className="text-xs font-medium text-gray-600">Ninguno</span>
                  </motion.button>
                  {Object.keys(accessories.backpacks).map(id => (
                    <motion.button key={id} onClick={() => updateConfig('backpack', id)} whileHover={{ scale: 1.05 }}
                      className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        config.backpack === id ? 'border-emerald-500 bg-emerald-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                      <div className="w-12 h-14 flex items-center justify-center">
                        <PixelAvatar user={{ avatar_config: { ...config, backpack: id } }} size="small" showLevel={false} animation="none" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 capitalize">{id}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Effects & Pets */}
          {activeCategory === 'effects' && (
            <motion.div key="effects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800"><Heart className="w-5 h-5 text-pink-500" /> Mascotas</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <motion.button onClick={() => updateConfig('pet', null)} whileHover={{ scale: 1.05 }}
                    className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      !config.pet ? 'border-pink-500 bg-pink-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                    <span className="text-2xl">❌</span>
                    <span className="text-xs font-medium text-gray-600">Ninguna</span>
                  </motion.button>
                  {Object.entries(pets).map(([id, pet]) => (
                    <motion.button key={id} onClick={() => updateConfig('pet', id)} whileHover={{ scale: 1.05 }}
                      className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        config.pet === id ? 'border-pink-500 bg-pink-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                      <div className="w-14 h-16 flex items-center justify-center">
                        <PixelAvatar user={{ avatar_config: { ...config, pet: id } }} size="small" showLevel={false} animation="idle" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{pet.name}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-white border-2 border-violet-100 shadow-lg">
                <Label className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800"><Zap className="w-5 h-5 text-yellow-500" /> Efectos Visuales</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <motion.button onClick={() => updateConfig('effect', null)} whileHover={{ scale: 1.05 }}
                    className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      !config.effect ? 'border-yellow-500 bg-yellow-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                    <span className="text-2xl">❌</span>
                    <span className="text-xs font-medium text-gray-600">Ninguno</span>
                  </motion.button>
                  {Object.entries(visualEffects).map(([id, effect]) => (
                    <motion.button key={id} onClick={() => updateConfig('effect', id)} whileHover={{ scale: 1.05 }}
                      className={cn('p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        config.effect === id ? 'border-yellow-500 bg-yellow-50 shadow-lg' : 'border-gray-200 bg-gray-50')}>
                      <div className="w-14 h-16 flex items-center justify-center overflow-hidden">
                        <PixelAvatar user={{ avatar_config: { ...config, effect: id } }} size="small" showLevel={false} animation="idle" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{effect.name}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}