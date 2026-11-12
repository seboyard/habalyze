const QUOTES = [
  'Hoy cuenta lo que haces pequeño y de verdad.',
  'Una racha no es una cadena: es una puerta que vuelves a abrir.',
  'Descansar también es parte del hábito.',
  'No tienes que hacerlo perfecto. Tienes que volver.',
  'El vaso de agua de la mañana ya es un comienzo.',
];

function quoteFor(prompt) {
  const index = Math.abs(Array.from(prompt || '').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % QUOTES.length;
  return QUOTES[index];
}

function habitSuggestions(prompt) {
  const text = (prompt || '').toLowerCase();
  const bank = [
    { name: 'Beber agua al despertar', description: 'Un vaso antes de mirar el teléfono.', icon: 'droplet', color: 'teal', frequency: 'daily' },
    { name: 'Leer diez páginas', description: 'Un rato corto, a la misma hora.', icon: 'book', color: 'purple', frequency: 'daily' },
    { name: 'Moverte quince minutos', description: 'Caminar o estirar, sin plan de gimnasio.', icon: 'dumbbell', color: 'orange', frequency: 'daily' },
    { name: 'Apagar pantallas', description: 'Dejar el teléfono fuera de la cama.', icon: 'moon', color: 'pink', frequency: 'daily' },
    { name: 'Cocinar algo simple', description: 'Una comida real, no solo snacks.', icon: 'utensils', color: 'green', frequency: 'daily' },
    { name: 'Anotar una línea', description: 'Qué salió bien hoy, en una frase.', icon: 'smile', color: 'yellow', frequency: 'daily' },
  ];
  if (text.includes('dormir') || text.includes('sueño')) return [bank[3], bank[5], bank[0]];
  if (text.includes('ejerc') || text.includes('forma') || text.includes('salud')) return [bank[2], bank[0], bank[4]];
  if (text.includes('leer') || text.includes('aprend')) return [bank[1], bank[5], bank[3]];
  return bank.slice(0, 3);
}

export function categoryFor(name = '') {
  const text = name.toLowerCase();
  if (/agua|beber/.test(text)) return 'atleta';
  if (/leer|libro|pág/.test(text)) return 'lector';
  if (/dorm|sueñ|pantalla|cama/.test(text)) return 'meditador';
  if (/ejerc|mover|camin/.test(text)) return 'atleta';
  if (/cocin|comer/.test(text)) return 'chef';
  if (/músic/.test(text)) return 'musico';
  return 'lector';
}

export function invokeLocalLlm({ prompt, response_json_schema }) {
  if (!response_json_schema) return quoteFor(prompt);
  const props = response_json_schema.properties || {};
  if (props.habits) return { habits: habitSuggestions(prompt) };
  if (props.suggestions) return { suggestions: habitSuggestions(prompt) };
  if (props.category) return { category: categoryFor(prompt) };
  if (props.tasks) {
    return {
      tasks: [
        { title: 'Dejar el material a la vista', description: 'Si no lo ves, no existe.', type: 'setup', is_setup: true, is_milestone: false, depends_on: [], phase: 'Empezar', tips: 'Una bandeja basta.', reward_coins: 10, reward_xp: 15 },
        { title: 'Hacer la versión de diez minutos', description: 'La más pequeña que aún cuenta.', type: 'daily', is_setup: false, is_milestone: false, depends_on: [0], phase: 'Practicar', tips: 'Pon un temporizador.', reward_coins: 15, reward_xp: 20 },
        { title: 'Anotar qué se trabó', description: 'Una frase, no un informe.', type: 'weekly', is_setup: false, is_milestone: true, depends_on: [1], phase: 'Ajustar', tips: 'Cambia la hora, no el objetivo.', reward_coins: 20, reward_xp: 25 },
      ],
    };
  }
  if (props.name) {
    const [first] = habitSuggestions(prompt);
    return { ...first, weekly_days: [], times_per_week: 3 };
  }
  if (props.quote) return { quote: quoteFor(prompt) };
  return { text: quoteFor(prompt) };
}

export function coachReply(text, habits = [], projects = []) {
  const names = habits.map((habit) => habit.name).join(', ') || 'ninguno todavía';
  const lower = (text || '').toLowerCase();
  if (lower.includes('racha')) {
    const best = habits.reduce((max, habit) => Math.max(max, habit.current_streak || 0), 0);
    return `Tu racha más viva ahora es de ${best} día${best === 1 ? '' : 's'}. Hábitos activos: ${names}. El coach todavía no usa un modelo externo.`;
  }
  if (lower.includes('proyecto') || lower.includes('camino')) {
    if (!projects.length) return 'No tienes caminos activos. Crea uno chico, de tres pasos, en Caminos.';
    return `Tienes ${projects.length} camino${projects.length === 1 ? '' : 's'}: ${projects.map((project) => project.name).join(', ')}. Elige la tarea de menos de quince minutos.`;
  }
  if (lower.includes('hábito') || lower.includes('habito') || lower.includes('sugier')) {
    return `Con lo que ya tienes (${names}), deja uno como ancla y no añadas más de uno nuevo. Esto lo responde el coach local, no un modelo conectado.`;
  }
  return `Te leo. El siguiente paso útil es marcar uno de estos: ${names}. El modelo de IA real todavía no está conectado.`;
}
