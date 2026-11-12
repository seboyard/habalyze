import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users with Telegram linked
    const allUsers = await db.asServiceRole.entities.User.list();
    const telegramUsers = allUsers.filter(u => u.linked_accounts?.telegram);
    
    if (telegramUsers.length === 0) {
      return Response.json({ message: 'No users with Telegram linked', sent: 0 });
    }

    let sentCount = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const user of telegramUsers) {
      try {
        // Get user's habits for today
        const habits = await db.asServiceRole.entities.Habit.filter({ 
          created_by: user.email, 
          is_active: true 
        });

        const logs = await db.asServiceRole.entities.HabitLog.filter({
          created_by: user.email,
          completed_date: today
        });

        const completedCount = logs.length;
        const totalHabits = habits.length;
        const pendingHabits = totalHabits - completedCount;

        if (pendingHabits > 0) {
          // Generate motivational message with LLM
          const message = await db.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Genera un mensaje motivacional corto en español (máximo 3 líneas) para alguien que tiene ${pendingHabits} hábitos pendientes hoy. El mensaje debe ser energético, positivo y motivar a completarlos. Solo devuelve el mensaje, sin comillas.`,
            response_json_schema: null
          });

          const finalMessage = typeof message === 'string' ? message : message.message || 
            `¡Hola! 👋\n\nTienes ${pendingHabits} hábito${pendingHabits > 1 ? 's' : ''} pendiente${pendingHabits > 1 ? 's' : ''} hoy.\n¡Tú puedes! 💪`;

          // Send Telegram notification
          try {
            await db.asServiceRole.functions.invoke('sendTelegramNotification', {
              user_email: user.email,
              message: finalMessage,
              notification_type: 'reminder'
            });
          } catch (e) {
            console.log('Could not send Telegram notification:', e);
          }

          // Also create in-app notification
          await db.asServiceRole.entities.Notification.create({
            user_email: user.email,
            type: 'daily_reminder',
            title: 'Recordatorio diario',
            message: finalMessage,
            icon: '⏰'
          });

          sentCount++;
        }
      } catch (e) {
        console.log(`Error processing user ${user.email}:`, e);
      }
    }

    return Response.json({ 
      message: 'Daily reminders sent', 
      sent: sentCount,
      total: telegramUsers.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});