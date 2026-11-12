import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Copy, Check, Palette, Layers, Sparkles, Image } from 'lucide-react';
import { toast } from 'sonner';

// ─── Color Palette ─────────────────────────────────────────────────────────────
const colorPalette = [
  { name: 'Purple Primary', hex: '#7c3aed', usage: 'Color principal, botones, CTAs' },
  { name: 'Purple Medium', hex: '#a855f7', usage: 'Gradientes, hover states' },
  { name: 'Fuchsia Accent', hex: '#ec4899', usage: 'Acentos, gradientes secundarios' },
  { name: 'Violet Dark', hex: '#5b21b6', usage: 'Textos sobre fondo claro' },
  { name: 'Pink Light', hex: '#f9a8d4', usage: 'Fondos suaves, badges' },
  { name: 'Purple BG', hex: '#faf5ff', usage: 'Fondos de secciones' },
  { name: 'Gold Coins', hex: '#f59e0b', usage: 'Monedas, XP rewards' },
  { name: 'Amber Warm', hex: '#d97706', usage: 'Iconos de monedas oscuros' },
  { name: 'Blue Gems', hex: '#3b82f6', usage: 'Gemas, achievements raros' },
  { name: 'Cyan Gems', hex: '#06b6d4', usage: 'Gemas premium, efectos' },
  { name: 'Green Success', hex: '#22c55e', usage: 'Completado, streaks activos' },
  { name: 'Emerald Dark', hex: '#16a34a', usage: 'Textos de éxito' },
  { name: 'Red Danger', hex: '#ef4444', usage: 'Errores, días perdidos' },
  { name: 'Orange Streak', hex: '#f97316', usage: 'Contador de racha 🔥' },
  { name: 'Gray Text', hex: '#6b7280', usage: 'Texto secundario' },
  { name: 'Gray Dark', hex: '#1f2937', usage: 'Texto principal' },
  { name: 'White Pure', hex: '#ffffff', usage: 'Fondos, tarjetas' },
  { name: 'Gray Light', hex: '#f3f4f6', usage: 'Fondos alternos' },
];

