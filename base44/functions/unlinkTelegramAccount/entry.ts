import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.linked_accounts?.telegram) {
      return Response.json({ error: 'Telegram account not linked' }, { status: 400 });
    }

    // Enviar mensaje de despedida a Telegram
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const telegramChatId = user.linked_accounts.telegram.chat_id;

    if (botToken && telegramChatId) {
      try {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: `👋 *Cuenta desvinculada*\n\nTu cuenta de Habalyze ha sido desconectada de Telegram.\n\nYa no recibirás notificaciones aquí. Puedes volver a vincular tu cuenta en cualquier momento desde la configuración de la app.`,
            parse_mode: 'Markdown'
          })
        });
      } catch (e) {
        console.log('Could not send goodbye message to Telegram:', e);
      }
    }

    // Eliminar datos de Telegram
    const linkedAccounts = user.linked_accounts;
    delete linkedAccounts.telegram;

    await db.auth.updateMe({ linked_accounts: linkedAccounts });

    return Response.json({ 
      success: true, 
      message: 'Telegram account unlinked successfully' 
    });

  } catch (error) {
    console.error('Error unlinking Telegram account:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});