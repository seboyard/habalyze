import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../components/i18n/config';
import { 
  TrendingUp, Trophy, Users, Store, Brain, BarChart3, 
  Flame, Target, Sparkles, Star, Zap, ArrowRight, Play, 
  ChevronDown, MessageCircle, Lightbulb, Calendar, Award,
  CheckCircle2, Heart, Shirt, Crown, LayoutGrid, GanttChart, Circle,
  Download, Smartphone, Gift, Wand2, Gem, Scroll,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import LanguageSelector from '../components/common/LanguageSelector';
import PWAInstallPrompt from '../components/common/PWAInstallPrompt';
import DemoSimulation from '../components/landing/DemoSimulation';
import PWAInstallButton from '../components/landing/PWAInstallButton';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import SEO from '../components/common/SEO';
import NeoPixelAvatar from '../components/avatar/NeoPixelAvatar';

const HabalyzeLogo = ({ size = 'large' }) => {
  const sizes = {
    small: { container: 'w-10 h-10', icon: 20 },
    medium: { container: 'w-14 h-14', icon: 28 },
    large: { container: 'w-20 h-20', icon: 40 },
    xlarge: { container: 'w-28 h-28', icon: 56 }
  };
  const s = sizes[size];
  
  return (
    <motion.div 
      className={`${s.container} relative`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-2xl" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/30 rounded-2xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width={s.icon} height={s.icon} viewBox="0 0 100 100" fill="none">
          <rect x="15" y="20" width="12" height="60" rx="6" fill="white" />
          <rect x="73" y="20" width="12" height="60" rx="6" fill="white" />
          <rect x="27" y="40" width="46" height="12" rx="6" fill="white" />
          <rect x="35" y="60" width="8" height="20" rx="4" fill="rgba(255,255,255,0.7)" />
          <rect x="46" y="50" width="8" height="30" rx="4" fill="rgba(255,255,255,0.8)" />
          <rect x="57" y="35" width="8" height="45" rx="4" fill="rgba(255,255,255,0.9)" />
          <circle cx="78" cy="25" r="5" fill="#FCD34D" />
          <circle cx="78" cy="25" r="3" fill="#FEF3C7" />
        </svg>
      </div>
      <motion.div
        className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-3 h-3 text-white" />
      </motion.div>
    </motion.div>
  );
};

const weeklyData = [
  { day: 'Lun', completados: 4 },
  { day: 'Mar', completados: 5 },
  { day: 'Mié', completados: 3 },
  { day: 'Jue', completados: 6 },
  { day: 'Vie', completados: 5 },
  { day: 'Sáb', completados: 4 },
  { day: 'Dom', completados: 6 }
];

const monthlyProgress = [
  { week: 'Sem 1', progreso: 65 },
  { week: 'Sem 2', progreso: 72 },
  { week: 'Sem 3', progreso: 78 },
  { week: 'Sem 4', progreso: 85 },
  { week: 'Sem 5', progreso: 92 }
];

const categoryData = [
  { name: 'Salud', value: 35, color: '#22C55E' },
  { name: 'Productividad', value: 28, color: '#8B5CF6' },
  { name: 'Bienestar', value: 22, color: '#F59E0B' },
  { name: 'Aprendizaje', value: 15, color: '#3B82F6' }
];

const features = [
  { icon: Target, title: 'Seguimiento de Hábitos', description: 'Crea y rastrea hábitos diarios con un sistema visual intuitivo.', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
  { icon: BarChart3, title: 'Estadísticas Avanzadas', description: 'Heatmaps, gráficos de consistencia y patrones de comportamiento.', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50' },
  { icon: Flame, title: 'Sistema de Rachas', description: 'Mantén tu motivación con rachas y recompensas por consistencia.', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50' },
  { icon: Brain, title: 'Coach IA Personal', description: 'Consejos personalizados de un coach que conoce tus hábitos.', color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-50' },
  { icon: Trophy, title: 'Logros y Placas', description: 'Desbloquea placas épicas como Coleccionista, Logrador y más.', color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-50' },
  { icon: Users, title: 'Gremios y Comunidad', description: 'Únete a gremios de interés y compite con la comunidad.', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50' },
  { icon: Store, title: 'Tienda de Avatares', description: 'Personaliza tu avatar con +200 accesorios únicos.', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-50' },
  { icon: GanttChart, title: 'Proyectos con IA', description: 'Crea proyectos y la IA genera un plan de tareas progresivo.', color: 'from-indigo-500 to-blue-500', bgColor: 'bg-indigo-50' },
  { icon: Scroll, title: 'Misiones Diarias', description: 'Completa misiones especiales para ganar recompensas extras.', color: 'from-cyan-500 to-blue-500', bgColor: 'bg-cyan-50' },
  { icon: Gem, title: 'Perks Desbloqueables', description: 'Desbloquea ventajas permanentes que potencian tu progreso.', color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-50' },
  { icon: Shield, title: 'Gremios', description: 'Únete a comunidades de interés y colabora en desafíos.', color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-50' },
  { icon: Gift, title: 'Regalos', description: 'Envía y recibe regalos de amigos para motivarse mutuamente.', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-50' }
];

const stats = [
  { value: '10K+', label: 'Usuarios Activos' },
  { value: '500K+', label: 'Hábitos Completados' },
  { value: '95%', label: 'Satisfacción' },
  { value: '30+', label: 'Días Promedio Racha' }
];

const testimonials = [
  { name: 'María García', role: 'Emprendedora', text: 'Habalyze transformó mi rutina. El coach IA me da consejos increíbles y las estadísticas me mantienen motivada.', avatar: '👩💼' },
  { name: 'Carlos Rodríguez', role: 'Estudiante', text: 'Los desafíos con amigos hacen que mantener hábitos sea divertido. ¡Ya llevo 45 días de racha!', avatar: '👨🎓' },
  { name: 'Ana Martínez', role: 'Diseñadora', text: 'Me encanta personalizar mi avatar. Las recompensas por completar hábitos son adictivas.', avatar: '👩🎨' }
];

const ExampleAvatar = ({ config = {}, size = 120 }) => {
  const defaultConfig = {
    skinColor: 'light',
    hairStyle: 'short',
    hairColor: 'brown',
    face: 'happy',
    shirtStyle: 'tshirt',
    shirtColor: '#7E57C2',
    pantsStyle: 'jeans',
    pantsColor: '#42A5F5',
    ...config
  };

  const skinTones = {
    light: { base: '#FED6A8', shadow: '#E6BD8F' },
    medium: { base: '#D4A574', shadow: '#B8895B' },
    dark: { base: '#8B6342', shadow: '#6D4A29' },
    robot: { base: '#90A4AE', shadow: '#607D8B' },
    alien: { base: '#7FE87F', shadow: '#5DC95D' },
    zombie: { base: '#9DC183', shadow: '#7FA365' },
    vampire: { base: '#E8E8E8', shadow: '#BDBDBD' },
    demon: { base: '#E57373', shadow: '#C62828' },
    mystic: { base: '#BA68C8', shadow: '#7B1FA2' },
    gold: { base: '#FFD54F', shadow: '#FF8F00' },
  };

  const skin = skinTones[defaultConfig.skinColor] || skinTones.light;

  return (
    <motion.div className="relative" whileHover={{ scale: 1.05 }}>
      <svg width={size} height={size * 1.4} viewBox="-15 -10 100 130" className="drop-shadow-xl">
        <ellipse cx="35" cy="106" rx="18" ry="4" fill="rgba(0,0,0,0.2)" />
        <rect x="20" y="96" width="14" height="6" rx="2" fill="#2D3436" />
        <rect x="36" y="96" width="14" height="6" rx="2" fill="#2D3436" />
        <rect x="22" y="78" width="12" height="20" fill={defaultConfig.pantsColor} />
        <rect x="36" y="78" width="12" height="20" fill={defaultConfig.pantsColor} />
        <rect x="20" y="52" width="30" height="28" fill={config.shirtColor || defaultConfig.shirtColor} />
        <rect x="14" y="54" width="8" height="18" fill={config.shirtColor || defaultConfig.shirtColor} />
        <rect x="48" y="54" width="8" height="18" fill={config.shirtColor || defaultConfig.shirtColor} />
        <ellipse cx="35" cy="50" rx="7" ry="4" fill={skin.base} />
        <ellipse cx="35" cy="30" rx="18" ry="20" fill={skin.base} />
        <ellipse cx="16" cy="32" rx="4" ry="6" fill={skin.base} />
        <ellipse cx="54" cy="32" rx="4" ry="6" fill={skin.base} />
        <ellipse cx="22" cy="36" rx="5" ry="3" fill="#FFCDD2" opacity="0.4" />
        <ellipse cx="48" cy="36" rx="5" ry="3" fill="#FFCDD2" opacity="0.4" />
        <rect x="25" y="26" width="3" height="4" fill="#1a1a2e" />
        <rect x="25" y="26" width="1" height="1" fill="white" />
        <rect x="41" y="26" width="3" height="4" fill="#1a1a2e" />
        <rect x="41" y="26" width="1" height="1" fill="white" />
        <rect x="31" y="38" width="2" height="1" fill="#e74c3c" />
        <rect x="33" y="39" width="4" height="1" fill="#e74c3c" />
        <rect x="37" y="38" width="2" height="1" fill="#e74c3c" />
        <rect x="22" y="6" width="26" height="4" fill="#5c3317" />
        <rect x="20" y="8" width="30" height="6" fill="#5c3317" />
        <rect x="18" y="12" width="4" height="8" fill="#5c3317" />
        <rect x="48" y="12" width="4" height="8" fill="#5c3317" />
        {config.hat === 'crown' && (
          <g>
            <rect x="20" y="4" width="30" height="8" fill="#ffd700" />
            <rect x="22" y="0" width="4" height="6" fill="#ffd700" />
            <rect x="32" y="-4" width="6" height="10" fill="#ffd700" />
            <rect x="44" y="0" width="4" height="6" fill="#ffd700" />
            <circle cx="35" cy="0" r="3" fill="#e74c3c" />
          </g>
        )}
        {config.glasses && (
          <g>
            <rect x="21" y="24" width="10" height="8" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="2" />
            <rect x="38" y="24" width="10" height="8" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="2" />
            <rect x="31" y="27" width="7" height="2" fill="#1a1a1a" />
          </g>
        )}
        {config.hat === 'halo' && (
          <ellipse cx="35" cy="-2" rx="14" ry="4" fill="none" stroke="#ffd700" strokeWidth="3" />
        )}
        {config.wings && (
          <g>
            <path d="M52 56 Q70 40 80 60 Q70 55 52 66" fill="#e1bee7" opacity="0.9" />
            <path d="M18 56 Q0 40 -10 60 Q0 55 18 66" fill="#e1bee7" opacity="0.9" />
          </g>
        )}
      </svg>
    </motion.div>
  );
};

const CoachChatExample = () => {
  const messages = [
    { role: 'user', text: '¿Cómo puedo mejorar mi racha de meditación?' },
    { role: 'coach', text: '¡Veo que llevas 12 días de racha! 🎉 Te sugiero establecer un horario fijo por la mañana. Según tus datos, completas mejor los hábitos antes de las 9am.' },
    { role: 'user', text: '¿Qué hábito debería agregar?' },
    { role: 'coach', text: 'Basándome en tu perfil, te recomiendo "Lectura 15 min" 📚. Complementa tu hábito de meditación y mejora el enfoque. ¿Lo creo por ti?' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden max-w-md mx-auto">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-white font-bold">Coach IA</p>
          <p className="text-purple-200 text-xs">Siempre disponible</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-300 text-xs">Online</span>
        </div>
      </div>
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto bg-gray-50">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-sm' 
                : 'bg-white text-gray-800 shadow-md border border-gray-100 rounded-bl-sm'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await db.auth.isAuthenticated();
        setIsAuthenticated(auth);
        if (auth) {
          const user = await db.auth.me();
          const prefs = await db.entities.UserPreferences.filter({ user_email: user.email });
          
          if (prefs.length > 0) {
            setUserPrefs(prefs[0]);
          }

          if (prefs.length === 0 || prefs[0].onboarding_status !== 'completed') {
            navigate(createPageUrl('Onboarding'));
          } else {
            navigate(createPageUrl('Dashboard'));
          }
        }
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    db.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  return (
    <div className="min-h-screen bg-[#FFF6EA] overflow-hidden text-[#2B1741]">
      <SEO 
        title="Habalyze - Transforma tus hábitos en aventuras épicas"
        description="Gamifica tu vida con IA, estadísticas avanzadas y una comunidad increíble. Crea hábitos, sube de nivel, desbloquea logros y alcanza tus metas."
        keywords="hábitos, productividad, gamificación, coach IA, seguimiento hábitos, desarrollo personal, metas, objetivos, motivación, racha"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFF6EA]/90 backdrop-blur-xl border-b border-[#E6D3F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <HabalyzeLogo size="small" />
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Habalyze
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSelector variant="ghost" />
              <Button variant="ghost" className="hidden sm:flex" onClick={handleGetStarted}>
                {t('landing.login', 'Entrar')}
              </Button>
              <Button 
                onClick={handleGetStarted} 
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-purple-300 text-sm sm:text-base px-3 sm:px-4"
              >
                {t('landing.signup', 'Probar en local')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-4">
                <HabalyzeLogo size="medium" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4">
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Habalyze
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                Construye los hábitos que construyen tu vida.
              </p>
              <p className="text-lg sm:text-xl text-gray-600 mb-8">
                {t('landing.hero.subtitle', 'Hábitos, metas y caminos con un avatar Neo Pixel Cozy. Brasa, Vek, Mora, Nix y Lumo ya están en el vestidor.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted} 
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-2xl shadow-purple-400/50"
                  data-signup-btn
                >
                  {t('landing.hero.cta', 'Entrar y probar')} <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => setShowDemo(true)} 
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
                >
                  <Play className="mr-2 w-4 sm:w-5 h-4 sm:h-5" /> {t('landing.watchDemo', 'Ver Demo')}
                </Button>
              </div>
              
              <div className="mt-6 lg:hidden">
                <PWAInstallButton inline={true} />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-amber-400 rounded-full"
                      style={{ left: `${20 + i * 15}%`, top: `${10 + (i % 3) * 30}%` }}
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
                
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <div className="flex flex-wrap items-end justify-center gap-1">
                    {['brasa', 'vek', 'mora', 'nix', 'lumo'].map((preset) => (
                      <NeoPixelAvatar
                        key={preset}
                        user={{ avatar_config: { preset }, level: 1 }}
                        size={84}
                        showLevel={false}
                        animation="idle"
                      />
                    ))}
                  </div>
                  <div className="space-y-3 w-full max-w-xs">
                    <motion.div 
                      className="bg-white rounded-xl p-3 shadow-lg border-2 border-orange-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                          <Flame className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Racha Actual</p>
                          <p className="text-xl font-black text-orange-500">28 días</p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-xl p-3 shadow-lg border-2 border-amber-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Nivel</p>
                          <p className="text-xl font-black text-amber-500">15</p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-xl p-3 shadow-lg border-2 border-green-200"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Actividad de amigo</p>
                          <p className="text-sm font-bold text-green-600">🧘 Carlos: ¡120 días!</p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-xl p-3 shadow-lg border-2 border-yellow-200"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-lg">
                          💰
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Esta semana</p>
                          <p className="text-xl font-black text-amber-500">+320 🪙</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                <motion.div 
                  className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold shadow-lg text-sm z-20"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆 Top 10%
                </motion.div>
                
                <motion.div 
                  className="absolute bottom-2 left-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1.5 rounded-full font-bold shadow-lg text-sm"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨ +50 XP hoy
                </motion.div>
              </div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-2xl border-2 border-blue-200 max-w-[200px]"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.5, type: "spring" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg">👩🎨</div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Ana te desafía</p>
                    <p className="text-[10px] text-blue-600">🏃 30 días de ejercicio</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Avatar System Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">Sistema de Avatar</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-2 mb-4">
              Tu progreso, <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">tu estilo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Crea un avatar único que evoluciona contigo. Desbloquea accesorios completando hábitos y muestra tu progreso con estilo.
            </p>
          </motion.div>

          <div className="mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center items-end gap-4 flex-wrap"
            >
              {[
                { config: { skinColor: 'light', shirtColor: '#2196f3' }, delay: 0, label: '👱' },
                { config: { skinColor: 'robot', glasses: true, shirtColor: '#607d8b' }, delay: 0.05, label: '🤖' },
                { config: { skinColor: 'demon', hat: 'crown', shirtColor: '#b71c1c' }, delay: 0.1, label: '😈' },
                { config: { skinColor: 'medium', glasses: true, shirtColor: '#e91e63' }, delay: 0.15, label: '👩' },
                { config: { hat: 'crown', wings: true, skinColor: 'mystic', shirtColor: '#7b1fa2' }, delay: 0.2, featured: true, label: '✨' },
                { config: { skinColor: 'dark', hat: 'halo', shirtColor: '#ff9800' }, delay: 0.25, label: '👨' },
                { config: { skinColor: 'zombie', glasses: true, shirtColor: '#33691e' }, delay: 0.3, label: '🧟' },
                { config: { skinColor: 'alien', hat: 'halo', shirtColor: '#00bcd4' }, delay: 0.35, label: '👽' },
                { config: { skinColor: 'gold', wings: true, shirtColor: '#ff8f00' }, delay: 0.4, label: '🌟' },
              ].map((avatar, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: avatar.delay }}
                  whileHover={{ y: -10, scale: 1.1 }}
                  className={`${avatar.featured ? 'z-10' : 'opacity-90 hover:opacity-100'}`}
                >
                  <motion.div
                    animate={avatar.featured ? { y: [0, -5, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                  >
                    <ExampleAvatar config={avatar.config} size={avatar.featured ? 120 : 80} />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-lg">{avatar.label}</span>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-gray-500 mt-6 text-sm"
            >
              +20 tonos de piel (¡incluye robot, alien, demonio!) • +15 peinados • +50 accesorios • Combinaciones infinitas
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">
                <ExampleAvatar config={{}} size={100} />
                <p className="mt-4 font-bold text-gray-800">Nivel Principiante</p>
                <p className="text-sm text-gray-500">Comienza tu aventura</p>
                <div className="flex justify-center gap-1 mt-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i <= 1 ? 'bg-purple-500' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-gradient-to-r from-purple-300 to-purple-500 rounded"></div>
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                  <ArrowRight className="w-8 h-8 text-purple-500" />
                </motion.div>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded"></div>
              </div>
              <div className="text-center space-y-2">
                <motion.div 
                  className="flex items-center justify-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-4 h-4" /> Coronas & Sombreros
                </motion.div>
                <motion.div 
                  className="flex items-center justify-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <span>🦋</span> Alas & Capas
                </motion.div>
                <motion.div 
                  className="flex items-center justify-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <span>🐾</span> Mascotas & Efectos
                </motion.div>
                <motion.div 
                  className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <span>👓</span> Gafas & Piercings
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 shadow-xl border-2 border-purple-200 relative overflow-hidden">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-amber-400 rounded-full"
                    style={{ left: `${20 + i * 20}%`, top: `${20 + (i % 2) * 40}%` }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ExampleAvatar config={{ hat: 'crown', glasses: true, wings: true }} size={100} />
                </motion.div>
                <p className="mt-4 font-bold text-purple-700">Nivel Experto</p>
                <p className="text-sm text-purple-500">¡Destaca con estilo!</p>
                <div className="flex justify-center gap-2 mt-3">
                  <span className="text-2xl">👑</span>
                  <span className="text-2xl">🦋</span>
                  <span className="text-2xl">✨</span>
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-purple-500" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Comunidad Social</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-2 mb-4">
              Crece <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">junto a tus amigos</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comparte logros, compite en desafíos y motívense mutuamente para alcanzar sus metas.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Carlos', action: '¡Completó 120 días de meditación!', icon: '🧘', color: 'from-blue-500 to-cyan-500', time: 'Hace 2 min' },
              { name: 'María', action: 'Te superó en el ranking semanal', icon: '🏆', color: 'from-amber-500 to-orange-500', time: 'Hace 15 min' },
              { name: 'Pedro', action: 'Desbloqueó el logro "Madrugador"', icon: '🌅', color: 'from-purple-500 to-pink-500', time: 'Hace 1 hora' },
              { name: 'Ana', action: 'Te invitó al desafío "30 días fit"', icon: '💪', color: 'from-green-500 to-emerald-500', time: 'Hace 2 horas' },
              { name: 'Luis', action: '¡Nueva racha de 50 días!', icon: '🔥', color: 'from-orange-500 to-red-500', time: 'Hace 3 horas' },
              { name: 'Sofia', action: 'Subió al nivel 25', icon: '⭐', color: 'from-violet-500 to-purple-500', time: 'Hace 5 horas' },
            ].map((notif, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${notif.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{notif.name}</p>
                    <p className="text-sm text-gray-600">{notif.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                  <motion.div 
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-100"
          >
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 justify-center text-lg">
              <Trophy className="w-5 h-5 text-amber-500" /> Ranking Semanal
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { rank: 2, name: 'María', xp: '2,340 XP', avatar: '👩🎨' },
                { rank: 1, name: 'Tú', xp: '2,890 XP', avatar: '🏆', featured: true },
                { rank: 3, name: 'Carlos', xp: '2,100 XP', avatar: '👨💻' },
              ].map((user, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`text-center ${user.featured ? 'order-first sm:order-none' : ''}`}
                >
                  <div className={`rounded-2xl p-4 ${user.featured ? 'bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 scale-110' : 'bg-white border border-gray-200'}`}>
                    <div className={`text-4xl mb-2 ${user.rank === 1 ? '' : 'opacity-80'}`}>{user.avatar}</div>
                    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mb-1 ${
                      user.rank === 1 ? 'bg-amber-500 text-white' : 
                      user.rank === 2 ? 'bg-gray-300 text-gray-700' : 
                      'bg-orange-300 text-orange-800'
                    }`}>
                      {user.rank}
                    </div>
                    <p className="font-bold text-gray-800">{user.name}</p>
                    <p className="text-sm text-purple-600 font-semibold">{user.xp}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Coach IA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <span className="text-purple-300 font-semibold text-sm uppercase tracking-wider">Coach IA Exclusivo</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Tu entrenador personal de hábitos, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">potenciado con IA</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/30 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-violet-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Conversaciones Naturales</h3>
                    <p className="text-purple-200">Habla con tu coach como lo harías con un amigo. Pregunta, pide consejos o simplemente comparte tu progreso.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-500/30 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-fuchsia-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Analiza tus Datos</h3>
                    <p className="text-purple-200">El coach conoce todos tus hábitos, estadísticas y patrones. Te da recomendaciones basadas en TU progreso real.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/30 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-pink-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Crea Hábitos por Ti</h3>
                    <p className="text-purple-200">¿No sabes qué hábito agregar? El coach puede sugerirte y crear nuevos hábitos adaptados a tus objetivos.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <CoachChatExample />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Gestión Inteligente de Proyectos</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-2 mb-4">
              De la idea a la <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ejecución perfecta</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dile a la IA tu objetivo y ella creará un plan de tareas progresivo y personalizado. Visualiza, colabora y ejecuta como un profesional.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Planificación con IA</h3>
                    <p className="text-sm text-gray-500">Automática y personalizada</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-gray-700">💬 "Quiero correr un maratón en 6 meses"</p>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="p-3 bg-white rounded-lg border border-indigo-200"
                  >
                    <p className="text-xs text-indigo-600 font-semibold mb-2">✨ IA generando plan...</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Semana 1-4: Base aeróbica (3x semana)</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Semana 5-8: Incrementar distancia</div>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Semana 9-16: Long runs progresivos</div>
                      <div className="flex items-center gap-2"><Circle className="w-3 h-3 text-gray-300" /> Semana 17-20: Tapering y carrera</div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Target, title: 'Tareas Secuenciales', desc: 'Desbloquea siguientes pasos', color: 'from-blue-500 to-cyan-500' },
                  { icon: Users, title: 'Colaboración Real', desc: 'Invita a tu equipo', color: 'from-green-500 to-emerald-500' },
                  { icon: BarChart3, title: 'Progreso Automático', desc: 'Se calcula solo', color: 'from-purple-500 to-pink-500' },
                  { icon: Sparkles, title: 'Asistente IA', desc: 'Ajusta tu plan', color: 'from-amber-500 to-orange-500' },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-lg"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-2`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm text-gray-800">{feature.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-purple-600" />
                    Vista Kanban
                  </h3>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">Vista en vivo</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { title: 'Por hacer', count: 3, color: 'gray' },
                    { title: 'En progreso', count: 2, color: 'blue' },
                    { title: 'Hecho', count: 5, color: 'green' }
                  ].map((col, i) => (
                    <div key={i} className="space-y-2">
                      <div className={`text-xs font-semibold text-${col.color}-700 bg-${col.color}-50 px-2 py-1 rounded-lg flex items-center justify-between`}>
                        {col.title}
                        <span className={`bg-${col.color}-200 px-1.5 rounded-full`}>{col.count}</span>
                      </div>
                      {[...Array(Math.min(col.count, 2))].map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.1 + j * 0.05 }}
                          className="bg-gray-50 rounded-lg p-2 border border-gray-200"
                        >
                          <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
                          <div className="w-3/4 h-1.5 bg-gray-200 rounded"></div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-6 border-2 border-indigo-200">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <GanttChart className="w-5 h-5 text-indigo-600" />
                  Gantt & Timeline
                </h3>
                <div className="space-y-2">
                  {[
                    { width: '60%', color: 'bg-indigo-500', delay: 0.6 },
                    { width: '40%', color: 'bg-purple-500', delay: 0.7 },
                    { width: '80%', color: 'bg-pink-500', delay: 0.8 },
                    { width: '50%', color: 'bg-blue-500', delay: 0.9 }
                  ].map((bar, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-gray-300 rounded"></div>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: bar.width }}
                        viewport={{ once: true }}
                        transition={{ delay: bar.delay, duration: 0.5 }}
                        className={`h-3 ${bar.color} rounded shadow-lg`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-green-100 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['👨💻', '👩🎨', '👨🔬'].map((avatar, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-white flex items-center justify-center text-lg shadow-lg"
                    >
                      {avatar}
                    </motion.div>
                  ))}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">Trabajo en equipo</p>
                  <p className="text-xs text-gray-500">Asigna tareas y colabora en tiempo real</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* RPG Features Section - Misiones, Perks, Gremios */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTMwIDMwbDUgNS01IDUgNS01LTUtNXoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Modo RPG</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-2 mb-4">
              Tu vida, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">tu aventura épica</span>
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Completa misiones, desbloquea ventajas permanentes, únete a gremios y envía regalos motivacionales.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Misiones */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 shadow-2xl border-2 border-cyan-400/30"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Scroll className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Misiones Diarias</h3>
              <p className="text-cyan-100 text-sm mb-4">Completa misiones especiales que cambian cada día para ganar recompensas extras y XP.</p>
              <div className="space-y-2 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span>Completa 5 hábitos (200 XP)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Circle className="w-4 h-4 text-white/50" />
                  <span className="text-white/70">Invita 1 amigo (500 coins)</span>
                </div>
              </div>
            </motion.div>

            {/* Perks */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 shadow-2xl border-2 border-rose-400/30"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Gem className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Perks Desbloqueables</h3>
              <p className="text-rose-100 text-sm mb-4">Desbloquea ventajas permanentes que potencian tu experiencia y progreso.</p>
              <div className="space-y-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span>+25% monedas extra</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span>Doble XP los fines de semana</span>
                </div>
              </div>
            </motion.div>

            {/* Gremios */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-6 shadow-2xl border-2 border-violet-400/30"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gremios</h3>
              <p className="text-violet-100 text-sm mb-4">Únete a comunidades de interés, compite en equipo y colabora en desafíos grupales.</p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs mb-2 text-violet-200">Gremio: Los Madrugadores ☀️</p>
                <div className="flex items-center justify-between text-xs">
                  <span>52 miembros</span>
                  <Badge className="bg-amber-500/30 text-amber-200 text-xs">Rank #3</Badge>
                </div>
              </div>
            </motion.div>

            {/* Regalos */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 shadow-2xl border-2 border-pink-400/30"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Regalos</h3>
              <p className="text-pink-100 text-sm mb-4">Envía regalos a amigos: coins, items especiales o Premium para motivarse mutuamente.</p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-bold">Ana te envió</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Gift className="w-3 h-3" />
                  <span>Corona Legendaria 👑</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">Estadísticas Avanzadas</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-2 mb-4">
              Visualiza tu <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">progreso real</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gráficas detalladas, heatmaps y análisis de patrones para entender tus hábitos como nunca antes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Hábitos Completados por Día
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="completados" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#D946EF" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Progreso Mensual
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyProgress}>
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                    formatter={(value) => [`${value}%`, 'Progreso']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="progreso" 
                    stroke="#22C55E" 
                    strokeWidth={3}
                    dot={{ fill: '#22C55E', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Distribución por Categoría
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                    formatter={(value) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-gray-600">{cat.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
          >
            <h3 className="font-bold text-gray-800 mb-4 text-center">📅 Calendario de Actividad (Heatmap)</h3>
            <div className="flex justify-center gap-1 flex-wrap">
              {[...Array(90)].map((_, i) => {
                const intensity = Math.random();
                let color = 'bg-gray-100';
                if (intensity > 0.8) color = 'bg-purple-600';
                else if (intensity > 0.6) color = 'bg-purple-400';
                else if (intensity > 0.4) color = 'bg-purple-300';
                else if (intensity > 0.2) color = 'bg-purple-200';
                
                return (
                  <motion.div 
                    key={i} 
                    className={`w-4 h-4 rounded-sm ${color}`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.005 }}
                  />
                );
              })}
            </div>
            <div className="flex justify-center gap-2 mt-4 text-xs text-gray-500">
              <span>Menos</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
                <div className="w-3 h-3 rounded-sm bg-purple-200"></div>
                <div className="w-3 h-3 rounded-sm bg-purple-300"></div>
                <div className="w-3 h-3 rounded-sm bg-purple-400"></div>
                <div className="w-3 h-3 rounded-sm bg-purple-600"></div>
              </div>
              <span>Más</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">Funcionalidades</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-2 mb-4">
              Todo para <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">transformar tu vida</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className={`${feature.bgColor} rounded-3xl p-6 border border-white shadow-xl hover:shadow-2xl transition-all`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">Sistema de Recompensas</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-2 mb-4">
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Cajas Sorpresa</span> y Coleccionables
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Abre cajas misteriosas, colecciona items raros y completa tu colección de accesorios únicos.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Común', icon: '📦', color: 'from-gray-400 to-gray-500', rarity: 'Común o Raro' },
              { name: 'Rara', icon: '🎁', color: 'from-blue-400 to-blue-600', rarity: 'Chance de Épico' },
              { name: 'Épica', icon: '🎀', color: 'from-purple-500 to-pink-500', rarity: 'Épico garantizado' },
              { name: 'Legendaria', icon: '👑', color: 'from-amber-400 to-orange-500', rarity: 'Legendario!' },
              { name: 'Misteriosa', icon: '❓', color: 'from-violet-600 to-fuchsia-600', rarity: '¡Cualquier cosa!' },
            ].map((box, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                className={`bg-gradient-to-br ${box.color} rounded-2xl p-6 text-white text-center cursor-pointer shadow-xl`}
              >
                <motion.div 
                  className="text-5xl mb-3"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  {box.icon}
                </motion.div>
                <h3 className="font-bold">{box.name}</h3>
                <p className="text-xs opacity-80 mt-1">{box.rarity}</p>
              </motion.div>
            ))}
          </div>

          {/* Gifts Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl p-8 border-2 border-pink-200"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-10 h-10 text-pink-600" />
                  <h3 className="text-2xl font-bold text-gray-800">Regala Motivación</h3>
                </div>
                <p className="text-gray-700 mb-6">
                  Envía regalos a tus amigos: coins, items especiales o incluso Premium. Motiva a otros y celebra sus logros.
                </p>
                <div className="flex gap-3">
                  <div className="bg-white rounded-xl p-4 flex-1 shadow-md">
                    <p className="text-3xl mb-2">🎁</p>
                    <p className="text-sm font-bold text-gray-800">Paquete de Coins</p>
                    <p className="text-xs text-gray-500">500 🪙</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 flex-1 shadow-md">
                    <p className="text-3xl mb-2">⭐</p>
                    <p className="text-sm font-bold text-gray-800">Premium</p>
                    <p className="text-xs text-gray-500">1 mes</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <p className="text-sm text-gray-500 mb-3">Regalo reciente:</p>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-2xl">
                    👩🎨
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Ana te envió</p>
                    <p className="text-sm text-pink-600 flex items-center gap-1">
                      <Gift className="w-4 h-4" /> Corona Legendaria 👑
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">Testimonios</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-2">Lo que dicen nuestros usuarios</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
            
            <motion.div 
              className="absolute top-4 left-4 opacity-30"
              animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <ExampleAvatar config={{ hat: 'halo' }} size={60} />
            </motion.div>
            <motion.div 
              className="absolute bottom-4 right-4 opacity-30"
              animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <ExampleAvatar config={{ hat: 'crown', wings: true }} size={60} />
            </motion.div>
            
            <div className="relative z-10">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ duration: 2, repeat: Infinity }} 
                className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center"
              >
                <Zap className="w-10 h-10 text-yellow-300" />
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">¿Listo para transformar tu vida?</h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Únete a miles de usuarios que ya están alcanzando sus metas con Habalyze
              </p>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" onClick={handleGetStarted} className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-10 py-6 shadow-2xl font-bold">
                  Crear Mi Cuenta Gratis <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              
              <p className="text-purple-200 text-sm mt-4">✓ Sin tarjeta de crédito &nbsp;&nbsp; ✓ Gratis para siempre &nbsp;&nbsp; ✓ Cancela cuando quieras</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <HabalyzeLogo size="small" />
              <span className="text-2xl font-bold">Habalyze</span>
            </div>
            <p className="text-gray-400 text-center">© 2025 Habalyze. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition">Privacidad</a>
              <a href="#" className="hover:text-white transition">Términos</a>
              <a href="#" className="hover:text-white transition">Contacto</a>
            </div>
          </div>
        </div>
      </footer>

      <PWAInstallButton />
      <DemoSimulation open={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
}