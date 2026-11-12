import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // Verificar que la petición viene de Telegram
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      return Response.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    const update = await req.json();
    console.log('Telegram webhook received:', JSON.stringify(update));

    // Extraer el mensaje
    const message = update.message;
    if (!message) {
      return Response.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text || '';
    const firstName = message.from.first_name || 'Usuario';
    const username = message.from.username;

    // Responder con el Chat ID cuando el usuario envíe /start o /id
    if (text.startsWith('/start') || text.startsWith('/id') || text.toLowerCase().includes('id')) {
      const responseText = `¡Hola ${firstName}! 👋\n\n` +
        `✅ Tu *Chat ID* es:\n\`${chatId}\`\n\n` +
        `📋 *Cómo vincular tu cuenta:*\n` +
        `1. Copia tu Chat ID (toca para copiar)\n` +
        `2. Ve a Configuración en Habalyze\n` +
        `3. Busca la sección "Notificaciones por Telegram"\n` +
        `4. Pega tu Chat ID\n` +
        `5. Haz clic en "Conectar Telegram"\n\n` +
        `🔔 Una vez conectado, recibirás:\n` +
        `• 🏆 Logros desbloqueados\n` +
        `• 🔥 Rachas alcanzadas\n` +
        `• ⏰ Recordatorios diarios\n` +
        `• 📋 Actualizaciones de proyectos\n` +
        `• ⭐ Subidas de nivel\n\n` +
        `¡Nos vemos en Habalyze! 💪`;

      await sendTelegramMessage(botToken, chatId, responseText);
    } 
    // Responder a mensajes generales
    else {
      const helpText = `¡Hola! Soy el bot de Habalyze 🤖\n\n` +
        `Envía /id para obtener tu Chat ID y vincular tu cuenta.\n\n` +
        `📱 ¿Aún no usas Habalyze?\n` +
        `Es la mejor app para construir hábitos, proyectos y alcanzar tus metas.\n\n` +
        `🚀 ¡Empieza gratis ahora!`;

      await sendTelegramMessage(botToken, chatId, helpText);
    }

    return Response.json({ ok: true });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function sendTelegramMessage(botToken, chatId, text) {
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error sending Telegram message:', error);
    throw new Error(error.description || 'Failed to send message');
  }

  return await response.json();
}