import manifest from '../../avatar/neoPixelManifest.json';

export const DEMO_EMAIL = 'demo.local@habalyze.app';
export const SEED_VERSION = 3;

const day = (offset) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const iso = (offset) => `${day(offset)}T12:00:00.000Z`;

export function configFromPreset(presetId) {
  const preset = manifest.presets[presetId] || manifest.presets.lumo;
  return {
    engine: 'neo',
    preset: preset.id,
    rig: preset.rig,
    body: preset.body,
    expression: preset.expression,
    hair: preset.hair || null,
    horns: preset.horns || null,
    headwear: preset.headwear || null,
    upper: preset.upper || null,
    lower: preset.lower || null,
    shoes: preset.shoes || null,
    backpack: preset.backpack || null,
    hand: preset.hand || null,
    pet: preset.pet || null,
    aura: preset.aura || null,
    scene: preset.scene || 'habitacion_cozy',
  };
}

function shopItems() {
  const catalog = [...manifest.items, ...manifest.auras];
  return catalog
    .filter((item) => item.shopCategory)
    .map((item, index) => ({
      id: `shop_${item.id}`,
      item_id: item.id,
      name: item.name,
      description: item.free
        ? 'Pieza inicial. Se consigue sin gastar monedas.'
        : 'Cosmético fijo. Se compra con monedas ganadas en hábitos, nunca con dinero ni con azar.',
      category: item.shopCategory,
      style_id: item.id,
      price: item.price || 0,
      gem_price: 0,
      rarity: item.rarity || 'common',
      icon: item.icon || '✨',
      color: '#693CA1',
      is_available: true,
      is_new: index < 8,
      sort_order: index,
      sales_count: 20 - (index % 7),
      unlock_requirement: item.unlock?.type && item.unlock.type !== 'none'
        ? item.unlock
        : { type: 'none' },
      created_date: iso(-30),
    }));
}

function ownedFromPreset(presetId) {
  const config = configFromPreset(presetId);
  return Object.values(config).filter((value) => typeof value === 'string' && (
    value.startsWith('hair_') || value.startsWith('top_') || value.startsWith('shorts_')
    || value.startsWith('pants_') || value.startsWith('skirt_') || value.startsWith('shoes_')
    || value.startsWith('hat_') || value.startsWith('pet_') || value.startsWith('prop_')
    || value.startsWith('horns_') || value.startsWith('antenna_') || value.startsWith('glasses_')
    || value.startsWith('cape_') || value.startsWith('bag_') || value.startsWith('jeans')
  ));
}

