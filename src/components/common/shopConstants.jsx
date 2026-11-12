export const rarityConfig = {
  common: { color: 'bg-gray-100 text-gray-700 border-gray-300', glow: '', label: 'Común' },
  rare: { color: 'bg-blue-100 text-blue-700 border-blue-300', glow: 'ring-2 ring-blue-200', label: 'Raro' },
  epic: { color: 'bg-purple-100 text-purple-700 border-purple-300', glow: 'ring-2 ring-purple-200', label: 'Épico' },
  legendary: { color: 'bg-amber-100 text-amber-700 border-amber-300', glow: 'ring-2 ring-amber-200 shadow-amber-200/50 shadow-lg', label: 'Legendario' },
  exclusive: { color: 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-pink-300', glow: 'ring-2 ring-pink-200 animate-pulse', label: 'Exclusivo' },
};

export const colorPalette = [
  '#e74c3c', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
  '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e',
  '#607d8b', '#1a1a1a', '#ffffff', '#f5f5dc',
];

export const shopCategories = [
  { id: 'all', label: 'Todo', icon: '✨' },
  { id: 'hair', label: 'Pelo', icon: '💇' },
  { id: 'shirt', label: 'Arriba', icon: '👕' },
  { id: 'pants', label: 'Abajo', icon: '👖' },
  { id: 'shoes', label: 'Calzado', icon: '👟' },
  { id: 'hat', label: 'Cabeza', icon: '🎩' },
  { id: 'backpack', label: 'Espalda', icon: '🦋' },
  { id: 'hand', label: 'En la mano', icon: '📖' },
  { id: 'pet', label: 'Mascotas', icon: '🐾' },
  { id: 'effect', label: 'Auras', icon: '✨' },
  { id: 'packs', label: 'Packs', icon: '📦' },
  { id: 'lootbox', label: 'Cofre', icon: '🎁' },
];

export const categoryFieldMap = {
  hat: { field: 'headwear', colorField: 'hatColor' },
  hair: { field: 'hair', colorField: 'hairColor' },
  shirt: { field: 'upper', colorField: 'shirtColor' },
  pants: { field: 'lower', colorField: 'pantsColor' },
  shoes: { field: 'shoes', colorField: 'shoesColor' },
  glasses: { field: 'glasses', colorField: 'glassesColor' },
  scarf: { field: 'scarf', colorField: 'scarfColor' },
  gloves: { field: 'gloves', colorField: 'glovesColor' },
  backpack: { field: 'backpack', colorField: 'backpackColor' },
  pet: { field: 'pet', colorField: 'petColor' },
  effect: { field: 'aura', colorField: 'effectColor' },
  hand: { field: 'hand', colorField: 'handColor' },
  tattoo: { field: 'tattoo', colorField: 'tattooColor' },
  piercing: { field: 'piercing', colorField: 'piercingColor' },
  face: { field: 'expression', colorField: 'faceColor' },
};