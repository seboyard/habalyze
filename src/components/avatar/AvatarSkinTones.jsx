// ============ SKIN COLORS (20 tonos) ============
export const skinTones = {
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

// ============ HELPER FUNCTION ============
export function adjustColor(hex, amount) {
  if (!hex || hex.startsWith('url')) return hex;
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}