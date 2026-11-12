import { motion } from 'framer-motion';

// ============ PETS ============
export const pets = {
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

export default pets;