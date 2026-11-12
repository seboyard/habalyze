import { adjustColor } from './AvatarSkinTones';

// ============ CLOTHING COLORS ============
export const clothingColors = {
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
export const shirtStyles = {
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
export const pantsStyles = {
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
export const shoesStyles = {
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