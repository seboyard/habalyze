// ============ FACE EXPRESSIONS (16 expresiones) ============
export const faceExpressions = {
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