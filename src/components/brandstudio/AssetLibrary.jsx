import { db } from '@/api/base44Client';
import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const BRAND_IDENTITY = {
  colors: [
    { name: 'Violet Principal', hex: '#7c3aed' },
    { name: 'Fuchsia', hex: '#a21caf' },
    { name: 'Dorado Rewards', hex: '#f59e0b' },
    { name: 'Verde Éxito', hex: '#10b981' },
    { name: 'Rojo Alerta', hex: '#ef4444' },
    { name: 'Fondo Claro', hex: '#f3e8ff' },
    { name: 'Gris Texto', hex: '#374151' },
    { name: 'Blanco', hex: '#ffffff' },
  ],
  typography: [
    { name: 'Display / Títulos', spec: 'Bold · Inter / System UI · #374151' },
    { name: 'Gradiente Marca', spec: 'Bold · from-violet-600 to-fuchsia-600 · clip-text' },
    { name: 'Cuerpo', spec: 'Regular 400 · Inter · #6b7280' },
    { name: 'Labels / Badges', spec: 'Semibold 600 · 12-14px · uppercase tracking' },
  ],
  tagline: 'Analiza. Mejora. Conquista.',
  voiceTone: ['Motivador', 'Cercano', 'Gamificado'],
};

const CATEGORY_LABELS = {
  avatar: 'Avatares',
  color: 'Paleta de colores',
  typography: 'Tipografía',
  post_template: 'Plantillas de post',
  canva_prompt: 'Prompts Canva',
};

export default function AssetLibrary() {
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['brand-assets'],
    queryFn: () => db.entities.BrandAsset.list('-created_date'),
    staleTime: 30000,
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Prompt copiado');
  };

  const handleDelete = async (id) => {
    await db.entities.BrandAsset.delete(id);
    queryClient.invalidateQueries(['brand-assets']);
    toast.success('Asset eliminado');
  };

  const grouped = assets.reduce((acc, a) => {
    const cat = a.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {/* Saved Assets */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Assets guardados</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : assets.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-violet-200">
            <p className="text-gray-500">Aún no tienes assets guardados. Crea un avatar o un prompt y guárdalo.</p>
          </Card>
        ) : (
          Object.entries(grouped).map(([cat, catAssets]) => (
            <div key={cat} className="mb-6">
              <h3 className="text-sm font-semibold text-violet-700 uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[cat] || cat}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catAssets.map(asset => (
                  <Card key={asset.id} className="p-4 border-2 border-violet-100 hover:border-violet-300 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{asset.name}</p>
                        <Badge className="mt-1 bg-violet-100 text-violet-700 text-xs">{CATEGORY_LABELS[asset.category] || asset.category}</Badge>
                      </div>
                      <button onClick={() => handleDelete(asset.id)} className="text-gray-300 hover:text-red-400 transition-colors ml-2 flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {asset.preview_description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{asset.preview_description}</p>
                    )}
                    {asset.prompt_text && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 text-xs"
                        onClick={() => handleCopy(asset.prompt_text)}
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copiar prompt
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Brand Identity */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Identidad de marca</h2>
        <p className="text-sm text-gray-500 mb-5">Referencia oficial · Solo lectura</p>

        {/* Colors */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Colores oficiales</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {BRAND_IDENTITY.colors.map(c => (
              <button
                key={c.hex}
                onClick={() => { navigator.clipboard.writeText(c.hex); toast.success(`${c.hex} copiado`); }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className="w-12 h-12 rounded-xl shadow-sm border border-gray-200 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] text-gray-500 font-mono text-center leading-tight">{c.hex}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Tipografía</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {BRAND_IDENTITY.typography.map(t => (
              <Card key={t.name} className="p-3 border-violet-100">
                <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.spec}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Tagline & Tone */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-200">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-1">Tagline oficial</p>
            <p className="text-lg font-bold text-violet-800">{BRAND_IDENTITY.tagline}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-200">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2">Tono de voz</p>
            <div className="flex gap-2">
              {BRAND_IDENTITY.voiceTone.map(v => (
                <Badge key={v} className="bg-violet-100 text-violet-700">{v}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}