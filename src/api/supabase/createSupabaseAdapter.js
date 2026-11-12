import { createClient } from '@supabase/supabase-js';
import { ENTITY_TABLE } from './tables';
import { applyWindow, fail, matches } from './records';
import { categoryFor, coachReply, invokeLocalLlm } from './localIntelligence';

const SERVER_ONLY = {
  createPayPalSubscription: 'PayPal no está conectado. Hace falta una Edge Function y no se ha cobrado nada.',
  paypalWebhook: 'El webhook de PayPal no está desplegado.',
  linkTelegramAccount: 'Telegram no está conectado. Hace falta una Edge Function.',
  unlinkTelegramAccount: 'Telegram no está conectado. Hace falta una Edge Function.',
  setupTelegramWebhook: 'Telegram no está conectado. Hace falta una Edge Function.',
  telegramWebhook: 'Telegram no está conectado. Hace falta una Edge Function.',
  telegramDailyReminder: 'Los recordatorios de Telegram no están desplegados.',
  testTelegramBot: 'No hay bot de Telegram en este entorno.',
  sendTelegramNotification: 'Telegram no está conectado. Hace falta una Edge Function.',
  sendWelcomeEmail: 'El correo real no está conectado. Hace falta una Edge Function.',
  sendReactivationEmail: 'El correo real no está conectado. Hace falta una Edge Function.',
  sendWeeklyDigest: 'El correo real no está conectado. Hace falta una Edge Function.',
  sendMotivationalBoost: 'El correo real no está conectado. Hace falta una Edge Function.',
  sendBulkReactivation: 'El correo real no está conectado. Hace falta una Edge Function.',
  sendTestEmail: 'El correo real no está conectado. Hace falta una Edge Function.',
  generateShareImage: 'La generación de imágenes no está conectada. Hace falta una Edge Function.',
};

function profileToUser(row, role = 'user') {
  if (!row) return null;
  const data = { ...(row.data || {}) };
  delete data.role;
  return {
    ...data,
    id: row.id,
    email: row.email || data.email,
    role,
    created_date: data.created_date || row.created_at,
    updated_date: row.updated_at,
  };
}

function rowToRecord(row) {
  if (!row) return null;
  const data = row.data || {};
  return {
    ...data,
    id: row.id,
    created_date: data.created_date || row.created_at,
    updated_date: data.updated_date || row.updated_at,
  };
}

