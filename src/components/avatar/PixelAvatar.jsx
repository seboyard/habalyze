import React, { memo } from 'react';
import NeoPixelAvatar from './NeoPixelAvatar';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// ============ HELPER FUNCTION ============
function adjustColor(hex, amount) {
  if (!hex || hex.startsWith('url')) return hex;
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// ============ SKIN COLORS (20 tonos) ============
const skinTones = {
  pale: { base: '#FFECD1', shadow: '#E8D4B8', highlight: '#FFF8F0', blush: '#FFCDD2' },
  light: { base: '#FED6A8', shadow: '#E6BD8F', highlight: '#FFEAD4', blush: '#FFB3BA' },
  fair: { base: '#F5C69A', shadow: '#D9A87A', highlight: '#FFE0C0', blush: '#FFA5AD' },
  medium: { base: '#D4A574', shadow: '#B8895B', highlight: '#E8BF96', blush: '#FF9AA2' },
  olive: { base: '#C9A86C', shadow: '#A88B4A', highlight: '#DFC090', blush: '#F09090' },
  tan: { base: '#B88A5B', shadow: '#9E7142', highlight: '#D2A477', blush: '#E88888' },
  caramel: { base: '#A67B5B', shadow: '#8B6242', highlight: '#C49575', blush: '#E07878' },
  brown: { base: '#8B6342', shadow: '#6D4A29', highlight: '#A57D5D', blush: '#D86868' },
  dark: { base: '#6D4A29', shadow: '#4E3218', highlight: '#8B6342', blush: '#C85858' },
  deep: { base: '#5D4037', shadow: '#3E2723', highlight: '#795548', blush: '#B84848' },
  alien: { base: '#7FE87F', shadow: '#5DC95D', highlight: '#A8FFA8', blush: '#69F0AE' },
  zombie: { base: '#9DC183', shadow: '#7FA365', highlight: '#BFDF9F', blush: '#8BC34A' },
  vampire: { base: '#E8E8E8', shadow: '#BDBDBD', highlight: '#FFFFFF', blush: '#EF9A9A' },
  robot: { base: '#90A4AE', shadow: '#607D8B', highlight: '#CFD8DC', blush: '#64B5F6' },
  demon: { base: '#E57373', shadow: '#C62828', highlight: '#FFCDD2', blush: '#FF5252' },
  avatar: { base: '#64B5F6', shadow: '#1976D2', highlight: '#BBDEFB', blush: '#42A5F5' },
  mystic: { base: '#BA68C8', shadow: '#7B1FA2', highlight: '#E1BEE7', blush: '#AB47BC' },
  fairy: { base: '#F8BBD9', shadow: '#F06292', highlight: '#FCE4EC', blush: '#EC407A' },
  gold: { base: '#FFD54F', shadow: '#FF8F00', highlight: '#FFECB3', blush: '#FFC107' },
  silver: { base: '#CFD8DC', shadow: '#78909C', highlight: '#ECEFF1', blush: '#B0BEC5' },
};

// ============ FACE EXPRESSIONS (16 expresiones) ============
const faceExpressions = {
  happy: {
    name: '😊 Feliz',
    eyes: (x, y) => (
      <g>
        <rect x={x-4} y={y} width="3" height="4" fill="#1a1a2e" />
        <rect x={x-4} y={y} width="1" height="1" fill="white" />
        <rect x={x+12} y={y} width="3" height="4" fill="#1a1a2e" />
        <rect x={x+12} y={y} width="1" height="1" fill="white" />
      </g>
    ),
    mouth: (x, y) => (
      <g>
        <rect x={x+2} y={y+12} width="2" height="1" fill="#e74c3c" />
        <rect x={x+4} y={y+13} width="4" height="1" fill="#e74c3c" />
        <rect x={x+8} y={y+12} width="2" height="1" fill="#e74c3c" />
      </g>
    )
  },
  cool: {
    name: '😎 Cool',
    eyes: (x, y) => (
      <g>
        <rect x={x-6} y={y-1} width="8" height="5" fill="#1a1a2e" rx="1" />
        <rect x={x+9} y={y-1} width="8" height="5" fill="#1a1a2e" rx="1" />
        <rect x={x+2} y={y} width="7" height="2" fill="#1a1a2e" />
        <rect x={x-5} y={y} width="2" height="2" fill="#4a69bd" />
        <rect x={x+14} y={y} width="2" height="2" fill="#4a69bd" />
      </g>
    ),
    mouth: (x, y) => <rect x={x+3} y={y+12} width="6" height="1" fill="#e74c3c" />
  },
  wink: {
    name: '😉 Guiño',
    eyes: (x, y) => (
      <g>
        <rect x={x-4} y={y} width="3" height="4" fill="#1a1a2e" />
        <rect x={x-4} y={y} width="1" height="1" fill="white" />
        <rect x={x+11} y={y+2} width="5" height="1" fill="#1a1a2e" />
      </g>
    ),
    mouth: (x, y) => (
      <g>
        <rect x={x+2} y={y+12} width="2" height="1" fill="#e74c3c" />
        <rect x={x+4} y={y+13} width="4" height="1" fill="#e74c3c" />
        <rect x={x+8} y={y+12} width="2" height="1" fill="#e74c3c" />
      </g>
    )
  },
  love: {
    name: '😍 Amor',
    eyes: (x, y) => (
      <g>
        <path d={`M${x-3} ${y+1} l1-1 l1 0 l1 1 l0 1 l-1 1 l-1 1 l-1-1 l-1-1 l0-1 z`} fill="#e91e63" />
        <path d={`M${x+12} ${y+1} l1-1 l1 0 l1 1 l0 1 l-1 1 l-1 1 l-1-1 l-1-1 l0-1 z`} fill="#e91e63" />
      </g>
    ),
    mouth: (x, y) => (
      <g>
        <rect x={x+2} y={y+12} width="2" height="1" fill="#e74c3c" />
        <rect x={x+4} y={y+13} width="4" height="2" fill="#e74c3c" />
        <rect x={x+8} y={y+12} width="2" height="1" fill="#e74c3c" />
      </g>
    )
  },
  surprised: {
    name: '😲 Sorpresa',
    eyes: (x, y) => (
      <g>
        <ellipse cx={x-2} cy={y+2} rx="4" ry="4" fill="white" stroke="#1a1a2e" strokeWidth="1" />
        <circle cx={x-2} cy={y+2} r="2" fill="#1a1a2e" />
        <ellipse cx={x+13} cy={y+2} rx="4" ry="4" fill="white" stroke="#1a1a2e" strokeWidth="1" />
        <circle cx={x+13} cy={y+2} r="2" fill="#1a1a2e" />
      </g>
    ),
    mouth: (x, y) => <ellipse cx={x+6} cy={y+14} rx="3" ry="3" fill="#e74c3c" />
  },
  angry: {
    name: '😠 Enojado',
    eyes: (x, y) => (
      <g>
        <rect x={x-4} y={y+1} width="3" height="3" fill="#1a1a2e" />
        <rect x={x-5} y={y-1} width="5" height="1" fill="#4a3728" />
        <rect x={x+12} y={y+1} width="3" height="3" fill="#1a1a2e" />
        <rect x={x+11} y={y-1} width="5" height="1" fill="#4a3728" />
      </g>
    ),
    mouth: (x, y) => (
      <g>
        <rect x={x+2} y={y+14} width="2" height="1" fill="#c0392b" />
        <rect x={x+4} y={y+13} width="4" height="1" fill="#c0392b" />
        <rect x={x+8} y={y+14} width="2" height="1" fill="#c0392b" />
      </g>
    )
  },
  sad: {
    name: '😢 Triste',
    eyes: (x, y) => (
      <g>
        <rect x={x-4} y={y+1} width="3" height="3" fill="#1a1a2e" />
        <rect x={x-3} y={y+4} width="1" height="3" fill="#64b5f6" />
        <rect x={x+12} y={y+1} width="3" height="3" fill="#1a1a2e" />
        <rect x={x+14} y={y+4} width="1" height="3" fill="#64b5f6" />
      </g>
    ),
    mouth: (x, y) => (
      <g>
        <rect x={x+2} y={y+14} width="2" height="1" fill="#e74c3c" />
        <rect x={x+4} y={y+13} width="4" height="1" fill="#e74c3c" />
        <rect x={x+8} y={y+14} width="2" height="1" fill="#e74c3c" />
      </g>
    )
  },
  sleepy: {
    name: '😴 Dormido',
    eyes: (x, y) => (
      <g>
        <rect x={x-5} y={y+2} width="5" height="1" fill="#1a1a2e" />
        <rect x={x+11} y={y+2} width="5" height="1" fill="#1a1a2e" />
      </g>
    ),
    mouth: (x, y) => <ellipse cx={x+6} cy={y+14} rx="2" ry="2" fill="#e74c3c" />
  },
  laugh: {
    name: '😂 Risa',
    eyes: (x, y) => (
      <g>
        <rect x={x-5} y={y+2} width="5" height="1" fill="#1a1a2e" />
        <rect x={x-4} y={y+1} width="1" height="1" fill="#1a1a2e" />
        <rect x={x-1} y={y+1} width="1" height="1" fill="#1a1a2e" />
        <rect x={x+11} y={y+2} width="5" height="1" fill="#1a1a2e" />
        <rect x={x+11} y={y+1} width="1" height="1" fill="#1a1a2e" />
        <rect x={x+15} y={y+1} width="1" height="1" fill="#1a1a2e" />
        <rect x={x-6} y={y+3} width="1" height="2" fill="#64b5f6" />
        <rect x={x+16} y={y+3} width="1" height="2" fill="#64b5f6" />
      </g>
    ),
    mouth: (x, y) => (
      <g>
        <rect x={x+1} y={y+12} width="2" height="1" fill="#e74c3c" />
        <rect x={x+3} y={y+13} width="6" height="2" fill="#e74c3c" />
        <rect x={x+9} y={y+12} width="2" height="1" fill="#e74c3c" />
      </g>
    )
  },
  kawaii: {
    name: '🥰 Kawaii',
    eyes: (x, y) => (
      <g>
        <ellipse cx={x-2} cy={y+2} rx="4" ry="4" fill="#1a1a2e" />
        <rect x={x-4} y={y} width="2" height="2" fill="white" />
        <ellipse cx={x+13} cy={y+2} rx="4" ry="4" fill="#1a1a2e" />
        <rect x={x+11} y={y} width="2" height="2" fill="white" />
      </g>
    ),
    mouth: (x, y) => (
      <g>
        <rect x={x+4} y={y+12} width="1" height="1" fill="#e74c3c" />
        <rect x={x+5} y={y+13} width="2" height="1" fill="#e74c3c" />
        <rect x={x+7} y={y+12} width="1" height="1" fill="#e74c3c" />
      </g>
    )
  },
  smirk: {
    name: '😏 Pícaro',
    eyes: (x, y) => (
      <g>
        <rect x={x-4} y={y} width="3" height="4" fill="#1a1a2e" />
        <rect x={x-4} y={y} width="1" height="1" fill="white" />
        <rect x={x+12} y={y+1} width="3" height="3" fill="#1a1a2e" />
        <rect x={x+10} y={y-2} width="6" height="1" fill="#4a3728" />
      </g>
    ),
    mouth: (x, y) => (
      <g>
        <rect x={x+4} y={y+12} width="5" height="1" fill="#e74c3c" />
        <rect x={x+8} y={y+11} width="2" height="1" fill="#e74c3c" />
      </g>
    )
  },
  dead: {
    name: '💀 K.O.',
    eyes: (x, y) => (
      <g>
        <rect x={x-4} y={y} width="1" height="1" fill="#1a1a2e" />
        <rect x={x-2} y={y+2} width="1" height="1" fill="#1a1a2e" />
        <rect x={x-4} y={y+4} width="1" height="1" fill="#1a1a2e" />
        <rect x={x} y={y} width="1" height="1" fill="#1a1a2e" />
        <rect x={x} y={y+4} width="1" height="1" fill="#1a1a2e" />
        <rect x={x+11} y={y} width="1" height="1" fill="#1a1a2e" />
        <rect x={x+13} y={y+2} width="1" height="1" fill="#1a1a2e" />
        <rect x={x+11} y={y+4} width="1" height="1" fill="#1a1a2e" />
        <rect x={x+15} y={y} width="1" height="1" fill="#1a1a2e" />
        <rect x={x+15} y={y+4} width="1" height="1" fill="#1a1a2e" />
      </g>
    ),
    mouth: (x, y) => <rect x={x+2} y={y+13} width="8" height="1" fill="#666" />
  },
  blush: {
    name: '☺️ Sonrojo',
    eyes: (x, y) => (
      <g>
        <rect x={x-4} y={y} width="3" height="4" fill="#1a1a2e" />
        <rect x={x-4} y={y} width="1" height="1" fill="white" />
        <rect x={x+12} y={y} width="3" height="4" fill="#1a1a2e" />
        <rect x={x+12} y={y} width="1" height="1" fill="white" />
        <ellipse cx={x-6} cy={y+6} rx="3" ry="2" fill="#ffab91" opacity="0.7" />
        <ellipse cx={x+17} cy={y+6} rx="3" ry="2" fill="#ffab91" opacity="0.7" />
      </g>
    ),
    mouth: (x, y) => (
      <g>
        <rect x={x+3} y={y+12} width="6" height="1" fill="#e74c3c" />
      </g>
    )
  },
  dizzy: {
    name: '😵 Mareado',
    eyes: (x, y) => (
      <g>
        <circle cx={x-2} cy={y+2} r="4" fill="none" stroke="#1a1a2e" strokeWidth="1" />
        <circle cx={x-2} cy={y+2} r="2" fill="none" stroke="#1a1a2e" strokeWidth="1" />
        <circle cx={x+13} cy={y+2} r="4" fill="none" stroke="#1a1a2e" strokeWidth="1" />
        <circle cx={x+13} cy={y+2} r="2" fill="none" stroke="#1a1a2e" strokeWidth="1" />
      </g>
    ),
    mouth: (x, y) => <path d={`M${x+2} ${y+13} Q${x+6} ${y+16} ${x+10} ${y+13}`} stroke="#e74c3c" strokeWidth="1" fill="none" />
  },
  star: {
    name: '🤩 Estrella',
    eyes: (x, y) => (
      <g>
        <polygon points={`${x-2},${y-2} ${x-1},${y+1} ${x+2},${y+1} ${x},${y+3} ${x+1},${y+6} ${x-2},${y+4} ${x-5},${y+6} ${x-4},${y+3} ${x-6},${y+1} ${x-3},${y+1}`} fill="#ffc107" />
        <polygon points={`${x+13},${y-2} ${x+14},${y+1} ${x+17},${y+1} ${x+15},${y+3} ${x+16},${y+6} ${x+13},${y+4} ${x+10},${y+6} ${x+11},${y+3} ${x+9},${y+1} ${x+12},${y+1}`} fill="#ffc107" />
      </g>
    ),
    mouth: (x, y) => (
      <g>
        <rect x={x+2} y={y+12} width="2" height="1" fill="#e74c3c" />
        <rect x={x+4} y={y+13} width="4" height="2" fill="#e74c3c" />
        <rect x={x+8} y={y+12} width="2" height="1" fill="#e74c3c" />
      </g>
    )
  },
  nerd: {
    name: '🤓 Nerd',
    eyes: (x, y) => (
      <g>
        <rect x={x-6} y={y-2} width="8" height="8" rx="1" fill="none" stroke="#1a1a2e" strokeWidth="1.5" />
        <rect x={x+9} y={y-2} width="8" height="8" rx="1" fill="none" stroke="#1a1a2e" strokeWidth="1.5" />
        <rect x={x+2} y={y+1} width="7" height="2" fill="#1a1a2e" />
        <rect x={x-4} y={y+1} width="2" height="2" fill="#1a1a2e" />
        <rect x={x+13} y={y+1} width="2" height="2" fill="#1a1a2e" />
      </g>
    ),
    mouth: (x, y) => <rect x={x+3} y={y+12} width="6" height="1" fill="#e74c3c" />
  },
};

// ============ HAIR STYLES (20 estilos) ============
const hairStyles = {
  none: { name: 'Calvo', render: () => null },
  short: {
    name: 'Corto',
    render: (color, shadow) => (
      <g>
        <rect x="22" y="6" width="26" height="4" fill={color} />
        <rect x="20" y="8" width="30" height="6" fill={color} />
        <rect x="18" y="12" width="4" height="8" fill={color} />
        <rect x="48" y="12" width="4" height="8" fill={color} />
        <rect x="46" y="10" width="4" height="4" fill={shadow} opacity="0.3" />
      </g>
    )
  },
  spiky: {
    name: 'Puntas',
    render: (color, shadow) => (
      <g>
        <rect x="20" y="10" width="30" height="6" fill={color} />
        <rect x="22" y="4" width="4" height="8" fill={color} />
        <rect x="28" y="0" width="4" height="12" fill={color} />
        <rect x="34" y="2" width="4" height="10" fill={color} />
        <rect x="40" y="0" width="4" height="12" fill={color} />
        <rect x="46" y="4" width="4" height="8" fill={color} />
        <rect x="18" y="14" width="4" height="6" fill={color} />
        <rect x="48" y="14" width="4" height="6" fill={color} />
      </g>
    )
  },
  long: {
    name: 'Largo',
    render: (color, shadow) => (
      <g>
        <rect x="20" y="8" width="30" height="8" fill={color} />
        <rect x="16" y="14" width="6" height="36" fill={color} />
        <rect x="48" y="14" width="6" height="36" fill={color} />
        <rect x="16" y="48" width="8" height="4" fill={color} />
        <rect x="46" y="48" width="8" height="4" fill={color} />
        <rect x="50" y="20" width="4" height="20" fill={shadow} opacity="0.3" />
      </g>
    )
  },
  curly: {
    name: 'Rizado',
    render: (color, shadow) => (
      <g>
        <ellipse cx="25" cy="12" rx="8" ry="8" fill={color} />
        <ellipse cx="35" cy="8" rx="8" ry="8" fill={color} />
        <ellipse cx="45" cy="12" rx="8" ry="8" fill={color} />
        <ellipse cx="18" cy="24" rx="6" ry="8" fill={color} />
        <ellipse cx="52" cy="24" rx="6" ry="8" fill={color} />
        <ellipse cx="16" cy="36" rx="5" ry="6" fill={color} />
        <ellipse cx="54" cy="36" rx="5" ry="6" fill={color} />
      </g>
    )
  },
  mohawk: {
    name: 'Mohawk',
    render: (color, shadow) => (
      <g>
        <rect x="30" y="-8" width="10" height="24" fill={color} />
        <rect x="28" y="14" width="14" height="4" fill={color} />
      </g>
    )
  },
  afro: {
    name: 'Afro',
    render: (color, shadow) => (
      <g>
        <ellipse cx="35" cy="10" rx="28" ry="22" fill={color} />
        <ellipse cx="48" cy="12" rx="8" ry="8" fill={shadow} opacity="0.2" />
      </g>
    )
  },
  ponytail: {
    name: 'Coleta',
    render: (color, shadow) => (
      <g>
        <rect x="20" y="8" width="30" height="8" fill={color} />
        <ellipse cx="55" cy="12" rx="6" ry="5" fill={color} />
        <rect x="54" y="14" width="6" height="30" fill={color} />
        <rect x="52" y="42" width="10" height="4" fill={color} />
      </g>
    )
  },
  bun: {
    name: 'Moño',
    render: (color, shadow) => (
      <g>
        <rect x="20" y="8" width="30" height="8" fill={color} />
        <ellipse cx="35" cy="0" rx="10" ry="8" fill={color} />
      </g>
    )
  },
  bob: {
    name: 'Bob',
    render: (color, shadow) => (
      <g>
        <rect x="20" y="8" width="30" height="8" fill={color} />
        <rect x="16" y="14" width="6" height="20" fill={color} />
        <rect x="48" y="14" width="6" height="20" fill={color} />
        <rect x="16" y="32" width="8" height="4" fill={color} />
        <rect x="46" y="32" width="8" height="4" fill={color} />
      </g>
    )
  },
  emo: {
    name: 'Emo',
    render: (color, shadow) => (
      <g>
        <rect x="18" y="8" width="34" height="10" fill={color} />
        <rect x="12" y="16" width="16" height="24" fill={color} />
        <rect x="48" y="16" width="6" height="16" fill={color} />
        <rect x="10" y="38" width="10" height="4" fill={color} />
      </g>
    )
  },
  pigtails: {
    name: 'Coletas',
    render: (color, shadow) => (
      <g>
        <rect x="20" y="8" width="30" height="8" fill={color} />
        <ellipse cx="14" cy="18" rx="8" ry="10" fill={color} />
        <ellipse cx="56" cy="18" rx="8" ry="10" fill={color} />
        <rect x="10" y="26" width="8" height="20" fill={color} />
        <rect x="52" y="26" width="8" height="20" fill={color} />
      </g>
    )
  },
  messy: {
    name: 'Despeinado',
    render: (color, shadow) => (
      <g>
        <rect x="18" y="10" width="34" height="8" fill={color} />
        <rect x="20" y="4" width="6" height="8" fill={color} />
        <rect x="30" y="2" width="4" height="10" fill={color} />
        <rect x="38" y="0" width="6" height="12" fill={color} />
        <rect x="46" y="4" width="6" height="8" fill={color} />
        <rect x="16" y="16" width="4" height="6" fill={color} />
        <rect x="50" y="16" width="4" height="6" fill={color} />
      </g>
    )
  },
  braids: {
    name: 'Trenzas',
    render: (color, shadow) => (
      <g>
        <rect x="20" y="8" width="30" height="8" fill={color} />
        <rect x="16" y="14" width="6" height="6" fill={color} />
        <rect x="48" y="14" width="6" height="6" fill={color} />
        <rect x="14" y="20" width="4" height="6" fill={color} />
        <rect x="18" y="26" width="4" height="6" fill={color} />
        <rect x="14" y="32" width="4" height="6" fill={color} />
        <rect x="18" y="38" width="4" height="6" fill={color} />
        <rect x="52" y="20" width="4" height="6" fill={color} />
        <rect x="48" y="26" width="4" height="6" fill={color} />
        <rect x="52" y="32" width="4" height="6" fill={color} />
        <rect x="48" y="38" width="4" height="6" fill={color} />
        <ellipse cx="16" cy="48" rx="4" ry="3" fill="#f1c40f" />
        <ellipse cx="54" cy="48" rx="4" ry="3" fill="#f1c40f" />
      </g>
    )
  },
  buzzcut: {
    name: 'Rapado',
    render: (color, shadow) => <rect x="22" y="10" width="26" height="6" fill={color} opacity="0.6" />
  },
  wavy: {
    name: 'Ondulado',
    render: (color, shadow) => (
      <g>
        <rect x="18" y="8" width="34" height="10" fill={color} />
        <rect x="14" y="16" width="6" height="8" fill={color} />
        <rect x="16" y="24" width="6" height="8" fill={color} />
        <rect x="14" y="32" width="6" height="8" fill={color} />
        <rect x="50" y="16" width="6" height="8" fill={color} />
        <rect x="48" y="24" width="6" height="8" fill={color} />
        <rect x="50" y="32" width="6" height="8" fill={color} />
      </g>
    )
  },
  undercut: {
    name: 'Undercut',
    render: (color, shadow) => (
      <g>
        <rect x="22" y="6" width="26" height="6" fill={color} />
        <rect x="20" y="10" width="30" height="6" fill={color} />
        <rect x="18" y="14" width="4" height="4" fill={shadow} opacity="0.4" />
        <rect x="48" y="14" width="4" height="4" fill={shadow} opacity="0.4" />
      </g>
    )
  },
  mullet: {
    name: 'Mullet',
    render: (color, shadow) => (
      <g>
        <rect x="20" y="8" width="30" height="8" fill={color} />
        <rect x="24" y="4" width="22" height="6" fill={color} />
        <rect x="46" y="14" width="6" height="32" fill={color} />
        <rect x="44" y="44" width="10" height="4" fill={color} />
      </g>
    )
  },
  dreadlocks: {
    name: 'Rastas',
    render: (color, shadow) => (
      <g>
        <rect x="18" y="8" width="34" height="10" fill={color} />
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x={16 + i*8} y="16" width="4" height={28 + (i%2)*8} fill={color} rx="2" />
        ))}
      </g>
    )
  },
  sidepart: {
    name: 'Lado',
    render: (color, shadow) => (
      <g>
        <rect x="18" y="8" width="34" height="10" fill={color} />
        <rect x="16" y="14" width="6" height="12" fill={color} />
        <rect x="48" y="14" width="6" height="8" fill={color} />
        <rect x="22" y="4" width="16" height="6" fill={color} />
      </g>
    )
  },
  shaved: {
    name: 'Afeitado',
    render: (color, shadow) => (
      <g>
        <rect x="28" y="6" width="14" height="12" fill={color} />
        <rect x="22" y="10" width="8" height="6" fill={shadow} opacity="0.3" />
        <rect x="40" y="10" width="8" height="6" fill={shadow} opacity="0.3" />
      </g>
    )
  },
};

