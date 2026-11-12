import React, { useMemo } from 'react';
import manifest from '@/avatar/neoPixelManifest.json';

const WIDTHS = { tiny: 36, small: 64, medium: 96, large: 160, xlarge: 240 };

const itemIndex = new Map();
[...manifest.items, ...manifest.auras, ...manifest.expressions].forEach((item) => {
  itemIndex.set(item.id, item);
});
const bodyIndex = new Map(manifest.bodies.map((body) => [body.id, body]));

export function assetSrc(item, rigId) {
  if (!item) return null;
  if (item.srcByRig) return item.srcByRig[rigId] || null;
  return item.src || null;
}

export function fitsRig(item, rigId) {
  if (!item) return false;
  if (item.rigs && rigId && !item.rigs.includes(rigId)) return false;
  return Boolean(assetSrc(item, rigId));
}

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
    glasses: preset.glasses || null,
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
  const expression = manifest.expressions.find((item) => item.id === merged.expression);
  if (!expression || (expression.rigs && !expression.rigs.includes(merged.rig))) merged.expression = 'alegre';
  return merged;
}

function place(item) {
  if (item.fullCanvas) return { left: 0, top: 0, width: 96, height: 128 };
  const point = item.point || [48, 116];
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
  const push = (item, extra = {}) => {
    if (!item || !fitsRig(item, config.rig)) return;
    const src = assetSrc(item, config.rig);
    if (!src) return;
    const point = item.anchor ? (rig.anchors[item.anchor] || rig.anchors.companion) : null;
    layers.push({ ...item, ...extra, src, point });
  };

  const shadow = manifest.shadows?.[config.rig];
  if (shadow) layers.push({ ...shadow, id: `shadow-${config.rig}`, src: shadow.src, fullCanvas: true, z: -35 });
  push(itemIndex.get(config.aura));
  push(itemIndex.get(config.backpack));
  const body = bodyIndex.get(config.body);
  if (body) layers.push({ ...body, fullCanvas: true, z: body.z ?? -10 });
  if (config.rig === 'humanoid_seated' && manifest.mobility) {
    layers.push({ ...manifest.mobility, fullCanvas: true });
  }
  ['lower', 'shoes', 'upper', 'expression', 'horns', 'hair', 'headwear', 'glasses', 'hand', 'pet'].forEach((key) => {
    const id = key === 'expression' ? config.expression : config[key];
    push(itemIndex.get(id));
  });
  layers.sort((a, b) => (a.z || 0) - (b.z || 0));

  const motion = animation === 'none' ? '' : `npc-${animation === 'jump' || animation === 'bounce' ? 'jump' : 'idle'}`;

  return (
    <div className="npc-wrap" style={{ width: framed ? Math.max(width + 28, 180) : width }}>
      <div
        className={`npc-stage ${framed ? 'npc-framed' : ''} ${motion}`}
        style={{ width, height, margin: '0 auto' }}
      >
        {scene && <img src={scene.srcSmall || scene.src} alt="" className="npc-scene" />}
        <div className="npc-canvas" style={{ width: 96, height: 128, transform: `scale(${width / 96})` }}>
          {layers.map((layer) => {
            const box = place(layer);
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
