import { motion } from 'framer-motion';

// ============ VISUAL EFFECTS ============
export const visualEffects = {
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

export default visualEffects;