// ============ HAIR COLORS (20 colores) ============
const hairColors = {
  black: { base: '#1a1a1a', shadow: '#000000' },
  darkBrown: { base: '#3d2314', shadow: '#2a1810' },
  brown: { base: '#5c3317', shadow: '#3d220f' },
  chestnut: { base: '#7b3f00', shadow: '#5a2d00' },
  auburn: { base: '#922724', shadow: '#6b1c1a' },
  ginger: { base: '#d35400', shadow: '#a04000' },
  blonde: { base: '#f4d03f', shadow: '#d4b130' },
  platinum: { base: '#e8e8e8', shadow: '#c0c0c0' },
  white: { base: '#f5f5f5', shadow: '#d0d0d0' },
  gray: { base: '#808080', shadow: '#606060' },
  blue: { base: '#3498db', shadow: '#2070a0' },
  navy: { base: '#1a237e', shadow: '#0d1145' },
  purple: { base: '#8e44ad', shadow: '#6a2c82' },
  pink: { base: '#e91e63', shadow: '#c2185b' },
  hotPink: { base: '#ff69b4', shadow: '#db4d98' },
  red: { base: '#e53935', shadow: '#c62828' },
  green: { base: '#27ae60', shadow: '#1e8449' },
  teal: { base: '#009688', shadow: '#00796b' },
  orange: { base: '#ff9800', shadow: '#f57c00' },
  mint: { base: '#26a69a', shadow: '#00897b' },
};

