import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      return Response.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
    }

    const appId = Deno.env.get('BASE44_APP_ID');
    const webhookUrl = `https://${appId}.db.app/api/functions/telegramWebhook`;

    // 1. Get bot info
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botInfo = await botInfoResponse.json();

    // 2. Set webhook
    const setWebhookResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
        drop_pending_updates: true
      })
    });
    const webhookResult = await setWebhookResponse.json();

    // 3. Get webhook info
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const webhookInfo = await webhookInfoResponse.json();

    return Response.json({
      success: true,
      bot_info: botInfo,
      webhook_set: webhookResult,
      webhook_info: webhookInfo,
      webhook_url: webhookUrl,
      instructions: {
        step1: `Abre Telegram y busca @${botInfo.result?.username || 'tu_bot'}`,
        step2: 'Envía /start al bot',
        step3: 'El bot te responderá con tu Chat ID',
        step4: 'Copia el Chat ID y úsalo en la configuración de Habalyze'
      }
    });

  } catch (error) {
    console.error('Error testing Telegram bot:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});