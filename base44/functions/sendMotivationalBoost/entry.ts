import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, boost_type } = await req.json();

    const targetUsers = await db.asServiceRole.entities.User.filter({ email: user_email });
    if (targetUsers.length === 0) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const targetUser = targetUsers[0];
    const habits = await db.asServiceRole.entities.Habit.filter({ created_by: user_email });

    let subject = '';
    let body = '';

    if (boost_type === 'streak_broken') {
      subject = `No te rindas ${targetUser.full_name}, las rachas se pueden recuperar 💪`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 20px; padding: 40px;">
          <h1 style="font-size: 28px; margin-bottom: 20px;">¡Hey ${targetUser.full_name}! 🌊</h1>
          
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
            Notamos que tu racha se rompió. ¡Pero eso está bien! Todos tenemos días difíciles.
          </p>

          <div style="background: rgba(255,255,255,0.2); border-radius: 15px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0;">💡 ¿Sabías que...?</h3>
            <p style="margin: 10px 0; font-size: 16px;">
              El 95% de las personas que rompen una racha y vuelven al día siguiente, logran rachas aún más largas.
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.9); border-radius: 15px; padding: 20px; margin: 20px 0; color: #1a1a2e;">
            <h3 style="margin-top: 0; color: #4facfe;">🎯 Tu plan de recuperación:</h3>
            <ol style="padding-left: 20px; line-height: 1.8;">
              <li>Elige solo UN hábito para hoy</li>
              <li>Hazlo a primera hora de la mañana</li>
              <li>Celebra cuando lo completes</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('BASE44_APP_URL') || 'https://habalyze.local'}/dashboard" 
               style="background: white; color: #4facfe; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);">
              Empezar de nuevo 🚀
            </a>
          </div>

          <p style="font-size: 14px; opacity: 0.9; margin-top: 30px; text-align: center;">
            Las caídas no definen tu viaje. Levantarte sí. 💙
          </p>
        </div>
      `;
    } else if (boost_type === 'milestone_approaching') {
      const nextMilestone = targetUser.level ? (targetUser.level + 1) * 10 : 10;
      subject = `${targetUser.full_name}, ¡estás a punto de alcanzar el nivel ${targetUser.level + 1}! 🎯`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #1a1a2e; border-radius: 20px; padding: 40px;">
          <h1 style="font-size: 28px; margin-bottom: 20px;">¡Casi lo logras, ${targetUser.full_name}! 🚀</h1>
          
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
            Estás muy cerca de subir al <strong>Nivel ${targetUser.level + 1}</strong>. Solo necesitas un poco más de esfuerzo.
          </p>

          <div style="background: rgba(255,255,255,0.9); border-radius: 15px; padding: 25px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #667eea;">Tu progreso actual:</span>
              <span style="font-size: 24px; font-weight: bold; color: #fa709a;">${targetUser.experience || 0} XP</span>
            </div>
            <div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${Math.min(((targetUser.experience || 0) % 100) / 100 * 100, 95)}%; border-radius: 10px;"></div>
            </div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Faltan solo ${100 - ((targetUser.experience || 0) % 100)} XP</p>
          </div>

          ${habits.length > 0 ? `
            <div style="background: rgba(255,255,255,0.9); border-radius: 15px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #667eea;">🎯 Sugerencia rápida:</h3>
              <p style="margin: 0; color: #333; font-size: 16px;">
                Completa "${habits[0].name}" hoy y estarás mucho más cerca. ¡Tú puedes!
              </p>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('BASE44_APP_URL') || 'https://habalyze.local'}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              ¡Terminar lo que empecé! 🏆
            </a>
          </div>
        </div>

        <div style="background: #1a1a2e; color: white; padding: 20px; text-align: center; border-radius: 0 0 20px 20px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            Cada paso cuenta. Sigue avanzando. 🌟
          </p>
        </div>
      </div>
      `;
    } else {
      // General motivation
      subject = `${targetUser.full_name}, tu futuro yo te lo agradecerá 🌟`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 40px; border-radius: 20px 20px 0 0;">
            <h1 style="font-size: 28px; color: #1a1a2e; margin-bottom: 20px;">¡Hola ${targetUser.full_name}! ✨</h1>
            <p style="font-size: 18px; color: #333; line-height: 1.6;">
              Solo un recordatorio: cada hábito que completas te acerca a la mejor versión de ti mismo.
            </p>
          </div>

          <div style="padding: 30px; background: #f8f9fa;">
            <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #667eea;">💪 Pensamiento del día:</h3>
              <p style="margin: 0; font-size: 18px; font-style: italic; color: #333; line-height: 1.6;">
                "No se trata de ser perfecto. Se trata de ser mejor que ayer."
              </p>
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                🎁 <strong>Bonus especial:</strong> Completa 3 hábitos hoy y gana el doble de monedas.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('BASE44_APP_URL') || 'https://habalyze.local'}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Hacer mi check-in diario ✓
              </a>
            </div>
          </div>

          <div style="background: #1a1a2e; color: white; padding: 20px; text-align: center; border-radius: 0 0 20px 20px;">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">
              Habalyze - Tu compañero en el viaje del cambio
            </p>
          </div>
        </div>
      `;
    }

    await db.asServiceRole.integrations.Core.SendEmail({
      to: user_email,
      subject,
      body
    });

    return Response.json({ 
      success: true, 
      message: `Email motivacional enviado a ${user_email}`,
      boost_type
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});