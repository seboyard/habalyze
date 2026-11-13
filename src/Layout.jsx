import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';
import './components/i18n/config';
import ErrorBoundary from './components/common/ErrorBoundary';
import { createPageUrl } from '@/utils';
import { Brain, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './components/notifications/NotificationBell';
import { MobileNavigationMenu, navigationCategories, coachItem } from './components/navigation/NavigationCategories';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/common/SEO';
import PixelAvatar from './components/avatar/PixelAvatar';
import MobileHeader from './components/navigation/MobileHeader';
import GlobalCoach from './components/coach/GlobalCoach';

const HabalyzeLogo = () => (
  <div className="w-10 h-10 relative">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl shadow-lg" />
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/30 rounded-xl" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
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

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await db.auth.me();
        setCurrentUser(user);
      } catch (e) {
        // Not logged in
      }
    };
    if (currentPageName !== 'Landing' && currentPageName !== 'PrivacyPolicy') {
      loadUser();
    }
  }, [currentPageName]);

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friend-requests-count', currentUser?.email],
    queryFn: () => db.entities.FriendRequest.filter({ to_user_email: currentUser?.email, status: 'pending' }),
    enabled: !!currentUser && currentPageName !== 'Landing',
    refetchInterval: 30000,
    staleTime: 30000,
    gcTime: 300000,
    placeholderData: [],
  });

  const pendingRequestsCount = friendRequests.length;

  // No mostrar layout en Landing y PrivacyPolicy
  if (currentPageName === 'Landing' || currentPageName === 'PrivacyPolicy' || currentPageName === 'Login') {
    return (
      <HelmetProvider>
        <ErrorBoundary>
          <SEO />
          {children}
        </ErrorBoundary>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <SEO title={`${currentPageName} - Habalyze`} />

        {/* Mobile slide-in menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <MobileNavigationMenu onClose={() => setShowMobileMenu(false)} />
          )}
        </AnimatePresence>

        {/* Mobile top header (hidden on desktop) */}
        <MobileHeader onMenuOpen={() => setShowMobileMenu(true)} />

        {/* Main content area */}
        <div
          className="habalyze-shell min-h-screen pb-20 lg:pb-0 lg:pt-[72px]"
          style={{ paddingTop: 'max(calc(env(safe-area-inset-top) + 3.5rem), 3.5rem)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.22 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>

          <Toaster richColors position="top-center" />

          {/* Coach IA siempre presente */}
          <GlobalCoach />

          {/* ── Mobile bottom navigation ── */}
          <nav
            className="fixed bottom-0 left-0 right-0 bg-[#FFF4DD]/95 backdrop-blur-lg border-t-2 border-[#2B1741] lg:hidden z-40"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-around h-16 px-1">

              {/* First half of main items */}
              {navigationCategories.main.slice(0, Math.floor(navigationCategories.main.length / 2)).map((item) => {
                const isActive = location.pathname === item.url;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.url}
                    onClick={(e) => {
                      if (isActive) {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={cn(
                      'flex flex-col items-center justify-center flex-1 h-full gap-0.5 min-h-[44px] transition-colors',
                      isActive ? 'text-[#693CA1]' : 'text-[#555267]'
                    )}
                  >
                    <div className={cn(
                      'p-1.5 rounded-xl transition-all',
                      isActive && 'bg-[#693CA1] shadow-[2px_2px_0_#2B1741]'
                    )}>
                      <Icon className={cn('w-5 h-5', isActive && 'text-white')} />
                    </div>
                    <span className="text-[10px] font-medium leading-none">{item.name}</span>
                  </Link>
                );
              })}

              {/* Coach IA - central featured button */}
              <Link
                to={coachItem.url}
                onClick={(e) => {
                  if (location.pathname === coachItem.url) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex flex-col items-center justify-center -mt-6 flex-shrink-0 min-h-[44px]"
              >
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-4 border-white',
                  location.pathname === coachItem.url
                    ? 'bg-[#693CA1]'
                    : 'bg-[#2B1741]'
                )}>
                  <Brain className="w-7 h-7 text-white drop-shadow" />
                </div>
                <span className="text-[10px] font-bold text-purple-600 mt-0.5">Coach IA</span>
              </Link>

              {/* Second half of main items */}
              {navigationCategories.main.slice(Math.floor(navigationCategories.main.length / 2)).map((item) => {
                const isActive = location.pathname === item.url;
                const Icon = item.icon;
                const showBadge = item.name === 'Social' && pendingRequestsCount > 0;
                return (
                  <Link
                    key={item.name}
                    to={item.url}
                    onClick={(e) => {
                      if (isActive) {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={cn(
                      'flex flex-col items-center justify-center flex-1 h-full gap-0.5 min-h-[44px] transition-colors',
                      isActive ? 'text-[#693CA1]' : 'text-[#555267]'
                    )}
                  >
                    <div className={cn(
                      'p-1.5 rounded-xl transition-all relative',
                      isActive && 'bg-[#693CA1] shadow-[2px_2px_0_#2B1741]'
                    )}>
                      <Icon className={cn('w-5 h-5', isActive && 'text-white')} />
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                          {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium leading-none">{item.name}</span>
                  </Link>
                );
              })}

            </div>
          </nav>

          {/* ── Desktop top navigation ── */}
          <nav className="hidden lg:flex fixed top-0 left-0 right-0 bg-[#FFF4DD]/95 backdrop-blur-xl border-b-2 border-[#2B1741] z-50 items-center h-[72px]">
            <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">

              <Link to={createPageUrl('Landing')}>
                <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
                  <HabalyzeLogo />
                  <div>
                    <span className="text-xl font-black text-[#2B1741]" style={{ fontFamily: 'Silkscreen, Nunito, sans-serif' }}>
                      Habalyze
                    </span>
                    <p className="text-xs text-[#693CA1] -mt-0.5">Neo Pixel Cozy</p>
                  </div>
                </motion.div>
              </Link>

              <div className="flex items-center gap-1">
                {navigationCategories.main.map((item) => {
                  const isActive = location.pathname === item.url;
                  const Icon = item.icon;
                  const showBadge = item.name === 'Social' && pendingRequestsCount > 0;
                  return (
                    <Link key={item.name} to={item.url} className="relative group">
                      {isActive && (
                        <motion.div
                          layoutId="activeDesktopTab"
                          className="absolute inset-0 bg-[#BA92EB]/40 rounded-xl -z-10"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <motion.div
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all relative',
                          isActive ? 'text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                        )}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        {showBadge && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                            {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}

                {/* Coach IA desktop */}
                <Link to={coachItem.url} className="ml-1">
                  <motion.div
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold',
                      location.pathname === coachItem.url
                        ? 'bg-[#693CA1] text-[#FFF4DD] shadow-[3px_3px_0_#2B1741]'
                        : 'text-[#2B1741] hover:bg-[#BA92EB]/30'
                    )}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Brain className="w-4 h-4" />
                    <span>Coach IA</span>
                    <span className="text-xs">✨</span>
                  </motion.div>
                </Link>

                <div className="ml-1">
                  <NotificationBell />
                </div>

                <Link to={createPageUrl('Settings')}>
                  <motion.div
                    className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all ml-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Settings className="w-5 h-5" />
                  </motion.div>
                </Link>

                {currentUser && (
                  <Link to={createPageUrl('Profile')}>
                    <motion.div
                      className="ml-2 bg-white rounded-full border-2 border-purple-200 p-0.5 hover:border-purple-400 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PixelAvatar user={currentUser} size="tiny" showLevel={false} showCoins={false} />
                    </motion.div>
                  </Link>
                )}
              </div>
            </div>
          </nav>

          {/* Desktop footer */}
          <footer className="hidden lg:block bg-white/95 backdrop-blur-xl border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="grid grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HabalyzeLogo />
                    <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Habalyze</span>
                  </div>
                  <p className="text-sm text-gray-500">Construye los hábitos que construyen tu vida.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Producto</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><Link to={createPageUrl('Dashboard')} className="hover:text-purple-600">Dashboard</Link></li>
                    <li><Link to={createPageUrl('Objectives')} className="hover:text-purple-600">Objetivos</Link></li>
                    <li><Link to={createPageUrl('Projects')} className="hover:text-purple-600">Caminos</Link></li>
                    <li><Link to={createPageUrl('Coach')} className="hover:text-purple-600">Coach IA</Link></li>
                    <li><Link to={createPageUrl('Shop')} className="hover:text-purple-600">Tienda</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Comunidad</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><Link to={createPageUrl('Social')} className="hover:text-purple-600">Social</Link></li>
                    <li><Link to={createPageUrl('Leaderboard')} className="hover:text-purple-600">Ranking</Link></li>
                    <li><Link to={createPageUrl('Challenges')} className="hover:text-purple-600">Desafíos</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Recursos</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><Link to={createPageUrl('Blog')} className="hover:text-purple-600">📝 Blog</Link></li>
                    <li><Link to={createPageUrl('Achievements')} className="hover:text-purple-600">Logros</Link></li>
                    <li><Link to={createPageUrl('Settings')} className="hover:text-purple-600">Configuración</Link></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-100 mt-8 pt-6 flex items-center justify-between text-sm text-gray-400">
                <p>© 2025 Habalyze. Hecho con 💜 para mejorar tu vida.</p>
                <div className="flex items-center gap-4">
                  <a href="#" className="hover:text-purple-600">Términos</a>
                  <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-purple-600">Privacidad</Link>
                </div>
              </div>
            </div>
          </footer>

        </div>
      </ErrorBoundary>
    </HelmetProvider>
  );
}