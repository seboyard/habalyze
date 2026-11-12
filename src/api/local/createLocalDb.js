import { DEMO_EMAIL, SEED_VERSION, buildSeed } from './seed';

const STORAGE_KEY = 'habalyze.local.v1';

const memory = { state: null };
let queue = Promise.resolve();

const hasWindow = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  if (memory.state) return memory.state;
  if (hasWindow()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.seedVersion === SEED_VERSION && parsed.collections?.User) {
          memory.state = parsed;
          return memory.state;
        }
      }
    } catch {
      /* semilla nueva si el guardado no se puede leer */
    }
  }
  memory.state = buildSeed();
  persist(memory.state);
  return memory.state;
}

function persist(state) {
  memory.state = state;
  if (hasWindow()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function mutate(mutator) {
  const run = queue.then(async () => {
    const state = loadState();
    const result = await mutator(state);
    persist(state);
    return result;
  });
  queue = run.then(() => undefined, () => undefined);
  return run;
}

function read() {
  return mutate(async (state) => state);
}

function currentUser(state) {
  if (!state.sessionUserId) return null;
  return state.collections.User.find((user) => user.id === state.sessionUserId) || null;
}

function stamp(record, state) {
  const now = new Date().toISOString();
  const user = currentUser(state);
  return {
    ...record,
    id: record.id || `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    created_date: record.created_date || now,
    updated_date: now,
    created_by: record.created_by || user?.email || null,
  };
}

function matches(record, query) {
  if (!query || typeof query !== 'object') return true;
  return Object.entries(query).every(([key, expected]) => {
    const value = record[key];
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      if ('$gte' in expected && !(value >= expected.$gte)) return false;
      if ('$lte' in expected && !(value <= expected.$lte)) return false;
      if ('$gt' in expected && !(value > expected.$gt)) return false;
      if ('$lt' in expected && !(value < expected.$lt)) return false;
      if ('$in' in expected && !expected.$in.map(String).includes(String(value))) return false;
      if ('$nin' in expected && expected.$nin.map(String).includes(String(value))) return false;
      if ('$ne' in expected && value === expected.$ne) return false;
      return true;
    }
    return value === expected;
  });
}

function sortRecords(records, sort) {
  if (!sort || typeof sort !== 'string') return records;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return [...records].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av === bv) return 0;
    if (av === undefined || av === null) return 1;
    if (bv === undefined || bv === null) return -1;
    if (av > bv) return desc ? -1 : 1;
    return desc ? 1 : -1;
  });
}

function collection(state, name) {
  if (!state.collections[name]) state.collections[name] = [];
  return state.collections[name];
}

function entityApi(name) {
  return {
    async filter(query, sort, limit) {
      return read().then((state) => {
        let rows = collection(state, name).filter((row) => matches(row, query));
        rows = sortRecords(rows, sort);
        if (typeof limit === 'number') rows = rows.slice(0, limit);
        return clone(rows);
      });
    },
    async list(sort, limit) {
      return read().then((state) => {
        let rows = sortRecords(collection(state, name), sort);
        if (typeof limit === 'number') rows = rows.slice(0, limit);
        return clone(rows);
      });
    },
    async get(id) {
      return read().then((state) => clone(collection(state, name).find((row) => row.id === id) || null));
    },
    async create(data) {
      return mutate((state) => {
        const record = stamp(data || {}, state);
        collection(state, name).push(record);
        return clone(record);
      });
    },
    async update(id, data) {
      return mutate((state) => {
        const rows = collection(state, name);
        const index = rows.findIndex((row) => row.id === id);
        if (index === -1) {
          const created = stamp({ ...(data || {}), id }, state);
          rows.push(created);
          return clone(created);
        }
        rows[index] = { ...rows[index], ...data, id, updated_date: new Date().toISOString() };
        return clone(rows[index]);
      });
    },
    async delete(id) {
      return mutate((state) => {
        const rows = collection(state, name);
        const index = rows.findIndex((row) => row.id === id);
        if (index >= 0) rows.splice(index, 1);
        return { id, deleted: true };
      });
    },
  };
}

function fail(message) {
  const error = new Error(message);
  error.response = { data: { error: message } };
  throw error;
}

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

function categoryFor(name = '') {
  const text = name.toLowerCase();
  if (/agua|beber/.test(text)) return 'atleta';
  if (/leer|libro|pág/.test(text)) return 'lector';
  if (/dorm|sueñ|pantalla|cama/.test(text)) return 'meditador';
  if (/ejerc|mover|camin/.test(text)) return 'atleta';
  if (/cocin|comer/.test(text)) return 'chef';
  if (/músic/.test(text)) return 'musico';
  return 'lector';
}

function invokeLlm({ prompt, response_json_schema }) {
  if (!response_json_schema) return quoteFor(prompt);
  const props = response_json_schema.properties || {};
  if (props.habits) {
    return {
      habits: habitSuggestions(prompt).map((habit) => ({
        ...habit,
        frequency: habit.frequency,
      })),
    };
  }
  if (props.suggestions) {
    return { suggestions: habitSuggestions(prompt) };
  }
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

const subscribers = new Map();

function notifyConversation(conversation) {
  const listeners = subscribers.get(conversation.id) || [];
  listeners.forEach((listener) => listener({ messages: clone(conversation.messages || []) }));
}

function coachReply(text, state) {
  const user = currentUser(state);
  const habits = collection(state, 'Habit').filter((habit) => habit.created_by === user?.email && habit.is_active);
  const names = habits.map((habit) => habit.name).join(', ') || 'ninguno todavía';
  const lower = text.toLowerCase();
  if (lower.includes('racha')) {
    const best = habits.reduce((max, habit) => Math.max(max, habit.current_streak || 0), 0);
    return `Tu racha más viva ahora es de ${best} día${best === 1 ? '' : 's'}. No la protejas con culpa: si se corta, se vuelve a abrir mañana. Hábitos activos: ${names}.`;
  }
  if (lower.includes('proyecto')) {
    const projects = collection(state, 'Project').filter((project) => project.created_by === user?.email && project.status === 'active');
    if (!projects.length) return 'No tienes caminos activos. Crea uno chico, de tres pasos, en Caminos.';
    return `Tienes ${projects.length} camino${projects.length === 1 ? '' : 's'} activo${projects.length === 1 ? '' : 's'}: ${projects.map((project) => project.name).join(', ')}. El que más te conviene hoy es el que tiene una tarea de menos de quince minutos.`;
  }
  if (lower.includes('hábito') || lower.includes('habito') || lower.includes('sugier')) {
    return `Para seguir con lo que ya tienes (${names}), yo dejaría el de agua como ancla y añadiría solo uno nuevo. ¿Quieres que sea de sueño, de movimiento o de lectura?`;
  }
  return `Te leo. Con lo que hay en tu cuenta (${names}), el siguiente paso útil es marcar uno que ya estaba a medias, no inventar otro. Si quieres, dime cuál se siente más pesado y lo hacemos más pequeño. (Coach local: no hay modelo de IA conectado.)`;
}

async function invokeFunction(name, payload = {}) {
  return mutate(async (state) => {
    const user = currentUser(state);
    if (!user && !['sendWelcomeEmail'].includes(name)) fail('Necesitas entrar en el modo local.');

    if (name === 'listAllUsers') {
      return { users: clone(collection(state, 'User')) };
    }
    if (name === 'getUserByIdentifier') {
      const ident = String(payload.identifier || '').toLowerCase();
      const found = collection(state, 'User').find((row) => row.username?.toLowerCase() === ident || row.email?.toLowerCase() === ident);
      return { user: found ? clone(found) : null };
    }
    if (name === 'purchaseItem') {
      const items = collection(state, 'ShopItem').filter((item) => item.item_id === payload.item_id);
      if (!items.length) fail('Item no encontrado');
      const item = items[0];
      const owned = user.owned_items || [];
      if (owned.includes(item.item_id)) fail('Ya posees este item');
      const price = Number(item.price || 0);
      if ((user.coins || 0) < price) fail('Fondos insuficientes');
      user.coins -= price;
      user.owned_items = [...owned, item.item_id];
      user.owned_shop_items = [...(user.owned_shop_items || []), item.item_id];
      if (payload.custom_color) {
        user.purchased_colors = { ...(user.purchased_colors || {}), [item.item_id]: payload.custom_color };
      }
      return { success: true, remaining_coins: user.coins, item_id: item.item_id };
    }
    if (name === 'purchasePack') {
      const packs = collection(state, 'ShopPack').filter((pack) => pack.pack_id === payload.pack_id || pack.id === payload.pack_id);
      if (!packs.length) fail('Pack no encontrado');
      const pack = packs[0];
      const price = Number(pack.discount_price || pack.discountPrice || 0);
      const full = (pack.item_ids || []).reduce((sum, id) => {
        const item = collection(state, 'ShopItem').find((row) => row.item_id === id);
        return sum + Number(item?.price || 0);
      }, 0);
      if ((user.coins || 0) < price) fail('Fondos insuficientes');
      user.coins -= price;
      const owned = new Set(user.owned_items || []);
      (pack.item_ids || []).forEach((id) => owned.add(id));
      user.owned_items = [...owned];
      user.owned_shop_items = [...owned];
      return { success: true, remaining_coins: user.coins, savings: Math.max(0, full - price) };
    }
    if (name === 'openLootBox') {
      const boxes = collection(state, 'LootBox').filter((box) => box.box_id === payload.box_id || box.id === payload.box_id);
      if (!boxes.length) fail('Caja no encontrada');
      const box = boxes[0];
      const price = Number(box.price || 0);
      if ((user.coins || 0) < price) fail('Fondos insuficientes');
      const owned = new Set(user.owned_items || []);
      const eligible = collection(state, 'ShopItem')
        .filter((item) => item.is_available && (box.possible_rarities || []).includes(item.rarity) && !owned.has(item.item_id))
        .sort((a, b) => a.item_id.localeCompare(b.item_id));
      if (!eligible.length) fail('Ya tienes todas las piezas de esta colección');
      const selected = eligible.slice(0, box.item_count || 1);
      user.coins -= price;
      selected.forEach((item) => owned.add(item.item_id));
      user.owned_items = [...owned];
      user.owned_shop_items = [...owned];
      user.lootboxes_opened = (user.lootboxes_opened || 0) + 1;
      return {
        success: true,
        deterministic: true,
        items: selected.map((item) => ({ item_id: item.item_id, name: item.name, icon: item.icon, rarity: item.rarity })),
        remaining_coins: user.coins,
      };
    }
    if (name === 'analyzeHabitCategory') {
      return { category: categoryFor(`${payload.habit_name || ''} ${payload.habit_description || ''}`) };
    }
    if (name === 'updateBadgeProgress') {
      const rows = collection(state, 'UserBadge');
      let badge = rows.find((row) => row.user_email === user.email && row.badge_id === payload.badge_id);
      if (!badge) {
        badge = stamp({
          user_email: user.email,
          badge_id: payload.badge_id,
          current_progress: payload.progress_value || 1,
          current_level: 1,
        }, state);
        rows.push(badge);
      } else {
        badge.current_progress = payload.progress_value ?? (badge.current_progress || 0) + 1;
      }
      return { success: true, badge: clone(badge) };
    }
    if (name === 'updateWeeklyProgress') {
      const rows = collection(state, 'ProjectWeekStatus');
      const week = day(0);
      let status = rows.find((row) => row.project_id === payload.project_id && row.user_email === user.email);
      if (!status) {
        status = stamp({ project_id: payload.project_id, user_email: user.email, week, progress: 1 }, state);
        rows.push(status);
      } else {
        status.progress = (status.progress || 0) + 1;
        status.week = week;
      }
      return { success: true };
    }
    if (name === 'createPayPalSubscription') {
      return {
        local_only: true,
        message: 'PayPal no está conectado. En modo local el premium se simula dentro de la app, sin cobro.',
      };
    }
    if (name === 'linkTelegramAccount') {
      user.linked_accounts = { ...(user.linked_accounts || {}), telegram: { username: payload.username || 'local', linked_at: new Date().toISOString(), local: true } };
      return { success: true, local_only: true, message: 'Telegram quedó anotado solo en este navegador. No hay bot real.' };
    }
    if (name === 'unlinkTelegramAccount') {
      const linked = { ...(user.linked_accounts || {}) };
      delete linked.telegram;
      user.linked_accounts = linked;
      return { success: true, local_only: true };
    }
    if (name === 'generateShareImage') {
      return { success: true, local_only: true, image_url: '', message: 'La imagen para compartir se genera en el dispositivo cuando haya un servicio de imágenes.' };
    }
    if (name === 'sendWelcomeEmail' || name === 'sendReactivationEmail' || name === 'sendWeeklyDigest' || name === 'sendMotivationalBoost' || name === 'sendBulkReactivation' || name === 'sendTestEmail' || name === 'sendTelegramNotification') {
      state.emails.push({ id: `mail_${Date.now()}`, name, payload, at: new Date().toISOString(), delivered: false });
      return { success: true, delivered: false, local_only: true, message: 'El correo quedó en la bandeja local. No se envió nada.' };
    }
    if (name === 'generateOnboardingHabits') {
      return invokeLlm({ prompt: payload.goal || '', response_json_schema: { properties: { habits: {} } } });
    }
    return { success: true, local_only: true, message: `La función ${name} todavía depende de Base44 y aquí solo está simulada.` };
  });
}

export function createLocalDb() {
  const entities = new Proxy({}, {
    get(_target, prop) {
      if (prop === 'Query') return entityApi('Query');
      return entityApi(String(prop));
    },
  });

  const auth = {
    async isAuthenticated() {
      const state = await read();
      return Boolean(currentUser(state));
    },
    async me() {
      const state = await read();
      const user = currentUser(state);
      return user ? clone(user) : null;
    },
    async updateMe(data) {
      return mutate((state) => {
        const user = currentUser(state);
        if (!user) fail('No hay sesión local');
        Object.assign(user, data || {}, { updated_date: new Date().toISOString() });
        return clone(user);
      });
    },
    async loginLocal(email = DEMO_EMAIL) {
      return mutate((state) => {
        const user = state.collections.User.find((row) => row.email === email);
        if (!user) fail('No existe esa cuenta en el modo local');
        state.sessionUserId = user.id;
        user.last_login_date = new Date().toISOString();
        return clone(user);
      });
    },
    redirectToLogin(next) {
      if (!hasWindow()) return;
      const target = typeof next === 'string' && next ? next : '/dashboard';
      window.location.href = `/login?next=${encodeURIComponent(target)}`;
    },
    logout(redirect) {
      return mutate((state) => {
        state.sessionUserId = null;
        return true;
      }).then(() => {
        if (!hasWindow()) return;
        if (typeof redirect === 'string' && redirect) window.location.href = redirect;
        else if (redirect !== false) window.location.href = '/';
      });
    },
    async resetDemo() {
      memory.state = buildSeed();
      persist(memory.state);
      return true;
    },
  };

  const agents = {
    async listConversations(filter = {}) {
      const state = await read();
      return clone((state.conversations || []).filter((conversation) => {
        if (filter.agent_name && conversation.agent_name !== filter.agent_name) return false;
        if (filter.metadata?.project_id && conversation.metadata?.project_id !== filter.metadata.project_id) return false;
        return true;
      }));
    },
    async createConversation(input) {
      return mutate((state) => {
        const conversation = {
          id: `conv_${Date.now().toString(36)}`,
          agent_name: input.agent_name,
          metadata: input.metadata || {},
          messages: [{
            id: 'hello',
            role: 'assistant',
            content: 'Hola, soy el coach local de Habalyze. Puedo mirar tus hábitos de demostración y proponerte un paso pequeño. No hay un modelo de IA conectado en este modo.',
            created_date: new Date().toISOString(),
          }],
        };
        state.conversations.push(conversation);
        return clone(conversation);
      });
    },
    subscribeToConversation(id, callback) {
      const list = subscribers.get(id) || [];
      list.push(callback);
      subscribers.set(id, list);
      read().then((state) => {
        const conversation = state.conversations.find((item) => item.id === id);
        if (conversation) callback({ messages: clone(conversation.messages || []) });
      });
      return () => {
        const next = (subscribers.get(id) || []).filter((listener) => listener !== callback);
        subscribers.set(id, next);
      };
    },
    async addMessage(conversation, message) {
      return mutate((state) => {
        const stored = state.conversations.find((item) => item.id === conversation.id);
        if (!stored) fail('No encontré la conversación');
        stored.messages.push({
          id: `msg_${Date.now().toString(36)}`,
          role: message.role,
          content: message.content,
          created_date: new Date().toISOString(),
        });
        if (message.role === 'user') {
          stored.messages.push({
            id: `msg_${Date.now().toString(36)}_a`,
            role: 'assistant',
            content: coachReply(message.content, state),
            created_date: new Date().toISOString(),
          });
        }
        notifyConversation(stored);
        return clone(stored);
      });
    },
    getWhatsAppConnectURL() {
      return 'local://whatsapp-no-conectado';
    },
  };

  return {
    auth,
    entities,
    functions: {
      invoke: (name, payload) => invokeFunction(name, payload).then((data) => ({ data })),
    },
    integrations: {
      Core: {
        InvokeLLM: async (args) => invokeLlm(args || {}),
        UploadFile: async ({ file }) => {
          if (!file || typeof FileReader === 'undefined') return { file_url: '' };
          const file_url = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          return { file_url };
        },
        SendEmail: async (payload) => {
          await mutate((state) => {
            state.emails.push({ id: `mail_${Date.now()}`, payload, at: new Date().toISOString(), delivered: false });
            return true;
          });
          return { success: true, delivered: false, local_only: true };
        },
        SendSMS: async () => ({ success: false, local_only: true, message: 'SMS no está conectado en modo local.' }),
        GenerateImage: async () => ({ url: '', local_only: true }),
        ExtractDataFromUploadedFile: async () => ({ data: {}, local_only: true }),
      },
    },
    agents,
    appLogs: {
      async logUserInApp() {
        return { ok: true, local_only: true };
      },
    },
    asServiceRole: { entities, auth },
    adapter: 'local',
  };
}
