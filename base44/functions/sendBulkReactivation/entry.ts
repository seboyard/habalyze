import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { min_days_inactive = 3, max_days_inactive = null, dry_run = false } = body;

    // Get all users
    const allUsers = await db.asServiceRole.entities.User.list();

    const now = new Date();
    const inactiveUsers = allUsers.filter(u => {
      if (!u.last_login_date) return false;
      const daysSince = Math.floor((now - new Date(u.last_login_date)) / (1000 * 60 * 60 * 24));
      if (daysSince < min_days_inactive) return false;
      if (max_days_inactive && daysSince > max_days_inactive) return false;
      return true;
    });

    if (dry_run) {
      return Response.json({
        dry_run: true,
        would_send_to: inactiveUsers.length,
        users: inactiveUsers.map(u => ({
          email: u.email,
          name: u.full_name,
          days_inactive: Math.floor((now - new Date(u.last_login_date)) / (1000 * 60 * 60 * 24))
        }))
      });
    }

    const results = { sent: 0, failed: 0, errors: [] };

    for (const targetUser of inactiveUsers) {
      try {
        const daysInactive = Math.floor((now - new Date(targetUser.last_login_date)) / (1000 * 60 * 60 * 24));
        const habits = await db.asServiceRole.entities.Habit.filter({ created_by: targetUser.email });
        const activeHabits = habits.filter(h => h.is_active !== false);
        const bestStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);
        const totalCompletions = habits.reduce((sum, h) => sum + (h.total_completions || 0), 0);

        let subject = '';
        let emailBody = '';

        const appUrl = 'https://habalyze.db.app';

        if (daysInactive <= 3) {
          subject = `${targetUser.full_name}, ¡tus hábitos te extrañan! 🔥`;
          emailBody = buildEarlyEmail(targetUser, daysInactive, activeHabits, appUrl);
        } else if (daysInactive <= 7) {
          subject = `${targetUser.full_name}, no pierdas lo que construiste 💪`;
          emailBody = buildMediumEmail(targetUser, daysInactive, bestStreak, appUrl);
        } else if (daysInactive <= 30) {
          subject = `Extrañamos verte por Habalyze, ${targetUser.full_name} 🌟`;
          emailBody = buildLongEmail(targetUser, daysInactive, totalCompletions, activeHabits, appUrl);
        } else {
          subject = `${targetUser.full_name}, tienes un regalo esperándote 🎁`;
          emailBody = buildWinbackEmail(targetUser, daysInactive, totalCompletions, appUrl);
        }

        await db.asServiceRole.integrations.Core.SendEmail({
          to: targetUser.email,
          subject,
          body: emailBody
        });

        results.sent++;

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        results.failed++;
        results.errors.push({ email: targetUser.email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      total_inactive: inactiveUsers.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ─── Email Templates ────────────────────────────────────────────────────────

function baseWrapper(content, accentColor = '#7c3aed') {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%);padding:36px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 20px;margin-bottom:12px;">
              <span style="font-size:28px;font-weight:900;color:white;letter-spacing:-1px;">Habalyze</span>
            </div>
            <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">Analiza. Mejora. Conquista.</p>
          </td>
        </tr>

        <!-- Content -->
        <tr><td style="padding:40px;">${content}</td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0 0 8px 0;">Habalyze · Tu coach personal de hábitos</p>
            <p style="color:#d1d5db;font-size:11px;margin:0;">Recibiste este correo porque tienes una cuenta en Habalyze.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(text, url, color = '#7c3aed') {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
  <tr><td align="center">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,${color},#ec4899);color:white;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:17px;letter-spacing:0.3px;box-shadow:0 6px 20px rgba(124,58,237,0.4);">
      ${text}
    </a>
  </td></tr>
</table>`;
}

function statsBox(items) {
  const rows = items.map(item => `
    <td style="text-align:center;padding:16px 12px;border-right:1px solid #e5e7eb;">
      <div style="font-size:28px;margin-bottom:4px;">${item.emoji}</div>
      <div style="font-size:20px;font-weight:800;color:#1f2937;">${item.value}</div>
      <div style="font-size:12px;color:#6b7280;">${item.label}</div>
    </td>
  `).join('');
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:16px;margin:20px 0;overflow:hidden;border:1px solid #e5e7eb;">
  <tr>${rows}</tr>
</table>`;
}

function buildEarlyEmail(user, days, activeHabits, appUrl) {
  const content = `
<h1 style="color:#1f2937;font-size:26px;font-weight:800;margin:0 0 8px 0;">
  ¡Hola, ${user.full_name}! 👋
</h1>
<p style="color:#6b7280;font-size:15px;margin:0 0 24px 0;">
  Han pasado <strong style="color:#7c3aed;">${days} día${days > 1 ? 's' : ''}</strong> desde tu última visita. ¡Tus hábitos siguen esperándote!
</p>

${statsBox([
  { emoji: '⭐', value: `Nv. ${user.level || 1}`, label: 'Tu nivel' },
  { emoji: '🔥', value: activeHabits.length, label: 'Hábitos activos' },
  { emoji: '💰', value: user.coins || 0, label: 'Monedas' }
])}

${activeHabits.length > 0 ? `
<div style="background:#faf5ff;border-left:4px solid #7c3aed;border-radius:0 12px 12px 0;padding:16px 20px;margin:20px 0;">
  <p style="color:#5b21b6;font-size:15px;font-weight:600;margin:0 0 6px 0;">💡 Coach IA dice:</p>
  <p style="color:#6d28d9;font-size:14px;margin:0;">
    Empieza con <strong>${activeHabits[0].name}</strong>. Solo 5 minutos es todo lo que necesitas para retomar el ritmo.
  </p>
</div>
` : ''}

${ctaButton('Retomar mis hábitos 🚀', `${appUrl}/Dashboard`)}

<p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">La consistencia se construye un día a la vez. ¡Tú puedes! 💜</p>
`;
  return baseWrapper(content);
}

function buildMediumEmail(user, days, bestStreak, appUrl) {
  const content = `
<h1 style="color:#1f2937;font-size:26px;font-weight:800;margin:0 0 8px 0;">
  ${user.full_name}, ¡vuelve a brillar! ✨
</h1>
<p style="color:#6b7280;font-size:15px;margin:0 0 24px 0;">
  Son <strong style="color:#db2777;">${days} días</strong> desde tu última sesión. Pero tu racha de <strong style="color:#7c3aed;">${bestStreak} días</strong> aún está en tus logros.
</p>

${statsBox([
  { emoji: '🏆', value: `${bestStreak}d`, label: 'Mejor racha' },
  { emoji: '💎', value: user.gems || 0, label: 'Gemas' },
  { emoji: '⚡', value: `Nv.${user.level || 1}`, label: 'Nivel' }
])}

<div style="background:linear-gradient(135deg,#fdf4ff,#fce7f3);border-radius:16px;padding:20px;margin:20px 0;border:1px solid #e879f9;">
  <p style="color:#86198f;font-size:15px;font-weight:700;margin:0 0 8px 0;">🧠 Estrategia del Coach IA:</p>
  <p style="color:#701a75;font-size:14px;margin:0;line-height:1.6;">
    No intentes retomar todo a la vez. Elige <strong>1 solo hábito</strong> y complétalo hoy. 
    Eso es todo lo que necesitas para recuperar el impulso.
  </p>
</div>

${ctaButton('Volver a mi rutina 💪', `${appUrl}/Dashboard`)}

<p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">Los grandes logros empiezan con pequeños pasos consistentes. 💜</p>
`;
  return baseWrapper(content);
}

function buildLongEmail(user, days, totalCompletions, activeHabits, appUrl) {
  const content = `
<h1 style="color:#1f2937;font-size:26px;font-weight:800;margin:0 0 8px 0;">
  ¡${user.full_name}, te extrañamos! 🌟
</h1>
<p style="color:#6b7280;font-size:15px;margin:0 0 24px 0;">
  Han pasado <strong style="color:#dc2626;">${days} días</strong> desde tu última visita. Tu cuenta está intacta y lista para ti.
</p>

${totalCompletions > 0 ? statsBox([
  { emoji: '✅', value: totalCompletions, label: 'Hábitos completados' },
  { emoji: '💰', value: user.coins || 0, label: 'Monedas guardadas' },
  { emoji: '👕', value: (user.owned_items || []).length, label: 'Items en inventario' }
]) : ''}

<div style="background:#fff7ed;border-radius:16px;padding:24px;margin:24px 0;border:2px solid #fed7aa;text-align:center;">
  <p style="font-size:32px;margin:0 0 8px 0;">🎁</p>
  <p style="color:#92400e;font-size:18px;font-weight:800;margin:0 0 8px 0;">Regalo de Bienvenida de Regreso</p>
  <p style="color:#b45309;font-size:15px;margin:0 0 4px 0;"><strong>+50 monedas gratis</strong> al volver hoy</p>
  <p style="color:#b45309;font-size:15px;margin:0 0 12px 0;"><strong>+1 Caja Sorpresa</strong> para tu avatar</p>
  <p style="color:#d97706;font-size:12px;margin:0;">⏰ Válido por 48 horas</p>
</div>

${ctaButton('Reclamar mi regalo 🎁', `${appUrl}/Dashboard`)}

<p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">Tu progreso nunca se borró. Solo está esperando que regreses. 💜</p>
`;
  return baseWrapper(content);
}

function buildWinbackEmail(user, days, totalCompletions, appUrl) {
  const content = `
<div style="text-align:center;margin-bottom:28px;">
  <div style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);border-radius:50%;width:80px;height:80px;line-height:80px;font-size:40px;">🌱</div>
</div>

<h1 style="color:#1f2937;font-size:26px;font-weight:800;margin:0 0 8px 0;text-align:center;">
  Nunca es tarde para empezar de nuevo
</h1>
<p style="color:#6b7280;font-size:15px;margin:0 0 24px 0;text-align:center;">
  Hola ${user.full_name}, hace <strong style="color:#7c3aed;">${days} días</strong> que no te vemos. Pero tu cuenta te espera.
</p>

${totalCompletions > 0 ? `
<div style="background:#faf5ff;border-radius:16px;padding:20px;margin:20px 0;text-align:center;">
  <p style="color:#5b21b6;font-size:16px;margin:0 0 12px 0;font-weight:700;">Lo que construiste antes sigue aquí:</p>
  <p style="color:#6d28d9;font-size:24px;font-weight:900;margin:0;">${totalCompletions} hábitos completados</p>
  <p style="color:#8b5cf6;font-size:13px;margin:4px 0 0 0;">Este historial nunca desaparece.</p>
</div>
` : ''}

<div style="background:linear-gradient(135deg,#fff7ed,#fce7f3);border-radius:16px;padding:24px;margin:24px 0;border:2px dashed #f9a8d4;text-align:center;">
  <p style="font-size:24px;margin:0 0 8px 0;">🎁✨</p>
  <p style="color:#9d174d;font-size:17px;font-weight:800;margin:0 0 12px 0;">Pack de Reactivación Especial</p>
  <div style="display:inline-block;text-align:left;">
    <p style="color:#be185d;font-size:14px;margin:4px 0;">✅ +100 monedas de bienvenida</p>
    <p style="color:#be185d;font-size:14px;margin:4px 0;">✅ +1 Caja Épica para tu avatar</p>
    <p style="color:#be185d;font-size:14px;margin:4px 0;">✅ Acceso a plantillas de hábitos premium</p>
  </div>
  <p style="color:#db2777;font-size:12px;margin:12px 0 0 0;font-weight:600;">⏰ Oferta válida por las próximas 72 horas</p>
</div>

${ctaButton('Quiero volver a Habalyze 🚀', `${appUrl}/Dashboard`, '#db2777')}

<p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">
  El mejor momento para empezar fue ayer. El segundo mejor momento es ahora. 💜
</p>
`;
  return baseWrapper(content);
}