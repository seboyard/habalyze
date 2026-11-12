import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

const FORMATS = [
  { id: 'story', label: '📱 Story', dims: '1080×1920px', ratio: '9:16' },
  { id: 'square_post', label: '⬛ Post cuadrado', dims: '1080×1080px', ratio: '1:1' },
  { id: 'banner', label: '🏷️ Banner', dims: '1200×628px', ratio: '1.91:1' },
  { id: 'portrait_post', label: '📷 Post retrato', dims: '1080×1350px', ratio: '4:5' },
];

const CONTENT_TYPES = [
  { id: 'streak_card', label: '🔥 Streak Card' },
  { id: 'badge', label: '🏅 Badge' },
  { id: 'weekly_stat', label: '📊 Stat Semanal' },
  { id: 'goal_achieved', label: '🎯 Meta Alcanzada' },
  { id: 'challenge', label: '⚡ Desafío' },
  { id: 'launch', label: '🚀 Lanzamiento' },
  { id: 'motivational', label: '💜 Motivacional' },
];

function generatePrompt({ format, contentType, mainText, subtitle, habitName, avatarDesc }) {
  const fmt = FORMATS.find(f => f.id === format);
  const ct = CONTENT_TYPES.find(c => c.id === contentType);
  const fmtName = fmt?.label.replace(/^.+?\s/, '') || format;
  const ctName = ct?.label.replace(/^.+?\s/, '') || contentType;

  const avatarSection = avatarDesc
    ? `\n\nAVATAR: Include the Habalyze mascot — ${avatarDesc}. Place it at the bottom-right corner, 30% of canvas size, no background.`
    : '';

  const contentGuide = {
    streak_card: `Large bold number "${mainText}" centered, subtitle "${subtitle}" below in medium weight. Flame emoji or streak icon accent. Warm orange-to-violet gradient on the number. Progress arc or streak flames as decorative element.`,
    badge: `Hexagonal or circular badge shape centered. Inside: icon relevant to "${habitName}", large text "${mainText}", subtitle "${subtitle}". Gold/violet color scheme. Badge glow effect. Celebratory, premium feel.`,
    weekly_stat: `Data visualization style. Main stat "${mainText}" in large bold display font. Subtitle "${subtitle}". Small bar chart or progress ring decoration. Clean, minimal, professional. "${habitName}" as section label.`,
    goal_achieved: `Triumphant, celebratory layout. Confetti or sparkle particles. Large "🎯" or trophy icon. Main text "${mainText}" in gradient violet-fuchsia. Subtitle "${subtitle}". Habit/goal name "${habitName}" in badge below.`,
    challenge: `Bold, energetic layout. Lightning bolt or vs. element. "${mainText}" as challenge title. "${subtitle}" as CTA or description. Dark violet background with bright accent. Action-oriented typography.`,
    launch: `Product launch aesthetic. Large announcement typography. "${mainText}" as headline. "${subtitle}" as tagline. Brand gradient background violet→fuchsia. Clean and modern, excitement vibe.`,
    motivational: `Inspirational quote layout. "${mainText}" as main quote in large elegant font. "${subtitle}" as attribution or CTA. Soft violet gradient background. Minimalist, emotional, shareable.`,
  }[contentType] || `Main text: "${mainText}". Subtitle: "${subtitle}". Habit/context: "${habitName}".`;

  return `CANVA AI / DESIGN BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: ${fmtName} (${fmt?.dims || ''} · ${fmt?.ratio || ''})
CONTENT TYPE: ${ctName}
BRAND: Habalyze — habit tracking app

BRAND COLORS:
• Primary Violet: #7c3aed
• Fuchsia Accent: #a21caf  
• Gold Rewards: #f59e0b
• Success Green: #10b981
• Background Light: #f3e8ff
• White: #ffffff

TYPOGRAPHY:
• Display: Bold, Inter/SF Pro, large scale
• Body: Regular 400, 14-16px, #6b7280
• Accent: Semibold gradient violet-to-fuchsia on key stats

LAYOUT & CONTENT:
${contentGuide}

STYLE RULES:
• Flat modern design with subtle depth
• Rounded corners (16-24px radius on cards)
• Violet (#7c3aed) as dominant brand color
• White space is intentional — don't overcrowd
• Typography hierarchy: 1 display stat + 1 subtitle + 1 label
• Use subtle shadow: 0 8px 32px rgba(124, 58, 237, 0.15)${avatarSection}

TAGLINE (optional footer): "Analiza. Mejora. Conquista." — #7c3aed, 12px, centered`;
}