// ─── SVG Logos ─────────────────────────────────────────────────────────────────
const logoVariants = [
  {
    id: 'full_color',
    name: 'Logo Completo Color',
    bg: 'white',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="50%" style="stop-color:#a855f7"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>
  <rect x="0" y="8" width="44" height="44" rx="12" fill="url(#grad1)"/>
  <rect x="9" y="16" width="5" height="26" rx="2.5" fill="white"/>
  <rect x="30" y="16" width="5" height="26" rx="2.5" fill="white"/>
  <rect x="14" y="24" width="22" height="5" rx="2.5" fill="white"/>
  <rect x="17" y="32" width="3" height="10" rx="1.5" fill="rgba(255,255,255,0.7)"/>
  <rect x="22" y="28" width="3" height="14" rx="1.5" fill="rgba(255,255,255,0.85)"/>
  <rect x="27" y="22" width="3" height="18" rx="1.5" fill="rgba(255,255,255,0.95)"/>
  <text x="56" y="34" font-family="system-ui,-apple-system,sans-serif" font-size="26" font-weight="900" fill="#7c3aed" letter-spacing="-1">Habalyze</text>
  <text x="57" y="48" font-family="system-ui,-apple-system,sans-serif" font-size="11" fill="#9ca3af" letter-spacing="0.3">Analiza. Mejora. Conquista.</text>
</svg>`,
  },
  {
    id: 'dark',
    name: 'Logo Dark',
    bg: '#1f2937',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>
  <rect x="0" y="8" width="44" height="44" rx="12" fill="url(#grad2)"/>
  <rect x="9" y="16" width="5" height="26" rx="2.5" fill="white"/>
  <rect x="30" y="16" width="5" height="26" rx="2.5" fill="white"/>
  <rect x="14" y="24" width="22" height="5" rx="2.5" fill="white"/>
  <rect x="17" y="32" width="3" height="10" rx="1.5" fill="rgba(255,255,255,0.7)"/>
  <rect x="22" y="28" width="3" height="14" rx="1.5" fill="rgba(255,255,255,0.85)"/>
  <rect x="27" y="22" width="3" height="18" rx="1.5" fill="rgba(255,255,255,0.95)"/>
  <text x="56" y="34" font-family="system-ui,-apple-system,sans-serif" font-size="26" font-weight="900" fill="white" letter-spacing="-1">Habalyze</text>
  <text x="57" y="48" font-family="system-ui,-apple-system,sans-serif" font-size="11" fill="#6b7280">Analiza. Mejora. Conquista.</text>
</svg>`,
  },
  {
    id: 'icon_only',
    name: 'Ícono Solo',
    bg: 'white',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <defs>
    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="50%" style="stop-color:#a855f7"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="80" height="80" rx="20" fill="url(#grad3)"/>
  <rect x="16" y="20" width="8" height="40" rx="4" fill="white"/>
  <rect x="56" y="20" width="8" height="40" rx="4" fill="white"/>
  <rect x="24" y="32" width="32" height="8" rx="4" fill="white"/>
  <rect x="28" y="44" width="5" height="16" rx="2.5" fill="rgba(255,255,255,0.7)"/>
  <rect x="36" y="38" width="5" height="22" rx="2.5" fill="rgba(255,255,255,0.85)"/>
  <rect x="44" y="32" width="5" height="28" rx="2.5" fill="rgba(255,255,255,0.95)"/>
</svg>`,
  },
  {
    id: 'white',
    name: 'Logo Blanco',
    bg: 'url(#bgGrad)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="240" height="60" rx="12" fill="url(#bgGrad)"/>
  <rect x="8" y="9" width="44" height="44" rx="10" fill="rgba(255,255,255,0.15)"/>
  <rect x="17" y="17" width="5" height="26" rx="2.5" fill="white"/>
  <rect x="38" y="17" width="5" height="26" rx="2.5" fill="white"/>
  <rect x="22" y="25" width="22" height="5" rx="2.5" fill="white"/>
  <rect x="25" y="33" width="3" height="10" rx="1.5" fill="rgba(255,255,255,0.7)"/>
  <rect x="30" y="29" width="3" height="14" rx="1.5" fill="rgba(255,255,255,0.85)"/>
  <rect x="35" y="23" width="3" height="18" rx="1.5" fill="rgba(255,255,255,0.95)"/>
  <text x="64" y="33" font-family="system-ui,-apple-system,sans-serif" font-size="24" font-weight="900" fill="white" letter-spacing="-1">Habalyze</text>
  <text x="65" y="48" font-family="system-ui,-apple-system,sans-serif" font-size="10" fill="rgba(255,255,255,0.75)">Analiza. Mejora. Conquista.</text>
</svg>`,
  },
];