// ============ CLOTHING COLORS ============
const clothingColors = {
  red: '#e74c3c', crimson: '#dc143c', maroon: '#800000',
  orange: '#ff9800', coral: '#ff7f50', peach: '#ffab91',
  yellow: '#ffc107', gold: '#ffd700', lime: '#cddc39',
  green: '#4caf50', emerald: '#2ecc71', forest: '#228b22',
  teal: '#009688', cyan: '#00bcd4', sky: '#87ceeb',
  blue: '#2196f3', royal: '#4169e1', navy: '#1a237e',
  indigo: '#3f51b5', purple: '#9c27b0', violet: '#7e57c2',
  magenta: '#e91e63', pink: '#f48fb1', rose: '#ff6b9d',
  brown: '#795548', chocolate: '#8b4513', tan: '#d2b48c',
  beige: '#f5f5dc', gray: '#9e9e9e', charcoal: '#36454f',
  slate: '#708090', black: '#212121', white: '#fafafa',
};

// ============ SHIRT STYLES ============
const shirtStyles = {
  tshirt: {
    name: 'Camiseta',
    render: (color) => (
      <g>
        <rect x="20" y="52" width="30" height="28" fill={color} />
        <rect x="14" y="54" width="8" height="18" fill={color} />
        <rect x="48" y="54" width="8" height="18" fill={color} />
        <rect x="28" y="50" width="14" height="4" fill={adjustColor(color, 15)} />
      </g>
    )
  },
  polo: {
    name: 'Polo',
    render: (color) => (
      <g>
        <rect x="20" y="52" width="30" height="28" fill={color} />
        <rect x="14" y="54" width="8" height="18" fill={color} />
        <rect x="48" y="54" width="8" height="18" fill={color} />
        <rect x="30" y="50" width="10" height="6" fill={adjustColor(color, -15)} />
        <rect x="33" y="52" width="4" height="10" fill="white" />
      </g>
    )
  },
  hoodie: {
    name: 'Sudadera',
    render: (color) => (
      <g>
        <rect x="18" y="52" width="34" height="28" fill={color} />
        <rect x="12" y="56" width="10" height="22" fill={color} />
        <rect x="48" y="56" width="10" height="22" fill={color} />
        <rect x="28" y="48" width="14" height="8" fill={color} />
        <ellipse cx="35" cy="70" rx="8" ry="6" fill={adjustColor(color, -15)} />
      </g>
    )
  },
  jacket: {
    name: 'Chaqueta',
    render: (color) => (
      <g>
        <rect x="20" y="52" width="14" height="28" fill={color} />
        <rect x="36" y="52" width="14" height="28" fill={color} />
        <rect x="34" y="52" width="2" height="28" fill={adjustColor(color, 20)} />
        <rect x="12" y="56" width="10" height="22" fill={color} />
        <rect x="48" y="56" width="10" height="22" fill={color} />
        <rect x="28" y="50" width="14" height="4" fill="white" />
      </g>
    )
  },
  sweater: {
    name: 'Suéter',
    render: (color) => (
      <g>
        <rect x="18" y="52" width="34" height="28" fill={color} />
        <rect x="10" y="56" width="12" height="22" fill={color} />
        <rect x="48" y="56" width="12" height="22" fill={color} />
        <rect x="28" y="50" width="14" height="6" fill={adjustColor(color, -10)} />
        <rect x="18" y="76" width="34" height="3" fill={adjustColor(color, -15)} />
      </g>
    )
  },
  tank: {
    name: 'Tirantes',
    render: (color) => (
      <g>
        <rect x="24" y="52" width="22" height="28" fill={color} />
        <rect x="26" y="50" width="6" height="4" fill={color} />
        <rect x="38" y="50" width="6" height="4" fill={color} />
      </g>
    )
  },
  suit: {
    name: 'Traje',
    render: (color) => (
      <g>
        <rect x="20" y="52" width="30" height="28" fill={color} />
        <rect x="12" y="56" width="10" height="22" fill={color} />
        <rect x="48" y="56" width="10" height="22" fill={color} />
        <rect x="33" y="52" width="4" height="28" fill="white" />
        <rect x="26" y="52" width="8" height="8" fill={adjustColor(color, -20)} />
        <rect x="36" y="52" width="8" height="8" fill={adjustColor(color, -20)} />
      </g>
    )
  },
  holy_robe: {
    name: 'Túnica Sagrada',
    render: (color) => (
      <g>
        <rect x="16" y="52" width="38" height="36" fill={color} rx="4" />
        <rect x="10" y="54" width="10" height="32" fill={color} />
        <rect x="50" y="54" width="10" height="32" fill={color} />
        <rect x="28" y="50" width="14" height="6" fill={adjustColor(color, 15)} />
        <line x1="20" y1="60" x2="20" y2="86" stroke={adjustColor(color, -20)} strokeWidth="2" />
        <line x1="50" y1="60" x2="50" y2="86" stroke={adjustColor(color, -20)} strokeWidth="2" />
      </g>
    )
  },
  executive_suit: {
    name: 'Traje Ejecutivo',
    render: (color) => (
      <g>
        <rect x="20" y="52" width="30" height="28" fill={color} />
        <rect x="12" y="56" width="10" height="22" fill={color} />
        <rect x="48" y="56" width="10" height="22" fill={color} />
        <rect x="28" y="50" width="14" height="4" fill="white" />
        <rect x="33" y="52" width="4" height="20" fill="#3F51B5" />
        <rect x="26" y="52" width="8" height="10" fill={adjustColor(color, -25)} />
        <rect x="36" y="52" width="8" height="10" fill={adjustColor(color, -25)} />
      </g>
    )
  },
  champion_jersey: {
    name: 'Jersey de Campeón',
    render: (color) => (
      <g>
        <rect x="18" y="50" width="34" height="30" fill={color} rx="4" />
        <rect x="10" y="52" width="10" height="20" fill={color} />
        <rect x="50" y="52" width="10" height="20" fill={color} />
        <text x="35" y="70" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">10</text>
        <rect x="24" y="54" width="22" height="4" fill={adjustColor(color, -30)} />
      </g>
    )
  },
  dress: {
    name: 'Vestido',
    render: (color) => (
      <g>
        <rect x="22" y="52" width="26" height="12" fill={color} />
        <path d="M18 64 L52 64 L56 96 L14 96 Z" fill={color} />
        <rect x="28" y="50" width="14" height="4" fill={adjustColor(color, 10)} />
      </g>
    )
  },
};

