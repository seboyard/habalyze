import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, days_inactive } = await req.json();

    // Get target user data
    const targetUsers = await db.asServiceRole.entities.User.filter({ email: user_email });
    if (targetUsers.length === 0) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const targetUser = targetUsers[0];

    // Get user's habits and stats
    const habits = await db.asServiceRole.entities.Habit.filter({ created_by: user_email });
    const userPrefs = await db.asServiceRole.entities.UserPreferences.filter({ user_email });
    const prefs = userPrefs.length > 0 ? userPrefs[0] : null;

    // Personalized email based on user profile
    let subject = '';
    let body = '';

    if (days_inactive <= 3) {
      // Early re-engagement (1-3 days)
      subject = `${targetUser.full_name}, ¡tu racha te está esperando! 🔥`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; padding: 40px;">
          <h1 style="font-size: 28px; margin-bottom: 20px;">¡Hola ${targetUser.full_name}! 👋</h1>
          
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
            Te extrañamos en Habalyze. Solo han pasado ${days_inactive} días, pero tus hábitos te están esperando.
          </p>

          <div style="background: rgba(255,255,255,0.2); border-radius: 15px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0;">🎯 Tu Progreso:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;">⭐ Nivel ${targetUser.level || 1}</li>
              <li style="margin: 10px 0;">💰 ${targetUser.coins || 0} monedas</li>
              <li style="margin: 10px 0;">📊 ${habits.length} hábitos activos</li>
            </ul>
          </div>

          ${habits.length > 0 ? `
            <p style="font-size: 16px; margin-bottom: 20px;">
              Tu hábito "${habits[0].name}" está esperándote. ¡Solo toma ${habits[0].name.includes('meditar') ? '10 minutos' : 'unos minutos'}!
            </p>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('BASE44_APP_URL') || 'https://habalyze.local'}/dashboard" 
               style="background: white; color: #667eea; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block;">
              Continuar mi racha 🔥
            </a>
          </div>

          <p style="font-size: 14px; opacity: 0.9; margin-top: 30px;">
            Recuerda: la constancia es la clave. ¡Tú puedes! 💪
          </p>
        </div>
      `;
    } else if (days_inactive <= 7) {
      // Medium re-engagement (4-7 days)
      const bestStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);
      subject = `No dejes que tu racha de ${bestStreak} días se pierda 😢`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 20px; padding: 40px;">
          <h1 style="font-size: 28px; margin-bottom: 20px;">¡${targetUser.full_name}! 🚨</h1>
          
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
            Han pasado ${days_inactive} días desde tu última visita. Tu mejor racha fue de <strong>${bestStreak} días</strong> - ¡no dejes que se pierda!
          </p>

          <div style="background: rgba(255,255,255,0.2); border-radius: 15px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0;">✨ Lo que has logrado:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;">🏆 Mejor racha: ${bestStreak} días</li>
              <li style="margin: 10px 0;">💎 ${targetUser.gems || 0} gemas acumuladas</li>
              <li style="margin: 10px 0;">🎯 Nivel ${targetUser.level || 1} alcanzado</li>
            </ul>
          </div>

          <p style="font-size: 16px; margin-bottom: 20px; background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px;">
            💡 <strong>Consejo del Coach IA:</strong> Empieza de nuevo con solo UN hábito simple. No intentes hacer todo a la vez.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('BASE44_APP_URL') || 'https://habalyze.local'}/dashboard" 
               style="background: white; color: #f5576c; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block;">
              Volver a empezar 🎯
            </a>
          </div>
        </div>
      `;
    } else {
      // Long-term re-engagement (8+ days)
      const totalCompletions = habits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
      subject = `${targetUser.full_name}, te tenemos una sorpresa especial 🎁`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #1a1a2e; border-radius: 20px; padding: 40px;">
          <h1 style="font-size: 28px; margin-bottom: 20px;">¡Hola de nuevo, ${targetUser.full_name}! 🌟</h1>
          
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
            Han pasado ${days_inactive} días, pero tu progreso sigue aquí, esperándote.
          </p>

          ${totalCompletions > 0 ? `
            <div style="background: rgba(255,255,255,0.9); border-radius: 15px; padding: 20px; margin: 20px 0; color: #1a1a2e;">
              <h3 style="margin-top: 0; color: #667eea;">🎉 Tus logros no se han borrado:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;">✅ ${totalCompletions} hábitos completados en total</li>
                <li style="margin: 10px 0;">💰 ${targetUser.coins || 0} monedas guardadas</li>
                <li style="margin: 10px 0;">👕 ${(targetUser.owned_items || []).length} items en tu inventario</li>
              </ul>
            </div>
          ` : ''}

          <div style="background: rgba(255,255,255,0.9); border-radius: 15px; padding: 20px; margin: 20px 0; color: #1a1a2e;">
            <h3 style="margin-top: 0; color: #fa709a;">🎁 Regalo de Bienvenida de Regreso:</h3>
            <p style="font-size: 16px; margin: 10px 0;">
              <strong>+50 monedas gratis</strong> solo por volver hoy.<br/>
              <strong>+1 Caja Sorpresa</strong> para personalizar tu avatar.
            </p>
            <p style="font-size: 14px; opacity: 0.8; margin: 10px 0;">
              (Reclama tu regalo en las próximas 48 horas)
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('BASE44_APP_URL') || 'https://habalyze.local'}/dashboard" 
               style="background: #667eea; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Reclamar mi regalo 🎁
            </a>
          </div>

          <p style="font-size: 14px; opacity: 0.8; margin-top: 30px; text-align: center;">
            Te prometemos que esta vez será diferente. Empieza pequeño, celebra cada victoria. 💜
          </p>
        </div>
      `;
    }

    // Send email
    await db.asServiceRole.integrations.Core.SendEmail({
      to: user_email,
      subject,
      body
    });

    return Response.json({ 
      success: true, 
      message: `Email de reactivación enviado a ${user_email}`,
      email_type: days_inactive <= 3 ? 'early' : days_inactive <= 7 ? 'medium' : 'long_term'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});