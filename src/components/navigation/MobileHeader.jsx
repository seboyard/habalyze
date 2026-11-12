import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import NotificationBell from '@/components/notifications/NotificationBell';

const HabalyzeLogo = () => (
  <div className="w-8 h-8 relative flex-shrink-0">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl shadow-lg" />
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/30 rounded-xl" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
        <rect x="15" y="20" width="12" height="60" rx="6" fill="white" />
        <rect x="73" y="20" width="12" height="60" rx="6" fill="white" />
        <rect x="27" y="40" width="46" height="12" rx="6" fill="white" />
        <rect x="35" y="60" width="8" height="20" rx="4" fill="rgba(255,255,255,0.7)" />
        <rect x="46" y="50" width="8" height="30" rx="4" fill="rgba(255,255,255,0.8)" />
        <rect x="57" y="35" width="8" height="45" rx="4" fill="rgba(255,255,255,0.9)" />
      </svg>
    </div>
  </div>
);

const rootRoutes = [
  '/dashboard', '/projects', '/social', '/profile',
  '/coach', '/shop', '/achievements', '/leaderboard',
  '/challenges', '/statistics', '/missions', '/perks',
  '/guilds', '/gifts', '/objectives', '/inventory',
  '/premium', '/notifications', '/settings', '/blog',
  '/habitlibrary', '/documentation', '/avatar', '/'
];

const pageTitles = {
  '/blogpost': 'Artículo',
  '/invitationstats': 'Invitaciones',
  '/buycoins': 'Comprar Monedas',
  '/buygems': 'Comprar Gemas',
  '/adminpanel': 'Panel Admin',
};

export default function MobileHeader({ onMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const isRootRoute = rootRoutes.some(r => path === r || path === r + '/');
  
  const pageTitle = pageTitles[path] || null;

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center h-14 px-2">
        {!isRootRoute ? (
          /* Child route: back button + title */
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="min-h-[44px] min-w-[44px] -ml-1 gap-1 text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Volver</span>
            </Button>
            {pageTitle && (
              <span className="ml-2 text-base font-semibold text-gray-800 truncate">{pageTitle}</span>
            )}
          </>
        ) : (
          /* Root route: logo + app name */
          <div className="flex items-center gap-2">
            <HabalyzeLogo />
            <span className="text-lg font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              Habalyze
            </span>
          </div>
        )}

        {/* Right side actions - always visible on root, only bell on child */}
        <div className="ml-auto flex items-center gap-1">
          <NotificationBell />
          {isRootRoute && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuOpen}
              className="min-h-[44px] min-w-[44px]"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}