export function buildSeed() {
  const items = shopItems();
  const freeIds = items.filter((item) => item.price === 0).map((item) => item.item_id);
  const owned = Array.from(new Set([...freeIds, ...ownedFromPreset('lumo')]));
  const demo = {
    id: 'user_demo',
    email: DEMO_EMAIL,
    full_name: 'Lina Habalyze',
    display_name: 'Lina',
    username: 'lina',
    role: 'admin',
    bio: 'Cuido un huerto pequeño y anoto lo que sí hice hoy.',
    level: 4,
    experience: 340,
    coins: 480,
    gems: 0,
    is_premium: false,
    premium_until: null,
    has_used_trial: false,
    best_streak: 7,
    avatar_config: configFromPreset('lumo'),
    owned_items: owned,
    owned_shop_items: owned,
    wishlist: ['hat_flower'],
    saved_outfits: [],
    referral_code: 'LINA-LOCAL',
    referral_count: 1,
    lootboxes_opened: 0,
    theme: 'light',
    accent_color: 'violet',
    notification_settings: { email: false, push: true, coach: true },
    linked_accounts: {},
    created_date: iso(-40),
  };

  const brasa = {
    id: 'user_brasa',
    email: 'brasa.local@habalyze.app',
    full_name: 'Brasa',
    display_name: 'Brasa',
    username: 'brasa',
    role: 'user',
    level: 6,
    experience: 820,
    coins: 200,
    avatar_config: configFromPreset('brasa'),
    is_private: false,
    created_date: iso(-20),
  };
  const vek = {
    id: 'user_vek',
    email: 'vek.local@habalyze.app',
    full_name: 'Vek',
    display_name: 'Vek',
    username: 'vek',
    role: 'user',
    level: 5,
    experience: 610,
    coins: 140,
    avatar_config: configFromPreset('vek'),
    is_private: false,
    created_date: iso(-18),
  };
  const nix = {
    id: 'user_nix',
    email: 'nix.local@habalyze.app',
    full_name: 'Nix',
    display_name: 'Nix',
    username: 'nix',
    role: 'user',
    level: 3,
    experience: 210,
    coins: 90,
    avatar_config: configFromPreset('nix'),
    is_private: false,
    created_date: iso(-12),
  };

  const habits = [
    { id: 'habit_agua', name: 'Beber un vaso de agua', description: 'Al empezar la mañana, antes del café.', icon: 'droplet', color: 'teal', frequency: 'daily', current_streak: 7, best_streak: 7, total_completions: 18, last_completed: day(0), scheduled_times: ['08:00'] },
    { id: 'habit_leer', name: 'Leer 10 páginas', description: 'Un capítulo corto, sin pantalla.', icon: 'book', color: 'purple', frequency: 'daily', current_streak: 4, best_streak: 9, total_completions: 12, last_completed: day(-1), scheduled_times: ['21:30'] },
    { id: 'habit_mover', name: 'Mover el cuerpo 15 min', description: 'Caminar, estirar o lo que el cuerpo pida.', icon: 'dumbbell', color: 'orange', frequency: 'daily', current_streak: 2, best_streak: 5, total_completions: 8, last_completed: day(-1), scheduled_times: ['18:00'] },
    { id: 'habit_dormir', name: 'Acostar la pantalla', description: 'Dejar el teléfono fuera de la cama.', icon: 'moon', color: 'pink', frequency: 'daily', current_streak: 1, best_streak: 3, total_completions: 4, last_completed: day(-1), scheduled_times: ['23:00'] },
  ].map((habit) => ({
    ...habit,
    is_active: true,
    created_by: DEMO_EMAIL,
    parent_habit_id: null,
    times_per_day: 1,
    created_date: iso(-21),
  }));

  const logs = [];
  for (let offset = -6; offset <= 0; offset += 1) {
    logs.push({ id: `log_agua_${offset}`, habit_id: 'habit_agua', completed_date: day(offset), created_by: DEMO_EMAIL, created_date: iso(offset) });
  }
  for (const offset of [-4, -3, -2, -1]) {
    logs.push({ id: `log_leer_${offset}`, habit_id: 'habit_leer', completed_date: day(offset), created_by: DEMO_EMAIL, created_date: iso(offset) });
  }
  for (const offset of [-2, -1]) {
    logs.push({ id: `log_mover_${offset}`, habit_id: 'habit_mover', completed_date: day(offset), created_by: DEMO_EMAIL, created_date: iso(offset) });
  }
  logs.push({ id: 'log_dormir_1', habit_id: 'habit_dormir', completed_date: day(-1), created_by: DEMO_EMAIL, created_date: iso(-1) });

  return {
    seedVersion: SEED_VERSION,
    sessionUserId: null,
    conversations: [],
    emails: [],
    collections: {
      User: [demo, brasa, vek, nix],
      UserPreferences: [{
        id: 'prefs_demo',
        user_email: DEMO_EMAIL,
        onboarding_status: 'completed',
        has_completed_tour: true,
        quick_start_dismissed: true,
        feature_discovery_dismissed: true,
        show_quick_start_guide: false,
        show_project_tasks_on_dashboard: true,
        created_date: iso(-40),
      }],
      Habit: habits,
      HabitLog: logs,
      Goal: [{
        id: 'goal_huerto',
        title: 'Cuidar el huerto tres meses',
        description: 'Regar, anotar y no abandonar las macetas.',
        target_type: 'custom',
        target_value: 100,
        current_value: 35,
        current_progress: 35,
        start_date: day(-20),
        end_date: day(70),
        status: 'active',
        icon: '🌱',
        color: 'green',
        created_by: DEMO_EMAIL,
        created_date: iso(-20),
      }],
      Project: [{
        id: 'project_huerto',
        name: 'Huerto de la ventana',
        description: 'Un camino corto para tener hierbas vivas en casa.',
        icon: '🌿',
        status: 'active',
        progress: 30,
        weekly_tracking_enabled: true,
        created_by: DEMO_EMAIL,
        created_date: iso(-15),
      }],
      ProjectTask: [
        { id: 'task_macetas', project_id: 'project_huerto', title: 'Elegir tres macetas', description: 'Que quepan en el alféizar.', status: 'completed', order: 1, type: 'setup', is_setup: true, completed_date: day(-10), created_date: iso(-15) },
        { id: 'task_riego', project_id: 'project_huerto', title: 'Dejar el riego a la vista', description: 'Una jarra junto a la ventana.', status: 'pending', order: 2, type: 'one-time', created_date: iso(-15) },
        { id: 'task_nota', project_id: 'project_huerto', title: 'Anotar qué brotó', description: 'Una línea en el cuaderno, no una app nueva.', status: 'pending', order: 3, type: 'weekly', created_date: iso(-14) },
      ],
      ShopItem: items,
      LootBox: [{
        id: 'box_constancia',
        box_id: 'constancia',
        name: 'Cofre de constancia',
        description: 'Entrega la siguiente pieza de la colección, siempre en el mismo orden. No es una caja aleatoria y no se paga con dinero.',
        price: 0,
        gem_price: 0,
        is_available: true,
        possible_rarities: ['common', 'rare', 'epic', 'legendary', 'exclusive'],
        item_count: 1,
        guaranteed_legendary: false,
        sort_order: 1,
        icon: '🎁',
        created_date: iso(-5),
      }],
      ShopPack: [{
        id: 'pack_huerto',
        pack_id: 'huerto',
        name: 'Pack huerto',
        description: 'Sudadera, shorts y botas. Precio fijo, sin azar.',
        price: 190,
        discount_price: 120,
        discountPrice: 120,
        item_ids: ['top_hoodie_green', 'shorts_green', 'shoes_brown'],
        is_available: true,
        sort_order: 1,
        icon: '🌿',
        created_date: iso(-5),
      }],
      Notification: [
        { id: 'note_racha', user_email: DEMO_EMAIL, type: 'streak', title: 'Racha de agua', message: 'Llevas 7 días seguidos con el vaso de la mañana.', icon: '🔥', is_read: false, link: '/dashboard', created_date: iso(0) },
        { id: 'note_amigo', user_email: DEMO_EMAIL, type: 'friend_request', title: 'Nix quiere conectar', message: 'Tienes una solicitud de amistad esperando.', icon: '👋', is_read: false, link: '/social', created_date: iso(-1) },
      ],
      Friendship: [
        { id: 'fr_brasa', user_email: DEMO_EMAIL, friend_email: brasa.email, status: 'accepted', created_date: iso(-10) },
        { id: 'fr_vek', user_email: DEMO_EMAIL, friend_email: vek.email, status: 'accepted', created_date: iso(-8) },
      ],
      FriendRequest: [{
        id: 'req_nix',
        from_user_email: nix.email,
        to_user_email: DEMO_EMAIL,
        status: 'pending',
        created_date: iso(-1),
      }],
      FriendActivity: [
        { id: 'act_brasa', user_email: brasa.email, type: 'habit_completed', title: 'Brasa cerró el entrenamiento', message: '15 minutos de movimiento. Racha de 5 días.', icon: '🔥', created_date: iso(0) },
        { id: 'act_vek', user_email: vek.email, type: 'habit_completed', title: 'Vek regó el invernadero', message: 'Curiosidad del día: una hoja nueva.', icon: '🌱', created_date: iso(-1) },
      ],
      Challenge: [{
        id: 'challenge_semana',
        name: 'Semana de agua',
        description: 'Siete vasos, sin competir contra nadie más que contra el olvido.',
        icon: '💧',
        status: 'active',
        start_date: day(-1),
        end_date: day(6),
        participant_count: 2,
        created_by: DEMO_EMAIL,
        created_date: iso(-1),
      }],
      ChallengeParticipant: [{
        id: 'cp_demo',
        challenge_id: 'challenge_semana',
        user_email: DEMO_EMAIL,
        progress: 1,
        created_date: iso(-1),
      }],
      Guild: [{
        id: 'guild_ventana',
        name: 'Gremio de la ventana',
        description: 'Gente que cuida plantas y hábitos pequeños.',
        icon: '🪟',
        total_xp: 420,
        member_count: 2,
        created_by: DEMO_EMAIL,
        created_date: iso(-9),
      }],
      GuildMember: [
        { id: 'gm_demo', guild_id: 'guild_ventana', user_email: DEMO_EMAIL, role: 'leader', contribution_xp: 200, created_date: iso(-9) },
        { id: 'gm_vek', guild_id: 'guild_ventana', user_email: vek.email, role: 'member', contribution_xp: 220, created_date: iso(-7) },
      ],
      GuildPost: [{
        id: 'gp_1',
        guild_id: 'guild_ventana',
        user_email: vek.email,
        content: 'Hoy brotó la albahaca. ¿Alguien más riega por la mañana?',
        created_date: iso(-1),
      }],
      Mission: [{
        id: 'mission_hoy',
        title: 'Cierra dos hábitos hoy',
        description: 'Marca dos hábitos antes de la noche.',
        type: 'daily',
        xp_reward: 40,
        coin_reward: 20,
        target: 2,
        is_active: true,
        created_date: iso(-2),
      }],
      UserMission: [],
      Achievement: [{
        id: 'ach_agua',
        achievement_id: 'agua_7',
        name: 'Manantial',
        description: 'Siete días seguidos bebiendo agua.',
        icon: '💧',
        xp_reward: 50,
        created_date: iso(-3),
      }],
      UserAchievement: [{
        id: 'ua_agua',
        user_email: DEMO_EMAIL,
        achievement_id: 'agua_7',
        unlocked_date: iso(0),
        created_date: iso(0),
      }],
      Badge: [
        { id: 'badge_agua', badge_id: 'lector', name: 'Lector', icon: '📚', levels: [{ level: 1, requirement_value: 1 }, { level: 2, requirement_value: 5 }], created_date: iso(-3) },
        { id: 'badge_atleta', badge_id: 'atleta', name: 'Atleta', icon: '🏃', levels: [{ level: 1, requirement_value: 1 }, { level: 2, requirement_value: 5 }], created_date: iso(-3) },
      ],
      UserBadge: [{
        id: 'ub_beta',
        user_email: DEMO_EMAIL,
        badge_id: 'beta_tester',
        current_level: 1,
        current_progress: 1,
        unlocked_date: iso(-40),
        is_featured: true,
        created_date: iso(-40),
      }],
      BlogPost: [{
        id: 'post_bienvenida',
        slug: 'bienvenida-neo-pixel',
        title: 'Neo Pixel Cozy ya vive en el vestidor',
        excerpt: 'Un estilo pixel, cálido y modular para el avatar de Habalyze.',
        content: 'Habalyze viste ahora con la ficha Neo Pixel Cozy: crema, violeta, menta y oro. Los cosméticos se desbloquean con constancia, no con cajas de pago.',
        is_published: true,
        published_date: day(-2),
        author: 'Habalyze',
        cover_emoji: '✨',
        created_date: iso(-2),
      }],
      Template: [{
        id: 'tpl_manana',
        name: 'Mañana tranquila',
        description: 'Agua, una página y la cama hecha.',
        type: 'habit',
        is_public: true,
        icon: 'sunrise',
        use_count: 3,
        payload: { name: 'Hacer la cama', icon: 'smile', color: 'yellow', frequency: 'daily' },
        created_date: iso(-6),
      }],
      ActivityReaction: [],
      ActivityComment: [],
      ChatMessage: [],
      Invitation: [],
      Gift: [],
      Perk: [],
      UserPerk: [],
      BrandAsset: [],
      BetaTester: [],
      ProjectWeekStatus: [],
      ProjectCollaborator: [],
      ProfileComment: [],
      StatView: [],
    },
  };
}