// ─── UI Badges / Components ────────────────────────────────────────────────────
const uiBadges = [
  {
    id: 'xp_badge',
    name: 'Badge XP',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="32" viewBox="0 0 80 32">
  <defs>
    <linearGradient id="xpg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="80" height="32" rx="16" fill="url(#xpg)"/>
  <text x="14" y="21" font-family="system-ui,sans-serif" font-size="13" font-weight="800" fill="white">⚡ 250 XP</text>
</svg>`,
  },
  {
    id: 'coins_badge',
    name: 'Badge Monedas',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="32" viewBox="0 0 80 32">
  <rect width="80" height="32" rx="16" fill="#f59e0b"/>
  <text x="10" y="21" font-family="system-ui,sans-serif" font-size="13" font-weight="800" fill="white">💰 1,250</text>
</svg>`,
  },
  {
    id: 'gems_badge',
    name: 'Badge Gemas',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="32" viewBox="0 0 80 32">
  <defs>
    <linearGradient id="gemsgrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="80" height="32" rx="16" fill="url(#gemsgrad)"/>
  <text x="10" y="21" font-family="system-ui,sans-serif" font-size="13" font-weight="800" fill="white">💎 48</text>
</svg>`,
  },
  {
    id: 'streak_badge',
    name: 'Badge Racha',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="32" viewBox="0 0 90 32">
  <defs>
    <linearGradient id="streakgrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f97316"/>
      <stop offset="100%" style="stop-color:#ef4444"/>
    </linearGradient>
  </defs>
  <rect width="90" height="32" rx="16" fill="url(#streakgrad)"/>
  <text x="10" y="21" font-family="system-ui,sans-serif" font-size="13" font-weight="800" fill="white">🔥 21 días</text>
</svg>`,
  },
  {
    id: 'level_badge',
    name: 'Badge Nivel',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="32" viewBox="0 0 80 32">
  <defs>
    <linearGradient id="lvlgrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f59e0b"/>
      <stop offset="100%" style="stop-color:#d97706"/>
    </linearGradient>
  </defs>
  <rect width="80" height="32" rx="16" fill="url(#lvlgrad)"/>
  <text x="12" y="21" font-family="system-ui,sans-serif" font-size="13" font-weight="800" fill="white">⭐ Nv. 14</text>
</svg>`,
  },
  {
    id: 'premium_badge',
    name: 'Badge Premium',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="32" viewBox="0 0 100 32">
  <defs>
    <linearGradient id="premgrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#d97706"/>
      <stop offset="50%" style="stop-color:#f59e0b"/>
      <stop offset="100%" style="stop-color:#fbbf24"/>
    </linearGradient>
  </defs>
  <rect width="100" height="32" rx="16" fill="url(#premgrad)"/>
  <text x="14" y="21" font-family="system-ui,sans-serif" font-size="13" font-weight="800" fill="white">👑 PREMIUM</text>
</svg>`,
  },
  {
    id: 'habit_complete',
    name: 'Hábito Completado',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="56" viewBox="0 0 180 56">
  <rect width="180" height="56" rx="16" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
  <circle cx="28" cy="28" r="16" fill="#22c55e"/>
  <path d="M20 28 L25 34 L36 22" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <text x="52" y="24" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#15803d">Meditación</text>
  <text x="52" y="42" font-family="system-ui,sans-serif" font-size="11" fill="#86efac">+20 XP · +10 💰</text>
</svg>`,
  },
  {
    id: 'streak_milestone',
    name: 'Milestone Racha',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
  <defs>
    <linearGradient id="milgrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="200" height="80" rx="20" fill="url(#milgrad)"/>
  <text x="24" y="32" font-family="system-ui,sans-serif" font-size="22">🔥</text>
  <text x="56" y="30" font-family="system-ui,sans-serif" font-size="16" font-weight="900" fill="white">¡30 días seguidos!</text>
  <text x="56" y="52" font-family="system-ui,sans-serif" font-size="12" fill="rgba(255,255,255,0.8)">Racha legendaria desbloqueada</text>
  <text x="24" y="68" font-family="system-ui,sans-serif" font-size="11" fill="rgba(255,255,255,0.6)">+500 XP · +200 💰 · Caja Épica 🎁</text>
</svg>`,
  },
];

// ─── App Icons ─────────────────────────────────────────────────────────────────
const appIcons = [
  {
    id: 'habits_icon',
    name: 'Hábitos',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="24" fill="#f3e8ff"/>
  <path d="M16 24 L21 30 L32 18" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="24" cy="24" r="14" fill="none" stroke="#7c3aed" stroke-width="2" opacity="0.3"/>
</svg>`,
  },
  {
    id: 'streak_icon',
    name: 'Racha',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="24" fill="#fff7ed"/>
  <path d="M24 8 Q20 16 22 20 Q18 18 18 22 Q18 30 24 36 Q30 30 30 22 Q30 18 26 20 Q28 16 24 8Z" fill="#f97316"/>
  <ellipse cx="24" cy="34" rx="5" ry="2" fill="#fb923c" opacity="0.5"/>
</svg>`,
  },
  {
    id: 'goals_icon',
    name: 'Objetivos',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="24" fill="#ecfdf5"/>
  <circle cx="24" cy="24" r="14" fill="none" stroke="#22c55e" stroke-width="2.5"/>
  <circle cx="24" cy="24" r="9" fill="none" stroke="#22c55e" stroke-width="2"/>
  <circle cx="24" cy="24" r="4" fill="#22c55e"/>
  <line x1="24" y1="6" x2="24" y2="12" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
  <line x1="24" y1="36" x2="24" y2="42" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: 'xp_icon',
    name: 'XP / Nivel',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="xpi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="24" fill="url(#xpi)"/>
  <path d="M14 30 L20 14 L24 22 L28 14 L34 30" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`,
  },
  {
    id: 'coins_icon',
    name: 'Monedas',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="24" fill="#fffbeb"/>
  <circle cx="24" cy="24" r="14" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>
  <circle cx="24" cy="24" r="10" fill="#fbbf24"/>
  <text x="24" y="29" font-family="system-ui,sans-serif" font-size="14" font-weight="900" fill="#92400e" text-anchor="middle">$</text>
</svg>`,
  },
  {
    id: 'gems_icon',
    name: 'Gemas',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="24" fill="#eff6ff"/>
  <polygon points="24,10 34,18 30,32 18,32 14,18" fill="#3b82f6" stroke="#2563eb" stroke-width="1"/>
  <polygon points="24,14 30,19 27,28 21,28 18,19" fill="#60a5fa"/>
  <line x1="24" y1="14" x2="24" y2="28" stroke="white" stroke-width="1" opacity="0.4"/>
</svg>`,
  },
  {
    id: 'coach_icon',
    name: 'Coach IA',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="coi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="24" fill="url(#coi)"/>
  <ellipse cx="24" cy="22" rx="10" ry="8" fill="none" stroke="white" stroke-width="2"/>
  <circle cx="19" cy="21" r="1.5" fill="white"/>
  <circle cx="29" cy="21" r="1.5" fill="white"/>
  <path d="M20 25 Q24 28 28 25" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M14 30 L14 36 L18 34 L22 38 L24 30" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: 'social_icon',
    name: 'Social',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="24" fill="#fdf4ff"/>
  <circle cx="18" cy="20" r="5" fill="#a855f7"/>
  <circle cx="30" cy="20" r="5" fill="#7c3aed"/>
  <path d="M10 36 Q10 28 18 28 Q22 28 24 30 Q26 28 30 28 Q38 28 38 36" fill="#c084fc" opacity="0.5"/>
</svg>`,
  },
  {
    id: 'shop_icon',
    name: 'Tienda',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="24" fill="#fff7ed"/>
  <path d="M14 16 L16 26 L32 26 L34 16 Z" fill="#f97316" opacity="0.2" stroke="#f97316" stroke-width="1.5"/>
  <rect x="16" y="26" width="16" height="12" rx="3" fill="#f97316"/>
  <rect x="20" y="30" width="4" height="6" rx="2" fill="white"/>
  <path d="M18 16 Q18 12 24 12 Q30 12 30 16" stroke="#f97316" stroke-width="2" fill="none"/>
</svg>`,
  },
  {
    id: 'achievement_icon',
    name: 'Logros',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="24" fill="#fffbeb"/>
  <polygon points="24,10 27,20 38,20 29,26 32,37 24,31 16,37 19,26 10,20 21,20" fill="#f59e0b"/>
  <polygon points="24,14 26,21 33,21 27,25 29,33 24,29 19,33 21,25 15,21 22,21" fill="#fbbf24"/>
</svg>`,
  },
];

// ─── Avatar Previews ────────────────────────────────────────────────────────────
const avatarPreviews = [
  {
    id: 'default_avatar',
    name: 'Avatar Base',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="130" viewBox="-15 -10 100 130">
  <defs>
    <linearGradient id="av1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>
  <!-- Shoes -->
  <rect x="20" y="96" width="14" height="6" rx="2" fill="#212121"/>
  <rect x="36" y="96" width="14" height="6" rx="2" fill="#212121"/>
  <!-- Pants -->
  <rect x="22" y="78" width="12" height="20" fill="#2196f3"/>
  <rect x="36" y="78" width="12" height="20" fill="#2196f3"/>
  <!-- Shirt -->
  <rect x="20" y="52" width="30" height="28" fill="url(#av1)"/>
  <rect x="14" y="54" width="8" height="18" fill="url(#av1)"/>
  <rect x="48" y="54" width="8" height="18" fill="url(#av1)"/>
  <!-- Neck -->
  <ellipse cx="35" cy="50" rx="7" ry="4" fill="#FED6A8"/>
  <!-- Head -->
  <ellipse cx="35" cy="30" rx="18" ry="20" fill="#FED6A8"/>
  <!-- Ears -->
  <ellipse cx="16" cy="32" rx="4" ry="6" fill="#FED6A8"/>
  <ellipse cx="54" cy="32" rx="4" ry="6" fill="#FED6A8"/>
  <!-- Hair -->
  <rect x="20" y="8" width="30" height="8" fill="#3d2314"/>
  <rect x="18" y="12" width="4" height="8" fill="#3d2314"/>
  <rect x="48" y="12" width="4" height="8" fill="#3d2314"/>
  <!-- Eyes -->
  <rect x="25" y="26" width="3" height="4" fill="#1a1a2e"/>
  <rect x="25" y="26" width="1" height="1" fill="white"/>
  <rect x="41" y="26" width="3" height="4" fill="#1a1a2e"/>
  <rect x="41" y="26" width="1" height="1" fill="white"/>
  <!-- Blush -->
  <ellipse cx="22" cy="36" rx="5" ry="3" fill="#FFB3BA" opacity="0.4"/>
  <ellipse cx="48" cy="36" rx="5" ry="3" fill="#FFB3BA" opacity="0.4"/>
  <!-- Smile -->
  <rect x="31" y="38" width="2" height="1" fill="#e74c3c"/>
  <rect x="33" y="39" width="4" height="1" fill="#e74c3c"/>
  <rect x="37" y="38" width="2" height="1" fill="#e74c3c"/>
  <!-- Shadow -->
  <ellipse cx="35" cy="106" rx="18" ry="4" fill="rgba(0,0,0,0.15)"/>
</svg>`,
  },
  {
    id: 'crown_avatar',
    name: 'Avatar Premium',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="130" viewBox="-15 -10 100 130">
  <defs>
    <linearGradient id="av2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d97706"/>
      <stop offset="100%" style="stop-color:#f59e0b"/>
    </linearGradient>
  </defs>
  <rect x="20" y="96" width="14" height="6" rx="2" fill="#1a1a1a"/>
  <rect x="36" y="96" width="14" height="6" rx="2" fill="#1a1a1a"/>
  <rect x="22" y="78" width="12" height="20" fill="#1f2937"/>
  <rect x="36" y="78" width="12" height="20" fill="#1f2937"/>
  <rect x="20" y="52" width="30" height="28" fill="#1f2937"/>
  <rect x="14" y="54" width="8" height="18" fill="#1f2937"/>
  <rect x="48" y="54" width="8" height="18" fill="#1f2937"/>
  <ellipse cx="35" cy="50" rx="7" ry="4" fill="#D4A574"/>
  <ellipse cx="35" cy="30" rx="18" ry="20" fill="#D4A574"/>
  <ellipse cx="16" cy="32" rx="4" ry="6" fill="#D4A574"/>
  <ellipse cx="54" cy="32" rx="4" ry="6" fill="#D4A574"/>
  <!-- Crown -->
  <rect x="20" y="4" width="30" height="12" fill="#ffd700"/>
  <rect x="18" y="8" width="4" height="10" fill="#ffd700"/>
  <rect x="48" y="8" width="4" height="10" fill="#ffd700"/>
  <rect x="22" y="0" width="4" height="6" fill="#ffd700"/>
  <rect x="32" y="-4" width="6" height="10" fill="#ffd700"/>
  <rect x="44" y="0" width="4" height="6" fill="#ffd700"/>
  <circle cx="35" cy="0" r="3" fill="#e74c3c"/>
  <rect x="25" y="26" width="3" height="4" fill="#1a1a2e"/>
  <rect x="41" y="26" width="3" height="4" fill="#1a1a2e"/>
  <rect x="31" y="38" width="2" height="1" fill="#e74c3c"/>
  <rect x="33" y="39" width="4" height="1" fill="#e74c3c"/>
  <rect x="37" y="38" width="2" height="1" fill="#e74c3c"/>
  <ellipse cx="35" cy="106" rx="18" ry="4" fill="rgba(0,0,0,0.15)"/>
</svg>`,
  },
];

// ─── Helper ────────────────────────────────────────────────────────────────────
function downloadSVG(svgString, filename) {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPNG(svgString, filename, width = 200, height = 200) {
  const img = new Image();
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob((pngBlob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(pngBlob);
      a.download = filename;
      a.click();
    });
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function CopyButton({ text, label = 'Copiar' }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copiado' : label}
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function BrandExportTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Brand Export Kit</h2>
          <p className="text-gray-400 text-sm">Descarga todos los assets de marca para Canva y redes sociales</p>
        </div>
      </div>

      <Tabs defaultValue="colors">
        <TabsList className="bg-white/10 border-white/20 flex-wrap h-auto gap-1">
          <TabsTrigger value="colors" className="data-[state=active]:bg-white/20 text-white text-xs">
            <Palette className="w-3.5 h-3.5 mr-1.5" />Colores
          </TabsTrigger>
          <TabsTrigger value="logos" className="data-[state=active]:bg-white/20 text-white text-xs">
            <Image className="w-3.5 h-3.5 mr-1.5" />Logos
          </TabsTrigger>
          <TabsTrigger value="icons" className="data-[state=active]:bg-white/20 text-white text-xs">
            <Layers className="w-3.5 h-3.5 mr-1.5" />Íconos
          </TabsTrigger>
          <TabsTrigger value="badges" className="data-[state=active]:bg-white/20 text-white text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />Badges UI
          </TabsTrigger>
          <TabsTrigger value="avatars" className="data-[state=active]:bg-white/20 text-white text-xs">
            <Image className="w-3.5 h-3.5 mr-1.5" />Avatares
          </TabsTrigger>
        </TabsList>

        {/* ─── COLORS ─── */}
        <TabsContent value="colors" className="mt-4">
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Paleta de Colores Oficial</h3>
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-xs"
                onClick={() => {
                  const text = colorPalette.map(c => `${c.name}: ${c.hex} — ${c.usage}`).join('\n');
                  navigator.clipboard.writeText(text);
                  toast.success('Paleta copiada');
                }}
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copiar toda la paleta
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {colorPalette.map((color) => (
                <div key={color.hex} className="group rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                  <div
                    className="h-16 w-full flex items-end justify-end p-2"
                    style={{ backgroundColor: color.hex }}
                  >
                    <CopyButton text={color.hex} label={color.hex} />
                  </div>
                  <div className="p-3">
                    <p className="text-white font-semibold text-sm">{color.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Canva gradient text */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white font-semibold mb-2 text-sm">🎨 Gradiente Principal Habalyze</p>
              <div className="h-12 rounded-xl mb-3" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)' }} />
              <CopyButton text="linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)" label="Copiar CSS del gradiente" />
            </div>
          </Card>
        </TabsContent>

        {/* ─── LOGOS ─── */}
        <TabsContent value="logos" className="mt-4">
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Variantes del Logo</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {logoVariants.map((logo) => (
                <div key={logo.id} className="rounded-xl border border-white/10 overflow-hidden">
                  <div
                    className="p-6 flex items-center justify-center min-h-[100px]"
                    style={{ background: logo.bg === 'white' ? '#ffffff' : logo.bg === '#1f2937' ? '#1f2937' : 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
                    dangerouslySetInnerHTML={{ __html: logo.svg }}
                  />
                  <div className="p-3 bg-white/5 flex items-center justify-between">
                    <p className="text-white text-sm font-medium">{logo.name}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 text-xs h-7 px-2"
                        onClick={() => { downloadSVG(logo.svg, `habalyze-${logo.id}.svg`); toast.success('SVG descargado'); }}
                      >
                        <Download className="w-3 h-3 mr-1" />SVG
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 text-xs h-7 px-2"
                        onClick={() => { downloadPNG(logo.svg, `habalyze-${logo.id}.png`, 480, 120); toast.success('PNG descargado'); }}
                      >
                        <Download className="w-3 h-3 mr-1" />PNG
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ─── ICONS ─── */}
        <TabsContent value="icons" className="mt-4">
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Íconos de la App</h3>
              <Badge className="bg-purple-500/20 text-purple-300 text-xs">{appIcons.length} íconos</Badge>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {appIcons.map((icon) => (
                <div key={icon.id} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                  <div dangerouslySetInnerHTML={{ __html: icon.svg }} />
                  <p className="text-white text-xs font-medium text-center">{icon.name}</p>
                  <div className="flex gap-1">
                    <button
                      className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white"
                      onClick={() => { downloadSVG(icon.svg, `habalyze-icon-${icon.id}.svg`); toast.success('SVG descargado'); }}
                    >SVG</button>
                    <button
                      className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white"
                      onClick={() => { downloadPNG(icon.svg, `habalyze-icon-${icon.id}.png`, 96, 96); toast.success('PNG descargado'); }}
                    >PNG</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ─── BADGES ─── */}
        <TabsContent value="badges" className="mt-4">
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Componentes UI — Badges y Cards</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {uiBadges.map((badge) => (
                <div key={badge.id} className="rounded-xl border border-white/10 overflow-hidden">
                  <div className="p-6 flex items-center justify-center bg-gray-100 min-h-[80px]" dangerouslySetInnerHTML={{ __html: badge.svg }} />
                  <div className="p-3 bg-white/5 flex items-center justify-between">
                    <p className="text-white text-sm font-medium">{badge.name}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 text-xs h-7 px-2"
                        onClick={() => { downloadSVG(badge.svg, `habalyze-badge-${badge.id}.svg`); toast.success('SVG descargado'); }}
                      >
                        <Download className="w-3 h-3 mr-1" />SVG
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 text-xs h-7 px-2"
                        onClick={() => {
                          const w = parseInt(badge.svg.match(/width="(\d+)"/)?.[1] || '200');
                          const h = parseInt(badge.svg.match(/height="(\d+)"/)?.[1] || '80');
                          downloadPNG(badge.svg, `habalyze-badge-${badge.id}.png`, w, h);
                          toast.success('PNG descargado');
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />PNG
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ─── AVATARS ─── */}
        <TabsContent value="avatars" className="mt-4">
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <h3 className="text-lg font-bold text-white mb-2">Avatares del Juego</h3>
            <p className="text-gray-400 text-sm mb-4">Los PNG se exportan con fondo transparente (2x resolución).</p>
            <div className="grid md:grid-cols-2 gap-4">
              {avatarPreviews.map((av) => (
                <div key={av.id} className="rounded-xl border border-white/10 overflow-hidden">
                  <div className="p-6 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 min-h-[160px]" dangerouslySetInnerHTML={{ __html: av.svg }} />
                  <div className="p-3 bg-white/5 flex items-center justify-between">
                    <p className="text-white text-sm font-medium">{av.name}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 text-xs h-7 px-2"
                        onClick={() => { downloadSVG(av.svg, `habalyze-avatar-${av.id}.svg`); toast.success('SVG descargado'); }}
                      >
                        <Download className="w-3 h-3 mr-1" />SVG
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 text-xs h-7 px-2"
                        onClick={() => { downloadPNG(av.svg, `habalyze-avatar-${av.id}.png`, 200, 260); toast.success('PNG 2x descargado'); }}
                      >
                        <Download className="w-3 h-3 mr-1" />PNG 2x
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl text-sm text-blue-300">
              💡 Para exportar avatares de usuarios reales con su configuración personalizada, usa el <strong>Brand Studio → Avatar Generator</strong>.
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}