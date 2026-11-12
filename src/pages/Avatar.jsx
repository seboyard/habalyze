import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import NeoPixelAvatar, { neoManifest, resolveAvatarConfig } from '@/components/avatar/NeoPixelAvatar';

const GROUPS = [
  { id: 'preset', label: 'Personajes' },
  { id: 'expression', label: 'Expresión' },
  { id: 'hair', label: 'Pelo' },
  { id: 'horns', label: 'Cuernos' },
  { id: 'headwear', label: 'Sombrero' },
  { id: 'upper', label: 'Arriba' },
  { id: 'lower', label: 'Abajo' },
  { id: 'shoes', label: 'Pies' },
  { id: 'backpack', label: 'Espalda' },
  { id: 'hand', label: 'Mano' },
  { id: 'pet', label: 'Mascota' },
  { id: 'aura', label: 'Aura' },
  { id: 'scene', label: 'Escenario' },
  { id: 'body', label: 'Cuerpo' },
];

const SLOT_OF = {
  hair: 'hair_front',
  horns: 'horns_antennae',
  headwear: 'headwear',
  upper: 'upper_clothing',
  lower: 'lower_clothing',
  shoes: 'shoes',
  backpack: 'backpack_back',
  hand: 'hand_prop',
  pet: 'companion_front',
  aura: 'aura_back',
};

export default function AvatarPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [group, setGroup] = useState('preset');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.auth.me().then((current) => {
      if (!current) {
        navigate('/login?next=/avatar');
        return;
      }
      setUser(current);
      setConfig(resolveAvatarConfig(current.avatar_config || { preset: 'lumo' }));
    });
  }, [navigate]);

  const options = useMemo(() => {
    if (group === 'preset') return Object.values(neoManifest.presets);
    if (group === 'expression') return neoManifest.expressions;
    if (group === 'scene') return neoManifest.scenes;
    if (group === 'body') return neoManifest.bodies;
    if (group === 'aura') return neoManifest.auras;
    const slot = SLOT_OF[group];
    return neoManifest.items.filter((item) => item.slot === slot);
  }, [group]);

  const choose = (option) => {
    if (group === 'preset') {
      setConfig(resolveAvatarConfig({ preset: option.id, engine: 'neo' }));
      return;
    }
    if (group === 'body') {
      setConfig((current) => ({ ...current, body: option.id, rig: option.rig, preset: null }));
      return;
    }
    if (group === 'scene') {
      setConfig((current) => ({ ...current, scene: option.id, preset: null }));
      return;
    }
    const key = group === 'expression' ? 'expression' : group;
    setConfig((current) => ({
      ...current,
      preset: null,
      [key]: current[key] === option.id ? null : option.id,
    }));
  };

  const selectedId = () => {
    if (!config) return null;
    if (group === 'preset') return config.preset;
    if (group === 'scene') return config.scene;
    if (group === 'body') return config.body;
    if (group === 'expression') return config.expression;
    return config[group];
  };

  const save = async () => {
    setSaving(true);
    try {
      await db.auth.updateMe({ avatar_config: { ...config, engine: 'neo' } });
      toast.success('Avatar guardado');
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar');
      setSaving(false);
    }
  };

  if (!config) {
    return <div className="page-loading">Preparando el vestidor…</div>;
  }

  const previewUser = { ...user, avatar_config: config };

  return (
    <div className="dresser">
      <header className="dresser-head">
        <div>
          <p className="pixel-label">Neo Pixel Cozy</p>
          <h1>Viste a tu avatar</h1>
          <p>Elige una pieza y mírala al momento. Guardar la deja en tu perfil.</p>
        </div>
        <div className="dresser-actions">
          <Button variant="outline" onClick={() => navigate(createPageUrl('Shop'))}>Ir a la tienda</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </div>
      </header>

      <div className="dresser-layout">
        <aside className="dresser-stage">
          <NeoPixelAvatar user={previewUser} size={220} framed showLevel={false} animation="idle" />
          <p className="dresser-note">
            {neoManifest.presets[config.preset]?.note
              || 'Las capas usan anclas del rig. Si una pieza no encaja, no está en este set.'}
          </p>
        </aside>

        <section className="dresser-board">
          <div className="dresser-tabs" role="tablist">
            {GROUPS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={group === item.id}
                className={group === item.id ? 'is-on' : ''}
                onClick={() => setGroup(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="dresser-grid">
            {group !== 'preset' && group !== 'body' && group !== 'scene' && group !== 'expression' && (
              <button type="button" className={!selectedId() ? 'is-on' : ''} onClick={() => setConfig((current) => ({ ...current, [group]: null, preset: null }))}>
                <span className="swatch swatch-empty">Sin</span>
                <span>Quitar</span>
              </button>
            )}
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={selectedId() === option.id ? 'is-on' : ''}
                onClick={() => choose(option)}
              >
                {option.src && group !== 'preset' ? (
                  <img src={option.src} alt="" className={group === 'scene' ? 'swatch-scene' : 'swatch'} />
                ) : (
                  <span className="swatch swatch-empty">{option.name.slice(0, 1)}</span>
                )}
                <span>{option.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