// ============ PANTS STYLES ============
const pantsStyles = {
  jeans: {
    name: 'Jeans',
    render: (color) => (
      <g>
        <rect x="22" y="78" width="12" height="20" fill={color} />
        <rect x="36" y="78" width="12" height="20" fill={color} />
        <rect x="34" y="78" width="2" height="6" fill={adjustColor(color, -20)} />
      </g>
    )
  },
  shorts: {
    name: 'Shorts',
    render: (color) => (
      <g>
        <rect x="22" y="78" width="12" height="10" fill={color} />
        <rect x="36" y="78" width="12" height="10" fill={color} />
      </g>
    )
  },
  skirt: {
    name: 'Falda',
    render: (color) => (
      <g>
        <path d="M20 78 L50 78 L54 98 L16 98 Z" fill={color} />
      </g>
    )
  },
  formal: {
    name: 'Formal',
    render: (color) => (
      <g>
        <rect x="22" y="78" width="12" height="20" fill={color} />
        <rect x="36" y="78" width="12" height="20" fill={color} />
        <rect x="27" y="78" width="2" height="18" fill={adjustColor(color, -20)} opacity="0.5" />
        <rect x="41" y="78" width="2" height="18" fill={adjustColor(color, -20)} opacity="0.5" />
      </g>
    )
  },
  cargo: {
    name: 'Cargo',
    render: (color) => (
      <g>
        <rect x="20" y="78" width="14" height="20" fill={color} />
        <rect x="36" y="78" width="14" height="20" fill={color} />
        <rect x="22" y="86" width="6" height="6" fill={adjustColor(color, -15)} />
        <rect x="42" y="86" width="6" height="6" fill={adjustColor(color, -15)} />
      </g>
    )
  },
  leggings: {
    name: 'Leggings',
    render: (color) => (
      <g>
        <rect x="24" y="78" width="10" height="20" fill={color} />
        <rect x="36" y="78" width="10" height="20" fill={color} />
      </g>
    )
  },
};

// ============ SHOES STYLES ============
const shoesStyles = {
  sneakers: {
    name: 'Deportivos',
    render: (color) => (
      <g>
        <rect x="20" y="96" width="14" height="6" rx="2" fill={color} />
        <rect x="36" y="96" width="14" height="6" rx="2" fill={color} />
        <rect x="22" y="97" width="4" height="2" fill="white" />
        <rect x="44" y="97" width="4" height="2" fill="white" />
      </g>
    )
  },
  boots: {
    name: 'Botas',
    render: (color) => (
      <g>
        <rect x="20" y="92" width="12" height="10" fill={color} />
        <rect x="38" y="92" width="12" height="10" fill={color} />
        <rect x="18" y="98" width="16" height="4" fill={adjustColor(color, -15)} />
        <rect x="36" y="98" width="16" height="4" fill={adjustColor(color, -15)} />
      </g>
    )
  },
  heels: {
    name: 'Tacones',
    render: (color) => (
      <g>
        <rect x="22" y="96" width="10" height="4" fill={color} />
        <rect x="38" y="96" width="10" height="4" fill={color} />
        <rect x="24" y="100" width="3" height="4" fill={adjustColor(color, -20)} />
        <rect x="43" y="100" width="3" height="4" fill={adjustColor(color, -20)} />
      </g>
    )
  },
  sandals: {
    name: 'Sandalias',
    render: (color) => (
      <g>
        <rect x="20" y="98" width="14" height="4" fill={adjustColor(color, 30)} />
        <rect x="36" y="98" width="14" height="4" fill={adjustColor(color, 30)} />
        <rect x="24" y="96" width="2" height="6" fill={color} />
        <rect x="30" y="96" width="2" height="6" fill={color} />
        <rect x="40" y="96" width="2" height="6" fill={color} />
        <rect x="46" y="96" width="2" height="6" fill={color} />
      </g>
    )
  },
  formal: {
    name: 'Formales',
    render: (color) => (
      <g>
        <rect x="20" y="96" width="14" height="6" rx="1" fill={color} />
        <rect x="36" y="96" width="14" height="6" rx="1" fill={color} />
        <rect x="24" y="97" width="6" height="3" fill={adjustColor(color, 15)} />
        <rect x="40" y="97" width="6" height="3" fill={adjustColor(color, 15)} />
      </g>
    )
  },
  slippers: {
    name: 'Pantuflas',
    render: (color) => (
      <g>
        <ellipse cx="27" cy="99" rx="9" ry="5" fill={color} />
        <ellipse cx="43" cy="99" rx="9" ry="5" fill={color} />
        <ellipse cx="27" cy="97" rx="5" ry="3" fill={adjustColor(color, 20)} />
        <ellipse cx="43" cy="97" rx="5" ry="3" fill={adjustColor(color, 20)} />
      </g>
    )
  },
};

// ============ TATTOOS ============
const tattoos = {
  tribal: (skinBase) => (
    <g opacity="0.7">
      <path d="M14 58 Q10 62 14 68 Q18 64 14 58" stroke="#1a1a1a" strokeWidth="1" fill="none" />
      <path d="M56 58 Q60 62 56 68 Q52 64 56 58" stroke="#1a1a1a" strokeWidth="1" fill="none" />
    </g>
  ),
  dragon: (skinBase) => (
    <g opacity="0.7">
      <path d="M12 60 Q8 56 10 64 Q14 70 16 62 Q18 56 14 60" stroke="#c62828" strokeWidth="1.5" fill="none" />
    </g>
  ),
  rose: (skinBase) => (
    <g opacity="0.8">
      <circle cx="55" cy="62" r="3" fill="#e91e63" />
      <path d="M55 65 L55 72" stroke="#2e7d32" strokeWidth="1" />
    </g>
  ),
  skull: (skinBase) => (
    <g opacity="0.6">
      <ellipse cx="14" cy="64" rx="3" ry="4" fill="#424242" />
      <circle cx="13" cy="63" r="1" fill="#212121" />
      <circle cx="15" cy="63" r="1" fill="#212121" />
    </g>
  ),
  star: (color = '#ffd700') => (
    <g>
      <polygon points="14,58 15,61 18,61 16,63 17,66 14,64 11,66 12,63 10,61 13,61" fill={color} opacity="0.8" />
    </g>
  ),
  flames: (skinBase) => (
    <g opacity="0.7">
      <path d="M12 70 Q10 65 12 60 Q14 64 16 60 Q18 65 16 70" fill="url(#flameGradient)" />
      <defs>
        <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff5722" />
          <stop offset="100%" stopColor="#ffeb3b" />
        </linearGradient>
      </defs>
    </g>
  ),
  heart: (color = '#e91e63') => (
    <g opacity="0.8">
      <path d={`M54 60 Q52 58 54 56 Q56 58 58 56 Q60 58 58 60 L56 64 L54 60`} fill={color} />
    </g>
  ),
  wings: (skinBase) => (
    <g opacity="0.5">
      <path d="M10 60 Q6 54 8 48 Q12 54 16 48 Q18 54 14 60" stroke="#1a1a1a" strokeWidth="1" fill="none" />
      <path d="M54 60 Q58 54 56 48 Q52 54 48 48 Q46 54 50 60" stroke="#1a1a1a" strokeWidth="1" fill="none" />
    </g>
  ),
  runas: (skinBase) => (
    <g opacity="0.6">
      <text x="12" y="66" fontSize="6" fill="#7c4dff" fontFamily="serif">ᚱ</text>
      <text x="54" y="66" fontSize="6" fill="#7c4dff" fontFamily="serif">ᚠ</text>
    </g>
  ),
};

// ============ PIERCINGS ============
// ============ BEARD STYLES ============
const beardStyles = {
  holy_beard: {
    name: 'Barba Sagrada',
    render: (color = '#654321') => (
      <g>
        <rect x="24" y="40" width="22" height="14" fill={color} rx="4" />
        <rect x="20" y="48" width="30" height="10" fill={color} rx="4" />
        <rect x="28" y="56" width="14" height="8" fill={color} rx="4" />
      </g>
    )
  },
};

const piercings = {
  ear_basic: (color = '#c0c0c0') => (
    <g>
      <circle cx="16" cy="32" r="2" fill={color} />
      <circle cx="54" cy="32" r="2" fill={color} />
    </g>
  ),
  ear_gold: () => (
    <g>
      <circle cx="16" cy="32" r="2.5" fill="#ffd700" />
      <circle cx="54" cy="32" r="2.5" fill="#ffd700" />
      <circle cx="16" cy="32" r="1" fill="#ffeb3b" />
      <circle cx="54" cy="32" r="1" fill="#ffeb3b" />
    </g>
  ),
  ear_diamond: () => (
    <g>
      <polygon points="16,30 18,32 16,36 14,32" fill="#e3f2fd" stroke="#90caf9" strokeWidth="0.5" />
      <polygon points="54,30 56,32 54,36 52,32" fill="#e3f2fd" stroke="#90caf9" strokeWidth="0.5" />
    </g>
  ),
  nose: (color = '#c0c0c0') => (
    <circle cx="35" cy="38" r="1.5" fill={color} />
  ),
  lip: (color = '#c0c0c0') => (
    <circle cx="38" cy="42" r="1.5" fill={color} />
  ),
  eyebrow: (color = '#c0c0c0') => (
    <g>
      <rect x="44" y="22" width="3" height="1.5" rx="0.5" fill={color} />
    </g>
  ),
  chain: () => (
    <g>
      <circle cx="16" cy="32" r="2" fill="#ffd700" />
      <path d="M18 32 Q27 36 35 38" stroke="#ffd700" strokeWidth="0.8" fill="none" />
    </g>
  ),
  punk_set: () => (
    <g>
      <circle cx="16" cy="30" r="1.5" fill="#212121" />
      <circle cx="16" cy="34" r="1.5" fill="#212121" />
      <circle cx="54" cy="30" r="1.5" fill="#212121" />
      <circle cx="54" cy="34" r="1.5" fill="#212121" />
      <rect x="44" y="22" width="3" height="1.5" rx="0.5" fill="#212121" />
      <circle cx="38" cy="42" r="1.5" fill="#212121" />
    </g>
  ),
};

