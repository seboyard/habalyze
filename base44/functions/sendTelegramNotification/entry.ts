import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, message, notification_type } = await req.json();

    if (!user_email || !message) {
      return Response.json({ error: 'Missing user_email or message' }, { status: 400 });
    }

    // Get user to check if Telegram is linked
    const users = await db.asServiceRole.entities.User.filter({ email: user_email });
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    const telegramChatId = user.linked_accounts?.telegram?.chat_id;

    if (!telegramChatId) {
      return Response.json({ 
        success: false, 
        message: 'User has not linked Telegram account' 
      });
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      return Response.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
    }

    // Emoji basado en el tipo de notificación
    const emojiMap = {
      achievement: '🏆',
      level_up: '⭐',
      streak: '🔥',
      reminder: '⏰',
      challenge: '🎯',
      friend: '👥',
      reward: '🎁',
      project: '📋',
      default: '🔔'
    };

    const emoji = emojiMap[notification_type] || emojiMap.default;
    const finalMessage = `${emoji} *Habalyze*\n\n${message}`;

    // Send Telegram message
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: finalMessage,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', result);
      return Response.json({ 
        success: false, 
        error: result.description || 'Failed to send Telegram message' 
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Telegram notification sent',
      telegram_response: result
    });

  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});