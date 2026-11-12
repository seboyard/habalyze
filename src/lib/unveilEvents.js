/**
 * Sends an event to Unveil silently in the background.
 * Never blocks or throws — safe to fire-and-forget.
 */
export async function sendUnveilEvent(user, { event_type, entity_name = '', value = null }) {
  if (!user?.unveil_connected || !user?.unveil_token) return;

  const UNVEIL_APP_ID = 'unveil'; // replace with actual Unveil app id if known
  const url = `https://${UNVEIL_APP_ID}.db.app/functions/receiveHabalyzeEvent`;

  const body = {
    token: user.unveil_token,
    event_type,
    entity_name,
    value,
    occurred_at: new Date().toISOString(),
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (_) {
    // Silent fail — never block the user
  }
}