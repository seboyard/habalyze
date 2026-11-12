import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px 20px; text-align: center; }
    .logo { font-size: 48px; margin-bottom: 10px; }
    .header h1 { color: white; margin: 0; font-size: 32px; font-weight: bold; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 20px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #8B5CF6; font-size: 20px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
    .section p { color: #4b5563; margin-bottom: 10px; }
    .feature { background: #f3f4f6; border-left: 4px solid #8B5CF6; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
    .feature-title { font-weight: bold; color: #1f2937; margin-bottom: 5px; display: flex; align-items: center; gap: 8px; }
    .feature-desc { color: #6b7280; font-size: 14px; }
    .cta { text-align: center; margin: 30px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
    .tips { background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .tips h3 { color: #b45309; margin-top: 0; display: flex; align-items: center; gap: 8px; }
    .tip-item { color: #78350f; margin: 8px 0; padding-left: 20px; position: relative; }
    .tip-item:before { content: '✨'; position: absolute; left: 0; }
    .stats { display: flex; justify-content: space-around; margin: 30px 0; }
    .stat { text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .stat-label { color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 5px; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
    .social { margin: 20px 0; }
    .social a { color: #8B5CF6; text-decoration: none; margin: 0 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚀</div>
      <h1>¡Bienvenido a Habalyze!</h1>
      <p>Tu viaje hacia una mejor versión de ti mismo comienza ahora</p>
    </div>
    
    <div class="content">
      <div class="greeting">¡Hola, Ignacio! 👋</div>
      
      <div class="section">
        <p>Estamos emocionados de tenerte con nosotros. Habalyze es más que una app de hábitos, es tu compañero personal para transformar tu rutina en una aventura épica.</p>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-number">10K+</div>
          <div class="stat-label">Usuarios activos</div>
        </div>
        <div class="stat">
          <div class="stat-number">500K+</div>
          <div class="stat-label">Hábitos completados</div>
        </div>
        <div class="stat">
          <div class="stat-number">95%</div>
          <div class="stat-label">Satisfacción</div>
        </div>
      </div>

      <div class="section">
        <h2>🎯 ¿Qué puedes hacer en Habalyze?</h2>
        
        <div class="feature">
          <div class="feature-title">📊 Crear y Seguir Hábitos</div>
          <div class="feature-desc">Define tus metas diarias, semanales o personalizadas. Completa hábitos y construye rachas épicas.</div>
        </div>

        <div class="feature">
          <div class="feature-title">🤖 Coach IA Personal</div>
          <div class="feature-desc">Chatea con tu coach inteligente que analiza tus datos y te da consejos personalizados para mejorar.</div>
        </div>

        <div class="feature">
          <div class="feature-title">🎨 Avatar Personalizable</div>
          <div class="feature-desc">Crea tu avatar único con +200 accesorios. Desbloquea items completando hábitos y misiones.</div>
        </div>

        <div class="feature">
          <div class="feature-title">🏆 Sistema de Logros</div>
          <div class="feature-desc">Desbloquea placas épicas como "Madrugador", "Constante" o "Coleccionista". Cada logro te da recompensas.</div>
        </div>

        <div class="feature">
          <div class="feature-title">👥 Social y Desafíos</div>
          <div class="feature-desc">Agrega amigos, compite en rankings semanales y crea desafíos colaborativos o competitivos.</div>
        </div>

        <div class="feature">
          <div class="feature-title">📈 Estadísticas Avanzadas</div>
          <div class="feature-desc">Visualiza tu progreso con heatmaps, gráficas de consistencia y análisis de patrones de comportamiento.</div>
        </div>

        <div class="feature">
          <div class="feature-title">🎯 Proyectos con IA</div>
          <div class="feature-desc">Define un objetivo grande y la IA te generará un plan de tareas progresivo para alcanzarlo.</div>
        </div>
      </div>

      <div class="tips">
        <h3>💡 Tips para empezar con el pie derecho</h3>
        <div class="tip-item">Comienza con 2-3 hábitos simples. No te sobrecargues al inicio.</div>
        <div class="tip-item">Programa horarios específicos para tus hábitos. La consistencia es clave.</div>
        <div class="tip-item">Usa el Coach IA cuando tengas dudas o necesites motivación.</div>
        <div class="tip-item">Invita a amigos. Los desafíos sociales hacen todo más divertido.</div>
        <div class="tip-item">Revisa tus estadísticas semanalmente para identificar patrones.</div>
      </div>

      <div class="section">
        <h2>🎮 Ejemplo de rutina perfecta</h2>
        <p><strong>Mañana (6:00 AM):</strong> Meditar 10 minutos → +30 XP, +10 monedas 🪙</p>
        <p><strong>Mañana (7:00 AM):</strong> Hacer ejercicio 30 min → +50 XP, +20 monedas 🪙</p>
        <p><strong>Tarde (2:00 PM):</strong> Leer 15 páginas → +30 XP, +10 monedas 🪙</p>
        <p><strong>Noche (9:00 PM):</strong> Revisar objetivos del día → +20 XP, +5 monedas 🪙</p>
        <p style="margin-top: 15px; color: #8B5CF6; font-weight: bold;">💰 Total diario: +130 XP, +45 monedas</p>
        <p style="color: #6b7280;">Con estas monedas podrás comprar accesorios para tu avatar, abrir cajas sorpresa y más.</p>
      </div>

      <div class="cta">
        <a href="https://habalyze.local" class="button">🚀 Ir a Mi Dashboard</a>
      </div>

      <div class="section">
        <h2>🔥 ¿Necesitas ayuda?</h2>
        <p>Estamos aquí para ti. Si tienes preguntas, puedes:</p>
        <p>• Chatear con el Coach IA dentro de la app</p>
        <p>• Revisar la sección de Configuración para tutoriales</p>
        <p>• Responder este correo (estamos atentos 👀)</p>
      </div>
    </div>

    <div class="footer">
      <p><strong>¡Vamos a por ello! 💪</strong></p>
      <p>El equipo de Habalyze</p>
      <div class="social">
        <a href="#">Twitter</a> • 
        <a href="#">Instagram</a> • 
        <a href="#">Discord</a>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
        Has recibido este correo porque te registraste en Habalyze.<br>
        Si no quieres recibir más correos, puedes <a href="#" style="color: #8B5CF6;">darte de baja aquí</a>.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await db.asServiceRole.integrations.Core.SendEmail({
      to: 'seignaciodiaz@gmail.com',
      subject: '🚀 [PRUEBA] ¡Bienvenido a Habalyze! Tu aventura comienza aquí',
      body: emailBody,
      from_name: 'Habalyze'
    });

    return Response.json({ 
      success: true, 
      message: 'Test email sent to seignaciodiaz@gmail.com'
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});