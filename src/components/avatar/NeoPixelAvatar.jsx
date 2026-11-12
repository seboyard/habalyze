import React, { useMemo } from 'react';
import manifest from '@/avatar/neoPixelManifest.json';

const WIDTHS = { tiny: 36, small: 64, medium: 96, large: 160, xlarge: 240 };

const itemIndex = new Map();
[...manifest.items, ...manifest.auras, ...manifest.expressions].forEach((item) => {
  itemIndex.set(item.id, item);
});
const bodyIndex = new Map(manifest.bodies.map((body) => [body.id, body]));

export function resolveAvatarConfig(config = {}) {
  const preset = manifest.presets[config.preset] || manifest.presets.lumo;
  const base = {
    engine: 'neo',
    preset: preset.id,
    rig: preset.rig,
    body: preset.body,
    expression: preset.expression,
    hair: preset.hair || null,
    horns: preset.horns || null,
    headwear: preset.headwear || null,
    upper: preset.upper || null,
    lower: preset.lower || null,
    shoes: preset.shoes || null,
    backpack: preset.backpack || null,
    hand: preset.hand || null,
    pet: preset.pet || null,
    aura: preset.aura || null,
    scene: preset.scene,
  };
  const merged = { ...base, ...config, engine: config.engine || 'neo' };
  if (!merged.rig || !manifest.rigs[merged.rig]) merged.rig = base.rig;
  if (!bodyIndex.has(merged.body)) merged.body = base.body;
  if (merged.expression === 'happy') merged.expression = 'alegre';
  if (merged.expression === 'sad' || merged.expression === 'tired') merged.expression = 'cansada';
  if (!manifest.expressions.some((item) => item.id === merged.expression)) merged.expression = 'alegre';
  return merged;
}

function place(item, anchors) {
  if (item.fullCanvas) return { left: 0, top: 0, width: 96, height: 128 };
  const point = anchors[item.anchor] || anchors.torso || [48, 64];
  const left = point[0] - item.w / 2;
  const top = item.origin === 'bottom'
    ? point[1] - item.h
    : item.origin === 'top'
      ? point[1]
      : point[1] - item.h / 2;
  return { left, top, width: item.w, height: item.h };
}

export const neoManifest = manifest;

export default function NeoPixelAvatar({
  user,
  size = 'large',
  showLevel = true,
  showCoins = false,
  animation = 'idle',
  framed = false,
  sceneId,
}) {
  const config = useMemo(() => resolveAvatarConfig(user?.avatar_config || {}), [user]);
  const rig = manifest.rigs[config.rig] || manifest.rigs.humanoid_standard;
  const width = typeof size === 'number' ? size : (WIDTHS[size] || WIDTHS.large);
  const height = Math.round(width * (128 / 96));
  const scene = manifest.scenes.find((item) => item.id === (sceneId || (framed ? config.scene : null)));

  const layers = [];
  if (config.aura && itemIndex.get(config.aura)) layers.push(itemIndex.get(config.aura));
  if (config.backpack && itemIndex.get(config.backpack)) layers.push(itemIndex.get(config.backpack));
  const body = bodyIndex.get(config.body);
  if (body) layers.push({ ...body, fullCanvas: true, z: -10 });
  if (config.rig === 'humanoid_seated' && manifest.mobility) layers.push(manifest.mobility);
  ['lower', 'shoes', 'upper', 'expression', 'horns', 'hair', 'headwear', 'glasses', 'hand', 'pet'].forEach((key) => {
    const id = key === 'expression' ? config.expression : config[key];
    const item = id && itemIndex.get(id);
    if (item) layers.push(item);
  });
  layers.sort((a, b) => (a.z || 0) - (b.z || 0));

  const motion = animation === 'none' ? '' : `npc-${animation === 'jump' ? 'jump' : animation === 'bounce' ? 'jump' : 'idle'}`;

  return (
    <div className="npc-wrap" style={{ width: framed ? Math.max(width + 28, 180) : width }}>
      <div
        className={`npc-stage ${framed ? 'npc-framed' : ''} ${motion}`}
        style={{ width, height, margin: '0 auto' }}
      >
        {scene && <img src={scene.srcSmall || scene.src} alt="" className="npc-scene" />}
        <div className="npc-canvas" style={{ width: 96, height: 128, transform: `scale(${width / 96})` }}>
          {layers.map((layer) => {
            const box = place(layer, rig.anchors);
            return (
              <img
                key={`${layer.id || layer.src}-${layer.z}`}
                src={layer.src}
                alt=""
                draggable={false}
                style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
              />
            );
          })}
        </div>
      </div>
      {(showLevel || showCoins) && (
        <div className="npc-meta">
          {showLevel && <span>Nv {user?.level || 1}</span>}
          {showCoins && <span>{user?.coins || 0} monedas</span>}
        </div>
      )}
    </div>
  );
}
