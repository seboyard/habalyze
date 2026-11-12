import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    // Solo admin puede configurar el webhook
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      return Response.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
    }

    // La URL del webhook será la URL de la función telegramWebhook
    const appId = Deno.env.get('BASE44_APP_ID');
    const webhookUrl = `https://${appId}.db.app/api/functions/telegramWebhook`;

    // Configurar el webhook en Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message']
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      return Response.json({ 
        success: false, 
        error: result.description || 'Failed to set webhook',
        telegram_response: result
      }, { status: 500 });
    }

    // Obtener info del bot
    const botInfoUrl = `https://api.telegram.org/bot${botToken}/getMe`;
    const botInfoResponse = await fetch(botInfoUrl);
    const botInfo = await botInfoResponse.json();

    return Response.json({ 
      success: true,
      message: 'Telegram webhook configured successfully',
      webhook_url: webhookUrl,
      bot_info: botInfo.result,
      telegram_response: result
    });

  } catch (error) {
    console.error('Error setting up Telegram webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});