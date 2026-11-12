import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { telegram_chat_id, telegram_username } = await req.json();

    if (!telegram_chat_id) {
      return Response.json({ error: 'Missing telegram_chat_id' }, { status: 400 });
    }

    // Verificar que el chat_id es válido enviando un mensaje de prueba
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      return Response.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const testResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegram_chat_id,
        text: `✅ *¡Cuenta vinculada exitosamente!*\n\nHola ${user.full_name}, tu cuenta de Habalyze ahora está conectada con Telegram.\n\nRecibirás notificaciones importantes aquí:\n• Logros desbloqueados 🏆\n• Rachas alcanzadas 🔥\n• Recordatorios diarios ⏰\n• Actualizaciones de proyectos 📋\n\n¡Sigue conquistando tus hábitos! 💪`,
        parse_mode: 'Markdown'
      })
    });

    const testResult = await testResponse.json();

    if (!testResponse.ok) {
      console.error('Telegram verification failed:', testResult);
      return Response.json({ 
        error: 'No se pudo verificar el chat de Telegram. Asegúrate de haber iniciado una conversación con el bot primero.',
        telegram_error: testResult.description 
      }, { status: 400 });
    }

    // Actualizar el usuario con los datos de Telegram
    const linkedAccounts = user.linked_accounts || {};
    linkedAccounts.telegram = {
      chat_id: telegram_chat_id,
      username: telegram_username || null,
      linked_date: new Date().toISOString()
    };

    await db.auth.updateMe({ linked_accounts: linkedAccounts });

    // Crear notificación in-app
    await db.entities.Notification.create({
      user_email: user.email,
      type: 'telegram_linked',
      title: '¡Telegram conectado!',
      message: 'Ahora recibirás notificaciones importantes en Telegram',
      icon: '✅'
    });

    return Response.json({ 
      success: true, 
      message: 'Telegram account linked successfully',
      telegram_username: telegram_username
    });

  } catch (error) {
    console.error('Error linking Telegram account:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});