export default function CanvaPromptGenerator() {
  const queryClient = useQueryClient();
  const [format, setFormat] = useState('story');
  const [contentType, setContentType] = useState('streak_card');
  const [mainText, setMainText] = useState('21');
  const [subtitle, setSubtitle] = useState('días de racha');
  const [habitName, setHabitName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('none');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: avatarAssets = [] } = useQuery({
    queryKey: ['brand-assets-avatars'],
    queryFn: () => db.entities.BrandAsset.filter({ category: 'avatar' }),
    staleTime: 30000,
  });

  const handleGenerate = () => {
    const avatar = avatarAssets.find(a => a.id === selectedAvatarId);
    const avatarDesc = avatar?.preview_description || '';
    const prompt = generatePrompt({ format, contentType, mainText, subtitle, habitName, avatarDesc: selectedAvatarId !== 'none' ? avatarDesc : '' });
    setGeneratedPrompt(prompt);
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    toast.success('Prompt copiado al portapapeles');
  };

  const handleSave = async () => {
    if (!templateName.trim()) { toast.error('Escribe un nombre para la plantilla'); return; }
    if (!generatedPrompt) { toast.error('Genera el prompt primero'); return; }
    setSaving(true);
    await db.entities.BrandAsset.create({
      name: templateName.trim(),
      category: 'canva_prompt',
      config: { format, contentType, mainText, subtitle, habitName, selectedAvatarId },
      preview_description: `${FORMATS.find(f=>f.id===format)?.label} · ${CONTENT_TYPES.find(c=>c.id===contentType)?.label}`,
      prompt_text: generatedPrompt,
    });
    queryClient.invalidateQueries(['brand-assets']);
    toast.success('Plantilla guardada en la biblioteca');
    setTemplateName('');
    setSaving(false);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Controls */}
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Formato</p>
          <div className="grid grid-cols-2 gap-2">
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`p-3 rounded-xl text-left border-2 transition-all ${
                  format === f.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'
                }`}
              >
                <p className={`text-sm font-medium ${format === f.id ? 'text-violet-700' : 'text-gray-700'}`}>{f.label}</p>
                <p className="text-xs text-gray-400">{f.dims}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Tipo de contenido</p>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map(c => (
              <button
                key={c.id}
                onClick={() => setContentType(c.id)}
                className={`px-3 py-1.5 rounded-xl text-sm border-2 transition-all ${
                  contentType === c.id
                    ? 'border-violet-500 bg-violet-50 text-violet-700 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-violet-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Texto principal</p>
            <Input value={mainText} onChange={e => setMainText(e.target.value)} placeholder="ej: 21" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Subtítulo</p>
            <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="ej: días de racha" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Nombre del hábito / meta</p>
          <Input value={habitName} onChange={e => setHabitName(e.target.value)} placeholder="ej: Ejercicio diario" />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">¿Incluir avatar?</p>
          <select
            value={selectedAvatarId}
            onChange={e => setSelectedAvatarId(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
          >
            <option value="none">Sin avatar</option>
            {avatarAssets.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          {avatarAssets.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">Crea y guarda avatares en la pestaña "Generador de Avatar" para usarlos aquí.</p>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg"
          size="lg"
        >
          <Wand2 className="w-5 h-5 mr-2" />
          Generar prompt
        </Button>
      </div>

      {/* Output */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Prompt generado</h3>

        {generatedPrompt ? (
          <>
            <Textarea
              value={generatedPrompt}
              readOnly
              className="min-h-[320px] text-xs font-mono border-2 border-violet-200 bg-violet-50/50 resize-none"
            />
            <Button onClick={handleCopy} className="w-full bg-violet-600 hover:bg-violet-700">
              <Copy className="w-4 h-4 mr-2" /> Copiar prompt
            </Button>
            <div className="flex gap-2">
              <Input
                placeholder="Nombre de la plantilla para guardar..."
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSave} disabled={saving} className="border-violet-300 text-violet-700 hover:bg-violet-50">
                <Save className="w-4 h-4 mr-1" />
                {saving ? '...' : 'Guardar'}
              </Button>
            </div>
          </>
        ) : (
          <Card className="min-h-[320px] flex items-center justify-center border-dashed border-2 border-violet-200">
            <div className="text-center">
              <Wand2 className="w-12 h-12 text-violet-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Configura las opciones y haz click<br />en "Generar prompt"</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}