export function createSupabaseAdapter({ url, anonKey }) {
  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  async function loadRole(userId) {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle();
    return data?.role || 'user';
  }

  const auth = {
    async isAuthenticated() {
      const { data } = await supabase.auth.getSession();
      return Boolean(data.session?.user);
    },
    async me() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return null;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileError) fail(profileError.message);
      if (!profile) return null;
      return profileToUser(profile, await loadRole(data.user.id));
    },
    async updateMe(patch) {
      const current = await auth.me();
      if (!current) fail('No hay sesión');
      const next = { ...current, ...(patch || {}) };
      delete next.id;
      delete next.email;
      delete next.role;
      delete next.created_date;
      delete next.updated_date;
      const { error } = await supabase.from('profiles').update({
        data: next,
        updated_at: new Date().toISOString(),
      }).eq('id', current.id);
      if (error) fail(error.message);
      return auth.me();
    },
    async signInWithPassword({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) fail(error.message);
      return data.user;
    },
    async signUp({ email, password, fullName }) {
      const redirect = typeof window !== 'undefined' ? `${window.location.origin}/login?next=/onboarding` : undefined;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirect,
          data: { full_name: fullName || '' },
        },
      });
      if (error) fail(error.message);
      return { user: data.user, session: data.session, needsConfirmation: !data.session };
    },
    async signInWithOtp({ email }) {
      const redirect = typeof window !== 'undefined' ? `${window.location.origin}/login?next=/dashboard` : undefined;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect },
      });
      if (error) fail(error.message);
      return { sent: true };
    },
    redirectToLogin(next) {
      if (typeof window === 'undefined') return;
      const target = typeof next === 'string' && next ? next : '/dashboard';
      window.location.href = `/login?next=${encodeURIComponent(target)}`;
    },
    async logout(redirect) {
      await supabase.auth.signOut();
      if (typeof window === 'undefined') return;
      if (typeof redirect === 'string' && redirect) window.location.href = redirect;
      else if (redirect !== false) window.location.href = '/';
    },
  };

  function entityApi(table) {
    return {
      async filter(query, sort, limit) {
        const { data, error } = await supabase.from(table).select('*').limit(1000);
        if (error) fail(error.message);
        return applyWindow((data || []).map(rowToRecord).filter((row) => matches(row, query)), sort, limit);
      },
      async list(sort, limit) {
        return this.filter(undefined, sort, limit);
      },
      async get(id) {
        const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
        if (error) fail(error.message);
        return rowToRecord(data);
      },
      async create(input) {
        const user = await auth.me();
        const id = input?.id || (crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}`);
        const data = {
          ...(input || {}),
          id,
          created_by: input?.created_by || user?.email || null,
          created_date: input?.created_date || new Date().toISOString(),
        };
        const { data: row, error } = await supabase.from(table).insert({ id, data }).select('*').single();
        if (error) fail(error.message);
        return rowToRecord(row);
      },
      async update(id, patch) {
        const current = await this.get(id);
        if (!current) fail('No se encontró el registro');
        const data = { ...current, ...(patch || {}), id };
        const { data: row, error } = await supabase.from(table).update({ data }).eq('id', id).select('*').single();
        if (error) fail(error.message);
        return rowToRecord(row);
      },
      async delete(id) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) fail(error.message);
        return { id, deleted: true };
      },
    };
  }

  const userEntity = {
    async filter(query, sort, limit) {
      const [{ data, error }, roles] = await Promise.all([
        supabase.from('profiles').select('*').limit(1000),
        supabase.from('user_roles').select('user_id, role'),
      ]);
      if (error) fail(error.message);
      const roleById = new Map((roles.data || []).map((row) => [row.user_id, row.role]));
      const users = (data || []).map((row) => profileToUser(row, roleById.get(row.id) || 'user'));
      return applyWindow(users.filter((user) => matches(user, query)), sort, limit);
    },
    async list(sort, limit) {
      return this.filter(undefined, sort, limit);
    },
    async get(id) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (error) fail(error.message);
      if (!data) return null;
      return profileToUser(data, await loadRole(id));
    },
    async create() {
      fail('La cuenta se crea con el registro, no como una fila suelta.');
    },
    async update(id, patch) {
      const current = await this.get(id);
      if (!current) fail('No se encontró la persona');
      const next = { ...current, ...(patch || {}) };
      delete next.id;
      delete next.email;
      delete next.role;
      delete next.created_date;
      delete next.updated_date;
      const { error } = await supabase.from('profiles').update({ data: next }).eq('id', id);
      if (error) fail(error.message);
      return this.get(id);
    },
    async delete() {
      fail('Borrar la cuenta de Auth no está disponible desde el navegador.');
    },
  };

  const entities = new Proxy({}, {
    get(_target, prop) {
      if (prop === 'User') return userEntity;
      if (prop === 'Query') return entityApi('stat_views');
      const table = ENTITY_TABLE[prop];
      if (!table) return entityApi('stat_views');
      return entityApi(table);
    },
  });

  async function invoke(name, payload = {}) {
    if (SERVER_ONLY[name]) fail(SERVER_ONLY[name]);
    const user = await auth.me();
    if (!user) fail('Necesitas entrar.');

    if (name === 'listAllUsers') {
      return { users: await userEntity.list() };
    }
    if (name === 'getUserByIdentifier') {
      const ident = String(payload.identifier || '').toLowerCase();
      const users = await userEntity.list();
      const found = users.find((row) => row.username?.toLowerCase() === ident || row.email?.toLowerCase() === ident);
      return { user: found || null };
    }
    if (name === 'analyzeHabitCategory') {
      return { category: categoryFor(`${payload.habit_name || ''} ${payload.habit_description || ''}`) };
    }
    if (name === 'generateOnboardingHabits') {
      return invokeLocalLlm({ prompt: payload.goal || '', response_json_schema: { properties: { habits: {} } } });
    }
    if (name === 'purchaseItem') {
      const items = await entities.ShopItem.filter({ item_id: payload.item_id });
      if (!items.length) fail('Item no encontrado');
      const item = items[0];
      const owned = user.owned_items || [];
      if (owned.includes(item.item_id)) fail('Ya posees este item');
      const price = Number(item.price || 0);
      if ((user.coins || 0) < price) fail('Fondos insuficientes');
      const ownedItems = [...owned, item.item_id];
      const updated = await auth.updateMe({
        coins: (user.coins || 0) - price,
        owned_items: ownedItems,
        owned_shop_items: [...new Set([...(user.owned_shop_items || []), item.item_id])],
        purchased_colors: payload.custom_color
          ? { ...(user.purchased_colors || {}), [item.item_id]: payload.custom_color }
          : user.purchased_colors,
      });
      return { success: true, remaining_coins: updated.coins, item_id: item.item_id };
    }
    if (name === 'purchasePack') {
      const packs = await entities.ShopPack.filter({});
      const pack = packs.find((row) => row.pack_id === payload.pack_id || row.id === payload.pack_id);
      if (!pack) fail('Pack no encontrado');
      const price = Number(pack.discount_price || pack.discountPrice || 0);
      if ((user.coins || 0) < price) fail('Fondos insuficientes');
      const items = await entities.ShopItem.list();
      const full = (pack.item_ids || []).reduce((sum, id) => sum + Number(items.find((item) => item.item_id === id)?.price || 0), 0);
      const owned = new Set([...(user.owned_items || []), ...(pack.item_ids || [])]);
      const updated = await auth.updateMe({
        coins: (user.coins || 0) - price,
        owned_items: [...owned],
        owned_shop_items: [...owned],
      });
      return { success: true, remaining_coins: updated.coins, savings: Math.max(0, full - price) };
    }
    if (name === 'openLootBox') {
      const boxes = await entities.LootBox.filter({});
      const box = boxes.find((row) => row.box_id === payload.box_id || row.id === payload.box_id);
      if (!box) fail('Caja no encontrada');
      const price = Number(box.price || 0);
      if ((user.coins || 0) < price) fail('Fondos insuficientes');
      const owned = new Set(user.owned_items || []);
      const eligible = (await entities.ShopItem.filter({ is_available: true }))
        .filter((item) => (box.possible_rarities || []).includes(item.rarity) && !owned.has(item.item_id))
        .sort((a, b) => a.item_id.localeCompare(b.item_id));
      if (!eligible.length) fail('Ya tienes todas las piezas de esta colección');
      const selected = eligible.slice(0, box.item_count || 1);
      selected.forEach((item) => owned.add(item.item_id));
      const updated = await auth.updateMe({
        coins: (user.coins || 0) - price,
        owned_items: [...owned],
        owned_shop_items: [...owned],
        lootboxes_opened: (user.lootboxes_opened || 0) + 1,
      });
      return {
        success: true,
        deterministic: true,
        items: selected.map((item) => ({ item_id: item.item_id, name: item.name, icon: item.icon, rarity: item.rarity })),
        remaining_coins: updated.coins,
      };
    }
    if (name === 'updateBadgeProgress') {
      const rows = await entities.UserBadge.filter({ user_email: user.email, badge_id: payload.badge_id });
      if (!rows.length) {
        const badge = await entities.UserBadge.create({
          user_email: user.email,
          badge_id: payload.badge_id,
          current_progress: payload.progress_value || 1,
          current_level: 1,
        });
        return { success: true, badge };
      }
      const badge = await entities.UserBadge.update(rows[0].id, {
        current_progress: payload.progress_value ?? (rows[0].current_progress || 0) + 1,
      });
      return { success: true, badge };
    }
    if (name === 'updateWeeklyProgress') {
      const rows = await entities.ProjectWeekStatus.filter({ project_id: payload.project_id, user_email: user.email });
      if (!rows.length) {
        await entities.ProjectWeekStatus.create({
          project_id: payload.project_id,
          user_email: user.email,
          week: new Date().toISOString().slice(0, 10),
          progress: 1,
        });
      } else {
        await entities.ProjectWeekStatus.update(rows[0].id, { progress: (rows[0].progress || 0) + 1 });
      }
      return { success: true };
    }
    fail(`La función ${name} no está disponible en el cliente. Hace falta una Edge Function.`);
  }

  const listeners = new Map();
  const agents = {
    async listConversations(filter = {}) {
      const user = await auth.me();
      if (!user) return [];
      const { data, error } = await supabase.from('coach_conversations').select('*').eq('owner_id', user.id);
      if (error) fail(error.message);
      return (data || [])
        .map((row) => ({ id: row.id, agent_name: row.agent_name, metadata: row.metadata || {}, messages: row.messages || [] }))
        .filter((row) => !filter.agent_name || row.agent_name === filter.agent_name);
    },
    async createConversation(input) {
      const user = await auth.me();
      if (!user) fail('Necesitas entrar.');
      const id = crypto.randomUUID ? crypto.randomUUID() : `conv_${Date.now()}`;
      const messages = [{
        id: 'hello',
        role: 'assistant',
        content: 'Hola. Puedo mirar tus hábitos y proponerte un paso pequeño. Todavía no hay un modelo de IA conectado.',
        created_date: new Date().toISOString(),
      }];
      const { data, error } = await supabase.from('coach_conversations').insert({
        id,
        owner_id: user.id,
        agent_name: input.agent_name || 'habit_coach',
        metadata: input.metadata || {},
        messages,
      }).select('*').single();
      if (error) fail(error.message);
      return { id: data.id, agent_name: data.agent_name, metadata: data.metadata, messages: data.messages };
    },
    subscribeToConversation(id, callback) {
      const list = listeners.get(id) || [];
      list.push(callback);
      listeners.set(id, list);
      const channel = supabase.channel(`coach-${id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'coach_conversations', filter: `id=eq.${id}` }, (payload) => {
          callback({ messages: payload.new?.messages || [] });
        })
        .subscribe();
      return () => {
        listeners.set(id, (listeners.get(id) || []).filter((fn) => fn !== callback));
        supabase.removeChannel(channel);
      };
    },
    async addMessage(conversation, message) {
      const user = await auth.me();
      const { data: row, error } = await supabase.from('coach_conversations').select('*').eq('id', conversation.id).single();
      if (error) fail(error.message);
      const messages = [...(row.messages || []), {
        id: `msg_${Date.now()}`,
        role: message.role,
        content: message.content,
        created_date: new Date().toISOString(),
      }];
      if (message.role === 'user' && user) {
        const habits = await entities.Habit.filter({ created_by: user.email, is_active: true });
        const projects = await entities.Project.filter({ created_by: user.email, status: 'active' });
        messages.push({
          id: `msg_${Date.now()}_a`,
          role: 'assistant',
          content: coachReply(message.content, habits, projects),
          created_date: new Date().toISOString(),
        });
      }
      const { error: updateError } = await supabase.from('coach_conversations').update({ messages }).eq('id', row.id);
      if (updateError) fail(updateError.message);
      (listeners.get(row.id) || []).forEach((fn) => fn({ messages }));
      return { id: row.id, messages };
    },
    getWhatsAppConnectURL() {
      return '';
    },
  };

  return {
    adapter: 'supabase',
    auth,
    entities,
    functions: {
      invoke: (name, payload) => invoke(name, payload).then((data) => ({ data })),
    },
    integrations: {
      Core: {
        InvokeLLM: async (args) => invokeLocalLlm(args || {}),
        UploadFile: async ({ file }) => {
          const user = await auth.me();
          if (!user) fail('Necesitas entrar para subir un archivo.');
          if (!file) return { file_url: '' };
          const ext = (file.name || 'archivo').split('.').pop();
          const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const { error } = await supabase.storage.from('uploads').upload(path, file, {
            upsert: false,
            contentType: file.type || 'application/octet-stream',
          });
          if (error) fail(error.message);
          const { data } = supabase.storage.from('uploads').getPublicUrl(path);
          return { file_url: data.publicUrl };
        },
        SendEmail: async () => fail('El correo real no está conectado. Hace falta una Edge Function.'),
        SendSMS: async () => fail('El SMS no está conectado. Hace falta una Edge Function.'),
        GenerateImage: async () => fail('La generación de imágenes no está conectada. Hace falta una Edge Function.'),
        ExtractDataFromUploadedFile: async () => ({ data: {}, error: 'La extracción de archivos no está conectada.' }),
      },
    },
    agents,
    appLogs: {
      async logUserInApp() {
        return { ok: true };
      },
    },
    asServiceRole: { entities, auth },
  };
}
