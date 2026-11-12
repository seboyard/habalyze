import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { format, startOfWeek, endOfWeek, subWeeks } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email } = await req.json();

    // Get target user
    const targetUsers = await db.asServiceRole.entities.User.filter({ email: user_email });
    if (targetUsers.length === 0) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const targetUser = targetUsers[0];

    // Get this week's data
    const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const thisWeekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    // Get all habit logs from this week
    const thisWeekLogs = await db.asServiceRole.entities.HabitLog.filter({ 
      created_by: user_email 
    });
    const weekLogs = thisWeekLogs.filter(log => log.completed_date >= thisWeekStart && log.completed_date <= thisWeekEnd);

    // Get habits
    const habits = await db.asServiceRole.entities.Habit.filter({ created_by: user_email, is_active: true });

    // Calculate stats
    const totalCompletionsThisWeek = weekLogs.length;
    const uniqueDaysCompleted = new Set(weekLogs.map(l => l.completed_date)).size;
    const bestHabit = habits.sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0))[0];
    const mostCompletedHabit = habits.sort((a, b) => (b.total_completions || 0) - (a.total_completions || 0))[0];

    // Get last week's ranking
    const lastWeekStart = format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const rankings = await db.asServiceRole.entities.WeeklyRanking.filter({ 
      user_email,
      week_start: lastWeekStart
    });
    const lastRank = rankings.length > 0 ? rankings[0].rank_position : null;

    const subject = `📊 Tu resumen semanal en Habalyze - ¡${totalCompletionsThisWeek} hábitos completados!`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 20px 20px 0 0;">
          <h1 style="font-size: 32px; margin: 0 0 10px 0;">¡Hola ${targetUser.full_name}! 👋</h1>
          <p style="font-size: 18px; margin: 0; opacity: 0.9;">Aquí está tu resumen de la semana</p>
        </div>

        <!-- Stats Cards -->
        <div style="padding: 30px; background: #f8f9fa;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="font-size: 36px; font-weight: bold; color: #667eea;">${totalCompletionsThisWeek}</div>
              <div style="color: #666; margin-top: 5px;">Hábitos completados</div>
            </div>
            <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="font-size: 36px; font-weight: bold; color: #fa709a;">${uniqueDaysCompleted}/7</div>
              <div style="color: #666; margin-top: 5px;">Días activos</div>
            </div>
          </div>

          ${bestHabit ? `
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 15px; color: white; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; font-size: 20px;">🔥 Tu mejor racha</h3>
              <p style="margin: 0; font-size: 24px; font-weight: bold;">${bestHabit.name}</p>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${bestHabit.current_streak || 0} días consecutivos</p>
            </div>
          ` : ''}

          ${mostCompletedHabit && mostCompletedHabit.total_completions > 0 ? `
            <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">⭐ Hábito estrella</h3>
              <p style="margin: 0; font-size: 18px; color: #667eea; font-weight: bold;">${mostCompletedHabit.name}</p>
              <p style="margin: 5px 0 0 0; color: #666;">${mostCompletedHabit.total_completions} veces completado en total</p>
            </div>
          ` : ''}

          ${lastRank ? `
            <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">🏆 Tu posición en el ranking</h3>
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #d63031;">#${lastRank}</p>
            </div>
          ` : ''}

          <!-- Motivation Message -->
          <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; color: #667eea;">💭 Tu Coach IA dice:</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333;">
              ${uniqueDaysCompleted >= 5 
                ? '¡Increíble semana! Tu consistencia es admirable. Sigue así y alcanzarás cualquier meta que te propongas. 🌟' 
                : uniqueDaysCompleted >= 3
                ? 'Buen trabajo esta semana. Para la próxima, intenta ser más consistente. ¡Tú puedes lograrlo! 💪'
                : 'Esta semana fue difícil, pero recuerda: cada día es una nueva oportunidad. Empieza mañana con energía renovada. 🌅'
              }
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center;">
            <a href="${Deno.env.get('BASE44_APP_URL') || 'https://habalyze.local'}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Ver mi dashboard 📊
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1a1a2e; color: white; padding: 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            Habalyze - Transforma tus hábitos en aventuras épicas
          </p>
        </div>
      </div>
    `;

    await db.asServiceRole.integrations.Core.SendEmail({
      to: user_email,
      subject,
      body
    });

    return Response.json({ 
      success: true, 
      message: `Resumen semanal enviado a ${user_email}`,
      stats: {
        completions: totalCompletionsThisWeek,
        active_days: uniqueDaysCompleted,
        best_streak: bestHabit?.current_streak || 0
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});