// ============ ACCESSORIES ============
const accessories = {
  glasses: {
    nerd: (x, y) => (
      <g>
        <rect x={x-8} y={y-2} width="10" height="8" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <rect x={x+9} y={y-2} width="10" height="8" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <rect x={x+2} y={y+1} width="7" height="2" fill="#1a1a1a" />
      </g>
    ),
    round: (x, y) => (
      <g>
        <circle cx={x-3} cy={y+2} r="5" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx={x+14} cy={y+2} r="5" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <rect x={x+2} y={y+1} width="7" height="2" fill="#1a1a1a" />
      </g>
    ),
    aviator: (x, y) => (
      <g>
        <ellipse cx={x-2} cy={y+2} rx="6" ry="5" fill="none" stroke="#ffd700" strokeWidth="2" />
        <ellipse cx={x+13} cy={y+2} rx="6" ry="5" fill="none" stroke="#ffd700" strokeWidth="2" />
        <rect x={x+4} y={y+1} width="5" height="2" fill="#ffd700" />
        <ellipse cx={x-2} cy={y+2} rx="4" ry="3" fill="#4a90d9" opacity="0.5" />
        <ellipse cx={x+13} cy={y+2} rx="4" ry="3" fill="#4a90d9" opacity="0.5" />
      </g>
    ),
    heart: (x, y) => (
      <g>
        <path d={`M${x-6} ${y+2} Q${x-6} ${y-2} ${x-2} ${y-2} Q${x+2} ${y-2} ${x+2} ${y+2} L${x-2} ${y+6} L${x-6} ${y+2}`} fill="#e91e63" opacity="0.8" />
        <path d={`M${x+9} ${y+2} Q${x+9} ${y-2} ${x+13} ${y-2} Q${x+17} ${y-2} ${x+17} ${y+2} L${x+13} ${y+6} L${x+9} ${y+2}`} fill="#e91e63" opacity="0.8" />
        <rect x={x+2} y={y+1} width="7" height="2" fill="#e91e63" />
      </g>
    ),
    cyber_visor: (x, y) => (
      <g>
        <rect x={x-10} y={y-1} width="32" height="6" rx="2" fill="#1a1a1a" />
        <rect x={x-8} y={y} width="28" height="4" rx="1" fill="#00bcd4" opacity="0.7" />
        <rect x={x-6} y={y+1} width="3" height="2" fill="#00e5ff" />
        <rect x={x+2} y={y+1} width="3" height="2" fill="#00e5ff" />
        <rect x={x+10} y={y+1} width="3" height="2" fill="#00e5ff" />
        <rect x={x+16} y={y+1} width="3" height="2" fill="#00e5ff" />
      </g>
    ),
    steampunk: (x, y) => (
      <g>
        <circle cx={x-3} cy={y+2} r="6" fill="none" stroke="#795548" strokeWidth="2" />
        <circle cx={x+14} cy={y+2} r="6" fill="none" stroke="#795548" strokeWidth="2" />
        <circle cx={x-3} cy={y+2} r="4" fill="#4a90d9" opacity="0.4" />
        <circle cx={x+14} cy={y+2} r="4" fill="#4a90d9" opacity="0.4" />
        <rect x={x+3} y={y} width="5" height="3" fill="#795548" />
        <circle cx={x-7} cy={y+2} r="2" fill="#ffd700" />
        <circle cx={x+18} cy={y+2} r="2" fill="#ffd700" />
      </g>
    ),
  },
  hats: {
    cap: (color) => (
      <g>
        <rect x="18" y="4" width="34" height="10" fill={color} />
        <rect x="14" y="12" width="42" height="4" fill={adjustColor(color, -20)} />
        <rect x="48" y="8" width="12" height="6" fill={adjustColor(color, -10)} />
      </g>
    ),
    beanie: (color) => (
      <g>
        <ellipse cx="35" cy="8" rx="20" ry="12" fill={color} />
        <rect x="15" y="8" width="40" height="10" fill={color} />
        <ellipse cx="35" cy="-2" rx="4" ry="4" fill={color} />
        <rect x="15" y="14" width="40" height="4" fill={adjustColor(color, -15)} />
      </g>
    ),
    crown: () => (
      <g>
        <rect x="20" y="4" width="30" height="12" fill="#ffd700" />
        <rect x="18" y="8" width="4" height="10" fill="#ffd700" />
        <rect x="48" y="8" width="4" height="10" fill="#ffd700" />
        <rect x="22" y="0" width="4" height="6" fill="#ffd700" />
        <rect x="32" y="-4" width="6" height="10" fill="#ffd700" />
        <rect x="44" y="0" width="4" height="6" fill="#ffd700" />
        <circle cx="35" cy="0" r="3" fill="#e74c3c" />
        <circle cx="24" cy="4" r="2" fill="#3498db" />
        <circle cx="46" cy="4" r="2" fill="#3498db" />
      </g>
    ),
    crown_thorns: (color = '#8B4513') => (
      <g>
        <circle cx="35" cy="16" r="18" stroke={color} strokeWidth="2" fill="none" />
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const x = 35 + Math.cos(angle) * 18;
          const y = 16 + Math.sin(angle) * 18;
          const tipX = 35 + Math.cos(angle) * 25;
          const tipY = 16 + Math.sin(angle) * 25;
          return (
            <line key={i} x1={x} y1={y} x2={tipX} y2={tipY} stroke={color} strokeWidth="2" />
          );
        })}
      </g>
    ),
    sport_bandana: (color = '#ff0000') => (
      <g>
        <rect x="16" y="12" width="38" height="8" fill={color} rx="2" />
        <path d="M54 20 L60 32 L56 28 L58 24" fill={color} />
      </g>
    ),
    artist_beret: (color = '#000000') => (
      <g>
        <ellipse cx="35" cy="12" rx="22" ry="8" fill={color} />
        <circle cx="46" cy="6" r="3" fill={color} />
      </g>
    ),
    tophat: (color = '#1a1a1a') => (
      <g>
        <rect x="24" y="-12" width="22" height="22" fill={color} />
        <rect x="16" y="8" width="38" height="6" fill={color} />
        <rect x="28" y="-4" width="14" height="4" fill="#e74c3c" />
      </g>
    ),
    wizard: (color = '#6c3483') => (
      <g>
        <path d="M35 -20 L20 14 L50 14 Z" fill={color} />
        <rect x="15" y="12" width="40" height="4" fill={adjustColor(color, -20)} />
        <circle cx="35" cy="-8" r="3" fill="#ffd700" />
        <circle cx="30" cy="0" r="2" fill="#ffd700" />
        <circle cx="40" cy="2" r="2" fill="#ffd700" />
      </g>
    ),
    headphones: (color = '#1a1a1a') => (
      <g>
        <rect x="14" y="8" width="6" height="12" rx="2" fill={color} />
        <rect x="50" y="8" width="6" height="12" rx="2" fill={color} />
        <path d="M17 8 Q17 0 35 0 Q53 0 53 8" stroke={color} strokeWidth="4" fill="none" />
        <rect x="15" y="10" width="4" height="4" fill="#4caf50" />
        <rect x="51" y="10" width="4" height="4" fill="#4caf50" />
      </g>
    ),
    devil_horns: () => (
      <g>
        <path d="M20 12 Q18 0 22 -8 Q24 -4 24 4 L22 12" fill="#b71c1c" />
        <path d="M50 12 Q52 0 48 -8 Q46 -4 46 4 L48 12" fill="#b71c1c" />
        <path d="M21 -4 Q23 -8 22 -6" stroke="#e53935" strokeWidth="1" fill="none" />
        <path d="M49 -4 Q47 -8 48 -6" stroke="#e53935" strokeWidth="1" fill="none" />
      </g>
    ),
    halo: () => (
      <g>
        <ellipse cx="35" cy="-2" rx="14" ry="4" fill="none" stroke="#ffd700" strokeWidth="3" />
        <ellipse cx="35" cy="-2" rx="14" ry="4" fill="none" stroke="#fff59d" strokeWidth="1" opacity="0.5" />
      </g>
    ),
    ninja_mask: () => (
      <g>
        <rect x="18" y="22" width="34" height="16" fill="#1a1a1a" />
        <rect x="24" y="26" width="8" height="4" fill="white" />
        <rect x="38" y="26" width="8" height="4" fill="white" />
        <circle cx="28" cy="28" r="2" fill="#1a1a1a" />
        <circle cx="42" cy="28" r="2" fill="#1a1a1a" />
      </g>
    ),
    pirate: () => (
      <g>
        <ellipse cx="35" cy="8" rx="22" ry="10" fill="#1a1a1a" />
        <rect x="18" y="4" width="34" height="8" fill="#1a1a1a" />
        <rect x="28" y="0" width="14" height="6" fill="#1a1a1a" />
        <circle cx="35" cy="6" r="4" fill="#ffd700" />
        <path d="M31 4 L39 4 L37 8 L33 8 Z" fill="white" />
      </g>
    ),
    viking: () => (
      <g>
        <ellipse cx="35" cy="10" rx="20" ry="12" fill="#795548" />
        <rect x="15" y="10" width="40" height="8" fill="#795548" />
        <path d="M12 14 Q8 4 14 -4 Q16 6 18 12" fill="#ffd700" />
        <path d="M58 14 Q62 4 56 -4 Q54 6 52 12" fill="#ffd700" />
        <rect x="30" y="6" width="10" height="4" fill="#5d4037" />
      </g>
    ),
    samurai: () => (
      <g>
        <path d="M15 16 L35 -4 L55 16 L50 16 L35 2 L20 16 Z" fill="#b71c1c" />
        <rect x="18" y="14" width="34" height="4" fill="#ffd700" />
        <circle cx="35" cy="16" r="3" fill="#ffd700" />
      </g>
    ),
    astronaut: () => (
      <g>
        <ellipse cx="35" cy="30" rx="22" ry="24" fill="#eceff1" stroke="#90a4ae" strokeWidth="2" />
        <ellipse cx="35" cy="30" rx="16" ry="18" fill="#81d4fa" opacity="0.4" />
        <rect x="28" y="48" width="14" height="6" fill="#78909c" />
      </g>
    ),
    skull_mask: () => (
      <g>
        <ellipse cx="35" cy="30" rx="16" ry="18" fill="#eceff1" />
        <ellipse cx="28" cy="26" rx="5" ry="6" fill="#1a1a1a" />
        <ellipse cx="42" cy="26" rx="5" ry="6" fill="#1a1a1a" />
        <path d="M35 32 L33 38 L35 36 L37 38 Z" fill="#1a1a1a" />
        <rect x="28" y="40" width="3" height="4" fill="#1a1a1a" />
        <rect x="33" y="40" width="3" height="4" fill="#1a1a1a" />
        <rect x="38" y="40" width="3" height="4" fill="#1a1a1a" />
      </g>
    ),
    cat_ears: () => (
      <g>
        <polygon points="18,14 24,0 30,14" fill="#ff9800" />
        <polygon points="40,14 46,0 52,14" fill="#ff9800" />
        <polygon points="20,12 24,4 28,12" fill="#ffcc80" />
        <polygon points="42,12 46,4 50,12" fill="#ffcc80" />
      </g>
    ),
    bunny_ears: () => (
      <g>
        <ellipse cx="24" cy="-4" rx="5" ry="16" fill="#f8bbd9" />
        <ellipse cx="46" cy="-4" rx="5" ry="16" fill="#f8bbd9" />
        <ellipse cx="24" cy="-4" rx="3" ry="12" fill="#f48fb1" />
        <ellipse cx="46" cy="-4" rx="3" ry="12" fill="#f48fb1" />
      </g>
    ),
  },
  scarves: {
    simple: (color) => (
      <g>
        <rect x="26" y="48" width="18" height="6" fill={color} />
        <rect x="44" y="52" width="6" height="20" fill={color} />
        <rect x="44" y="70" width="8" height="4" fill={color} />
      </g>
    ),
    power_tie: (color = '#c41e3a') => (
      <g>
        <rect x="31" y="50" width="8" height="24" fill={color} />
        <polygon points="31,50 35,46 39,50" fill={color} />
      </g>
    ),
    gold_medal: (color = '#FFD700') => (
      <g>
        <line x1="30" y1="50" x2="20" y2="40" stroke={color} strokeWidth="3" />
        <line x1="40" y1="50" x2="50" y2="40" stroke={color} strokeWidth="3" />
        <circle cx="35" cy="56" r="8" fill={color} />
        <circle cx="35" cy="56" r="6" fill={adjustColor(color, -20)} />
        <text x="35" y="60" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">1</text>
      </g>
    ),
    striped: (color) => (
      <g>
        <rect x="26" y="48" width="18" height="6" fill={color} />
        <rect x="44" y="52" width="6" height="20" fill={color} />
        <rect x="44" y="70" width="8" height="4" fill={color} />
        <rect x="28" y="50" width="14" height="2" fill="white" />
        <rect x="44" y="56" width="6" height="2" fill="white" />
        <rect x="44" y="64" width="6" height="2" fill="white" />
      </g>
    ),
    winter: (color) => (
      <g>
        <rect x="24" y="46" width="22" height="8" fill={color} />
        <rect x="42" y="52" width="8" height="24" fill={color} />
        <rect x="42" y="74" width="10" height="6" fill={color} />
        <rect x="44" y="76" width="2" height="6" fill={adjustColor(color, -15)} />
        <rect x="48" y="76" width="2" height="6" fill={adjustColor(color, -15)} />
      </g>
    ),
    gold_chain: () => (
      <g>
        <path d="M26 52 Q35 58 44 52" stroke="#ffd700" strokeWidth="3" fill="none" />
        <circle cx="35" cy="58" r="4" fill="#ffd700" />
        <circle cx="35" cy="58" r="2" fill="#ffeb3b" />
      </g>
    ),
  },
  gloves: {
    simple: (color) => (
      <g>
        <rect x="10" y="70" width="6" height="8" fill={color} />
        <rect x="54" y="70" width="6" height="8" fill={color} />
      </g>
    ),
    mittens: (color) => (
      <g>
        <ellipse cx="13" cy="74" rx="5" ry="6" fill={color} />
        <ellipse cx="57" cy="74" rx="5" ry="6" fill={color} />
        <rect x="10" y="68" width="6" height="4" fill={adjustColor(color, -15)} />
        <rect x="54" y="68" width="6" height="4" fill={adjustColor(color, -15)} />
      </g>
    ),
    boxing: (color = '#e74c3c') => (
      <g>
        <ellipse cx="12" cy="72" rx="8" ry="8" fill={color} />
        <ellipse cx="58" cy="72" rx="8" ry="8" fill={color} />
      </g>
    ),
    diamond_watch: () => (
      <g>
        <rect x="8" y="72" width="8" height="6" rx="1" fill="#ffd700" />
        <rect x="9" y="73" width="6" height="4" fill="#e3f2fd" />
        <circle cx="12" cy="75" r="1.5" fill="#64b5f6" />
        <rect x="54" y="72" width="8" height="6" rx="1" fill="#ffd700" />
        <rect x="55" y="73" width="6" height="4" fill="#e3f2fd" />
        <circle cx="58" cy="75" r="1.5" fill="#64b5f6" />
      </g>
    ),
    gold_watch: (color = '#FFD700') => (
      <g>
        <rect x="8" y="68" width="10" height="10" rx="2" fill={color} />
        <circle cx="13" cy="73" r="4" fill="#1a1a1a" />
        <line x1="13" y1="73" x2="13" y2="70" stroke="#FFD700" strokeWidth="1" />
        <line x1="13" y1="73" x2="15" y2="73" stroke="#FFD700" strokeWidth="1" />
      </g>
    ),
    master_brush: (color = '#654321') => (
      <g>
        <rect x="58" y="58" width="6" height="20" fill="#8B4513" rx="1" />
        <rect x="58" y="76" width="6" height="8" fill={color || "#000000"} />
        <rect x="56" y="82" width="10" height="2" fill={adjustColor(color || "#000000", 20)} opacity="0.5" />
      </g>
    ),
  },
  backpacks: {
    school: (color) => (
      <g>
        <rect x="52" y="56" width="12" height="18" rx="2" fill={color} />
        <rect x="54" y="58" width="8" height="4" fill={adjustColor(color, 20)} />
        <rect x="56" y="66" width="4" height="4" fill={adjustColor(color, -20)} />
      </g>
    ),
    hiking: (color) => (
      <g>
        <rect x="52" y="54" width="14" height="24" rx="2" fill={color} />
        <rect x="54" y="56" width="10" height="6" fill={adjustColor(color, 20)} />
        <rect x="56" y="64" width="6" height="4" fill={adjustColor(color, -15)} />
        <rect x="56" y="70" width="6" height="4" fill={adjustColor(color, -15)} />
      </g>
    ),
    jetpack: () => (
      <g>
        <rect x="52" y="54" width="14" height="20" rx="3" fill="#607d8b" />
        <ellipse cx="56" cy="64" rx="3" ry="6" fill="#ff5722" />
        <ellipse cx="62" cy="64" rx="3" ry="6" fill="#ff5722" />
        <rect x="54" y="72" width="4" height="8" fill="#ff9800" opacity="0.8" />
        <rect x="60" y="72" width="4" height="8" fill="#ff9800" opacity="0.8" />
      </g>
    ),
    wings: () => (
      <g>
        <path d="M52 56 Q70 40 80 60 Q70 55 52 66" fill="#e1bee7" opacity="0.9" />
        <path d="M18 56 Q0 40 -10 60 Q0 55 18 66" fill="#e1bee7" opacity="0.9" />
      </g>
    ),
    demon_wings: () => (
      <g>
        <path d="M54 52 Q75 30 85 55 Q78 48 70 52 Q75 45 80 50 Q72 42 54 58" fill="#4a148c" />
        <path d="M16 52 Q-5 30 -15 55 Q-8 48 0 52 Q-5 45 -10 50 Q-2 42 16 58" fill="#4a148c" />
        <path d="M56 54 Q70 38 78 52" stroke="#7b1fa2" strokeWidth="2" fill="none" />
        <path d="M14 54 Q0 38 -8 52" stroke="#7b1fa2" strokeWidth="2" fill="none" />
      </g>
    ),
    butterfly_wings: () => (
      <g>
        <ellipse cx="68" cy="50" rx="15" ry="18" fill="#e91e63" opacity="0.8" />
        <ellipse cx="72" cy="68" rx="10" ry="12" fill="#f06292" opacity="0.8" />
        <ellipse cx="2" cy="50" rx="15" ry="18" fill="#e91e63" opacity="0.8" />
        <ellipse cx="-2" cy="68" rx="10" ry="12" fill="#f06292" opacity="0.8" />
        <circle cx="68" cy="48" r="3" fill="#fff" opacity="0.5" />
        <circle cx="2" cy="48" r="3" fill="#fff" opacity="0.5" />
      </g>
    ),
    fire_wings: () => (
      <g>
        <path d="M54 52 Q72 32 82 58 Q74 50 68 55 Q75 42 80 52 Q70 38 54 60" fill="#ff5722" />
        <path d="M16 52 Q-2 32 -12 58 Q-4 50 2 55 Q-5 42 -10 52 Q0 38 16 60" fill="#ff5722" />
        <path d="M56 54 Q68 40 76 54" fill="#ff9800" opacity="0.8" />
        <path d="M14 54 Q2 40 -6 54" fill="#ff9800" opacity="0.8" />
        <path d="M58 56 Q66 46 72 56" fill="#ffeb3b" opacity="0.6" />
        <path d="M12 56 Q4 46 -2 56" fill="#ffeb3b" opacity="0.6" />
      </g>
    ),
    ice_wings: () => (
      <g>
        <path d="M54 52 Q72 32 82 58 Q74 50 68 55 Q75 42 80 52 Q70 38 54 60" fill="#64b5f6" opacity="0.9" />
        <path d="M16 52 Q-2 32 -12 58 Q-4 50 2 55 Q-5 42 -10 52 Q0 38 16 60" fill="#64b5f6" opacity="0.9" />
        <path d="M60 48 L65 42 L62 50 L70 46 L64 54" stroke="#e3f2fd" strokeWidth="1.5" fill="none" />
        <path d="M10 48 L5 42 L8 50 L0 46 L6 54" stroke="#e3f2fd" strokeWidth="1.5" fill="none" />
      </g>
    ),
    vampire_cape: () => (
      <g>
        <path d="M22 52 L22 95 Q25 100 30 95 Q33 100 38 95 L38 52" fill="#b71c1c" />
        <path d="M48 52 L48 95 Q51 100 56 95 Q59 100 64 95 L64 52" fill="#b71c1c" />
        <path d="M24 52 L24 90" stroke="#d32f2f" strokeWidth="2" opacity="0.5" />
        <path d="M50 52 L50 90" stroke="#d32f2f" strokeWidth="2" opacity="0.5" />
      </g>
    ),
    wizard_staff: () => (
      <g>
        <rect x="60" y="50" width="3" height="50" fill="#5d4037" rx="1" />
        <circle cx="62" cy="46" r="6" fill="#9c27b0" />
        <circle cx="62" cy="46" r="3" fill="#e1bee7" />
        <circle cx="62" cy="46" r="1.5" fill="#fff" />
      </g>
    ),
    briefcase: (color = '#2c1810') => (
      <g>
        <rect x="54" y="64" width="16" height="20" fill={color} rx="2" />
        <rect x="56" y="66" width="12" height="3" fill={adjustColor(color, 30)} />
        <rect x="60" y="62" width="6" height="4" fill={adjustColor(color, 20)} rx="1" />
        <line x1="62" y1="72" x2="62" y2="82" stroke={adjustColor(color, -20)} strokeWidth="1" />
      </g>
    ),
    paint_palette: (color = '#ff6347') => (
      <g>
        <ellipse cx="58" cy="70" rx="10" ry="14" fill="#8B4513" />
        <circle cx="55" cy="66" r="3" fill="#e74c3c" />
        <circle cx="61" cy="68" r="3" fill="#2196f3" />
        <circle cx="58" cy="76" r="3" fill="#ffeb3b" />
        <circle cx="54" cy="74" r="2" fill="#4caf50" />
      </g>
    ),
  },
};

// ============ PETS ============
const pets = {
  cat: {
    name: '🐱 Gatito',
    render: (animation) => (
      <motion.g animate={animation === 'idle' ? { y: [0, -1, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
        <ellipse cx="-2" cy="100" rx="6" ry="4" fill="#ff9800" />
        <circle cx="-4" cy="94" r="5" fill="#ff9800" />
        <polygon points="-8,90 -6,86 -4,90" fill="#ff9800" />
        <polygon points="0,90 -2,86 -4,90" fill="#ff9800" />
        <circle cx="-6" cy="93" r="1" fill="#1a1a1a" />
        <circle cx="-2" cy="93" r="1" fill="#1a1a1a" />
        <path d="M-2 100 Q-8 96 -10 100" stroke="#ff9800" strokeWidth="2" fill="none" />
      </motion.g>
    )
  },
  dog: {
    name: '🐶 Perrito',
    render: (animation) => (
      <motion.g animate={animation === 'idle' ? { rotate: [0, 3, -3, 0] } : {}} transition={{ duration: 0.5, repeat: Infinity }}>
        <ellipse cx="72" cy="100" rx="7" ry="5" fill="#8d6e63" />
        <circle cx="76" cy="94" r="6" fill="#8d6e63" />
        <ellipse cx="80" cy="88" rx="3" ry="5" fill="#8d6e63" />
        <ellipse cx="72" cy="88" rx="3" ry="5" fill="#8d6e63" />
        <circle cx="74" cy="93" r="1.5" fill="#1a1a1a" />
        <circle cx="78" cy="93" r="1.5" fill="#1a1a1a" />
        <ellipse cx="76" cy="96" rx="2" ry="1.5" fill="#1a1a1a" />
      </motion.g>
    )
  },
  dragon: {
    name: '🐲 Dragón',
    render: (animation) => (
      <motion.g animate={animation === 'idle' ? { y: [0, -4, 0] } : {}} transition={{ duration: 1, repeat: Infinity }}>
        <ellipse cx="0" cy="94" rx="8" ry="6" fill="#7c4dff" />
        <circle cx="-2" cy="86" r="6" fill="#7c4dff" />
        <polygon points="-6,80 -4,74 -2,80" fill="#7c4dff" />
        <polygon points="2,80 0,74 -2,80" fill="#7c4dff" />
        <circle cx="-4" cy="85" r="1.5" fill="#ffeb3b" />
        <circle cx="0" cy="85" r="1.5" fill="#ffeb3b" />
        <path d="M8 90 Q14 84 12 94" stroke="#7c4dff" strokeWidth="2" fill="none" />
        <motion.ellipse cx="4" cy="88" rx="2" ry="1" fill="#ff5722" animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
      </motion.g>
    )
  },
  robot: {
    name: '🤖 Robot',
    render: (animation) => (
      <motion.g animate={animation === 'idle' ? { rotate: [0, 5, -5, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <rect x="68" y="92" width="10" height="10" rx="2" fill="#607d8b" />
        <rect x="70" y="94" width="2" height="2" fill="#4caf50" />
        <rect x="74" y="94" width="2" height="2" fill="#4caf50" />
        <rect x="71" y="98" width="4" height="1" fill="#4caf50" />
        <rect x="72" y="88" width="2" height="4" fill="#455a64" />
        <circle cx="73" cy="86" r="2" fill="#f44336" />
      </motion.g>
    )
  },
  fairy: {
    name: '🧚 Hada',
    render: (animation) => (
      <motion.g animate={{ y: [-2, 2, -2], x: [0, 2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        <ellipse cx="2" cy="82" rx="3" ry="4" fill="#f8bbd9" />
        <circle cx="2" cy="76" r="3" fill="#f8bbd9" />
        <path d="M5 80 Q12 74 10 84" fill="#e1bee7" opacity="0.7" />
        <path d="M-1 80 Q-8 74 -6 84" fill="#e1bee7" opacity="0.7" />
        <motion.circle cx="2" cy="80" r="8" fill="none" stroke="#fff59d" strokeWidth="1" opacity="0.5" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
      </motion.g>
    )
  },
  phoenix: {
    name: '🔥 Fénix',
    render: (animation) => (
      <motion.g animate={{ y: [-3, 3, -3] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <ellipse cx="2" cy="90" rx="6" ry="5" fill="#ff5722" />
        <circle cx="0" cy="82" r="5" fill="#ff9800" />
        <path d="M4 84 Q14 74 10 90" fill="#ffeb3b" />
        <path d="M-4 84 Q-12 74 -8 90" fill="#ffeb3b" />
        <circle cx="-2" cy="81" r="1" fill="#1a1a1a" />
        <circle cx="2" cy="81" r="1" fill="#1a1a1a" />
        <motion.path d="M2 96 Q-2 104 4 102 Q10 100 6 96" fill="#ff5722" animate={{ scaleY: [1, 1.3, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 0.3, repeat: Infinity }} />
      </motion.g>
    )
  },
  bat: {
    name: '🦇 Murciélago',
    render: (animation) => (
      <motion.g animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity }}>
        <ellipse cx="0" cy="80" rx="4" ry="3" fill="#4a148c" />
        <circle cx="0" cy="76" r="3" fill="#4a148c" />
        <polygon points="-2,74 -1,72 0,74" fill="#4a148c" />
        <polygon points="2,74 1,72 0,74" fill="#4a148c" />
        <motion.path d="M-4 78 Q-12 70 -10 82 Q-6 78 -4 80" fill="#6a1b9a" animate={{ rotate: [0, 5, 0] }} transition={{ duration: 0.3, repeat: Infinity }} />
        <motion.path d="M4 78 Q12 70 10 82 Q6 78 4 80" fill="#6a1b9a" animate={{ rotate: [0, -5, 0] }} transition={{ duration: 0.3, repeat: Infinity }} />
        <circle cx="-1" cy="75" r="0.8" fill="#f44336" />
        <circle cx="1" cy="75" r="0.8" fill="#f44336" />
      </motion.g>
    )
  },
  ghost: {
    name: '👻 Fantasma',
    render: (animation) => (
      <motion.g animate={{ y: [-3, 3, -3], opacity: [0.9, 0.6, 0.9] }} transition={{ duration: 2, repeat: Infinity }}>
        <path d="M-4 76 Q-4 68 2 68 Q8 68 8 76 L8 88 Q6 86 4 88 Q2 86 0 88 Q-2 86 -4 88 Z" fill="white" opacity="0.9" />
        <circle cx="0" cy="74" r="2" fill="#1a1a1a" />
        <circle cx="5" cy="74" r="2" fill="#1a1a1a" />
        <ellipse cx="2" cy="80" rx="2" ry="1.5" fill="#1a1a1a" />
      </motion.g>
    )
  },
  slime: {
    name: '🟢 Slime',
    render: (animation) => (
      <motion.g animate={{ scaleY: [1, 0.9, 1.1, 1], scaleX: [1, 1.1, 0.9, 1] }} transition={{ duration: 1, repeat: Infinity }}>
        <ellipse cx="75" cy="98" rx="8" ry="6" fill="#4caf50" />
        <ellipse cx="75" cy="96" rx="6" ry="4" fill="#66bb6a" />
        <circle cx="72" cy="94" r="2" fill="#1a1a1a" />
        <circle cx="78" cy="94" r="2" fill="#1a1a1a" />
        <ellipse cx="75" cy="98" rx="2" ry="1" fill="#2e7d32" />
      </motion.g>
    )
  },
};

// ============ VISUAL EFFECTS ============
const visualEffects = {
  sparkle: {
    name: '✨ Destellos',
    render: () => (
      <g>
        {[...Array(6)].map((_, i) => (
          <motion.circle key={i} cx={10 + Math.random() * 50} cy={10 + Math.random() * 80} r="2" fill="#ffd700" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }} />
        ))}
      </g>
    )
  },
  fire: {
    name: '🔥 Aura de Fuego',
    render: () => (
      <motion.g>
        <motion.ellipse cx="35" cy="100" rx="20" ry="8" fill="url(#fireGradient)" animate={{ scaleX: [1, 1.1, 1], opacity: [0.8, 0.6, 0.8] }} transition={{ duration: 0.5, repeat: Infinity }} />
        <defs>
          <radialGradient id="fireGradient">
            <stop offset="0%" stopColor="#ff5722" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ff9800" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffeb3b" stopOpacity="0" />
          </radialGradient>
        </defs>
      </motion.g>
    )
  },
  ice: {
    name: '❄️ Aura de Hielo',
    render: () => (
      <g>
        {[...Array(8)].map((_, i) => (
          <motion.polygon key={i} points={`${15 + i * 7},100 ${18 + i * 7},94 ${21 + i * 7},100`} fill="#64b5f6" opacity="0.6" animate={{ y: [0, -3, 0], opacity: [0.6, 0.3, 0.6] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </g>
    )
  },
  rainbow: {
    name: '🌈 Arcoíris',
    render: () => (
      <motion.g animate={{ opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
        {['#ff5722', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0'].map((color, i) => (
          <ellipse key={i} cx="35" cy="10" rx={40 - i * 4} ry={25 - i * 3} fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
        ))}
      </motion.g>
    )
  },
  galaxy: {
    name: '🌌 Galaxia',
    render: () => (
      <g>
        <motion.ellipse cx="35" cy="50" rx="45" ry="45" fill="url(#galaxyGradient)" opacity="0.4" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
        {[...Array(12)].map((_, i) => (
          <motion.circle key={i} cx={35 + Math.cos(i * 30 * Math.PI / 180) * (20 + Math.random() * 20)} cy={50 + Math.sin(i * 30 * Math.PI / 180) * (20 + Math.random() * 20)} r="1.5" fill="white" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }} />
        ))}
        <defs>
          <radialGradient id="galaxyGradient">
            <stop offset="0%" stopColor="#9c27b0" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#3f51b5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1a237e" stopOpacity="0" />
          </radialGradient>
        </defs>
      </g>
    )
  },
  hearts: {
    name: '💕 Corazones',
    render: () => (
      <g>
        {[...Array(5)].map((_, i) => (
          <motion.text key={i} x={10 + i * 12} y={20} fontSize="8" animate={{ y: [20, -10, 20], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}>❤️</motion.text>
        ))}
      </g>
    )
  },
  lightning: {
    name: '⚡ Relámpago',
    render: () => (
      <motion.g>
        <motion.path d="M35 0 L30 20 L40 20 L32 45 L45 18 L35 18 L42 0" fill="#ffeb3b" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.2, repeat: Infinity }} />
      </motion.g>
    )
  },
};

const PixelAvatar = memo(function PixelAvatar({ user, size = 'large', showLevel = true, showCoins = false, animation = 'idle' }) {
  if (user?.avatar_config?.engine !== 'legacy') {
    return <NeoPixelAvatar user={user} size={size} showLevel={showLevel} showCoins={showCoins} animation={animation} />;
  }
  const sizeMap = {
    tiny: { width: 32, height: 45 },
    small: { width: 50, height: 70 },
    medium: { width: 70, height: 100 },
    large: { width: 100, height: 140 },
    xlarge: { width: 140, height: 196 }
  };

  const { width, height } = sizeMap[size];
  const config = user?.avatar_config || {};
  const skin = skinTones[config.skinColor] || skinTones.light;
  const face = faceExpressions[config.face] || faceExpressions.happy;
  const hairStyle = hairStyles[config.hairStyle] || hairStyles.short;
  const hairColor = hairColors[config.hairColor] || hairColors.brown;
  const shirtStyle = shirtStyles[config.shirtStyle] || shirtStyles.tshirt;
  const shirtColor = config.shirtColor || clothingColors.purple;
  const pantsStyle = pantsStyles[config.pantsStyle] || pantsStyles.jeans;
  const pantsColor = config.pantsColor || clothingColors.blue;
  const shoesStyle = shoesStyles[config.shoesStyle] || shoesStyles.sneakers;
  const shoesColor = config.shoesColor || clothingColors.black;
  const beardStyle = config.beardStyle ? beardStyles[config.beardStyle] : null;

  const animations = {
    idle: { y: [0, -2, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    wave: { rotate: [0, -3, 3, -3, 0], transition: { duration: 0.5, repeat: Infinity } },
    dance: { y: [0, -6, 0], rotate: [0, 2, -2, 0], transition: { duration: 0.4, repeat: Infinity } },
    jump: { y: [0, -12, 0], scale: [1, 1.02, 1], transition: { duration: 0.5, repeat: Infinity } },
    sleep: { rotate: [0, 1, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    spin: { rotate: [0, 360], transition: { duration: 2, repeat: Infinity, ease: "linear" } },
    bounce: { y: [0, -8, 0, -4, 0], transition: { duration: 0.8, repeat: Infinity } },
    shake: { x: [-2, 2, -2, 2, 0], transition: { duration: 0.3, repeat: Infinity } },
    float: { y: [0, -6, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
    excited: { scale: [1, 1.05, 1], y: [0, -3, 0], transition: { duration: 0.3, repeat: Infinity } },
    none: {},
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div className="relative" whileHover={{ scale: 1.05 }}>
        <motion.svg width={width} height={height * 1.1} viewBox="-15 -10 100 130" style={{ imageRendering: 'auto' }} className="drop-shadow-xl" animate={animations[animation] || animations.idle}>
          {/* Definiciones de gradientes */}
          <defs>
            <linearGradient id="skinHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="black" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="shirtShade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="100%" stopColor="black" stopOpacity="0.2" />
            </linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="1" floodOpacity="0.2"/>
            </filter>
          </defs>
          
          {/* Efectos de fondo */}
          {config.effect && visualEffects[config.effect] && visualEffects[config.effect].render()}
          
          {/* Sombra del suelo */}
          <ellipse cx="35" cy="106" rx="18" ry="4" fill="rgba(0,0,0,0.2)" />
          
          {/* Mascotas */}
          {config.pet && pets[config.pet] && pets[config.pet].render(animation)}
          
          {/* Mochilas/Alas (detrás) */}
          {config.backpack && accessories.backpacks[config.backpack] && (config.backpack === 'wings' || config.backpack === 'jetpack' ? accessories.backpacks[config.backpack]() : accessories.backpacks[config.backpack](config.backpackColor || '#795548'))}
          
          {/* Zapatos con mejor detalle */}
          {shoesStyle.render(shoesColor)}
          
          {/* Pantalones con mejor forma */}
          {pantsStyle.render(pantsColor)}
          
          {/* Camisa/cuerpo */}
          {shirtStyle.render(shirtColor)}
          
          {/* Bufanda */}
          {config.scarf && accessories.scarves[config.scarf] && accessories.scarves[config.scarf](config.scarfColor || '#e74c3c')}
          
          {/* Guantes */}
          {config.gloves && accessories.gloves[config.gloves] && accessories.gloves[config.gloves](config.glovesColor || '#1a1a1a')}
          
          {/* Cuello mejorado */}
          <ellipse cx="35" cy="50" rx="7" ry="4" fill={skin.base} />
          <ellipse cx="35" cy="50" rx="7" ry="4" fill="url(#skinHighlight)" />
          
          {/* Cabeza con forma más redondeada y natural */}
          <ellipse cx="35" cy="30" rx="18" ry="20" fill={skin.base} filter="url(#softShadow)" />
          <ellipse cx="35" cy="30" rx="18" ry="20" fill="url(#skinHighlight)" />
          
          {/* Orejas con más detalle */}
          <ellipse cx="16" cy="32" rx="4" ry="6" fill={skin.base} />
          <ellipse cx="17" cy="32" rx="2" ry="3" fill={skin.shadow} opacity="0.3" />
          <ellipse cx="54" cy="32" rx="4" ry="6" fill={skin.base} />
          <ellipse cx="53" cy="32" rx="2" ry="3" fill={skin.shadow} opacity="0.3" />
          
          {/* Mejillas sonrojadas */}
          <ellipse cx="22" cy="36" rx="5" ry="3" fill={skin.blush} opacity="0.4" />
          <ellipse cx="48" cy="36" rx="5" ry="3" fill={skin.blush} opacity="0.4" />
          
          {/* Sombra suave en la cara */}
          <ellipse cx="45" cy="32" rx="8" ry="12" fill={skin.shadow} opacity="0.15" />
          
          {/* Ojos y boca de la expresión */}
          {face.eyes(29, 26)}
          {face.mouth(29, 26)}
          
          {/* Cabello */}
          {hairStyle.render && hairStyle.render(hairColor.base, hairColor.shadow)}
          
          {/* Barba */}
          {beardStyle && beardStyle.render && beardStyle.render(config.beardColor || '#654321')}
          
          {/* Sombreros */}
          {config.hat && accessories.hats[config.hat] && accessories.hats[config.hat](config.hatColor || '#3498db')}
          
          {/* Gafas */}
          {config.glasses && accessories.glasses[config.glasses] && accessories.glasses[config.glasses](29, 28)}

          {/* Tatuajes */}
          {config.tattoo && tattoos[config.tattoo] && tattoos[config.tattoo](skin.base)}

          {/* Piercings */}
          {config.piercing && piercings[config.piercing] && piercings[config.piercing](config.piercingColor)}

          {/* Efectos especiales adicionales */}
          {config.effect === 'sparkle' && visualEffects.sparkle.render()}
          {config.effect === 'hearts' && visualEffects.hearts.render()}
          
          {/* ZZZ para dormir */}
          {animation === 'sleep' && (
            <g>
              <motion.text x="52" y="12" fill="#666" fontSize="8" fontWeight="bold" animate={{ opacity: [0, 1, 0], y: [12, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>Z</motion.text>
              <motion.text x="56" y="6" fill="#888" fontSize="6" fontWeight="bold" animate={{ opacity: [0, 1, 0], y: [8, 2, -4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>z</motion.text>
            </g>
          )}
        </motion.svg>
        {showLevel && (
          <motion.div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white" style={{ width: size === 'tiny' ? 14 : size === 'small' ? 18 : size === 'medium' ? 24 : size === 'xlarge' ? 36 : 28, height: size === 'tiny' ? 14 : size === 'small' ? 18 : size === 'medium' ? 24 : size === 'xlarge' ? 36 : 28, fontSize: size === 'tiny' ? 7 : size === 'small' ? 8 : size === 'medium' ? 10 : size === 'xlarge' ? 14 : 11 }} initial={{ scale: 0 }} animate={{ scale: 1 }}>
            {user?.level || 1}
          </motion.div>
        )}
      </motion.div>
      {showLevel && (
        <motion.div className="flex flex-col items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-1.5 text-xs font-bold bg-white/80 px-3 py-1.5 rounded-full shadow border border-violet-200">
            <Sparkles className="w-3 h-3 text-violet-600" />
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Nivel {user?.level || 1}</span>
          </div>
          {showCoins && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full shadow border border-amber-200">
              <span>💰</span>
              <span>{user?.coins || 0}</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
});

export default PixelAvatar;
export { skinTones, faceExpressions, hairStyles, hairColors, shirtStyles, pantsStyles, shoesStyles, clothingColors, accessories, pets, visualEffects, tattoos, piercings, beardStyles };