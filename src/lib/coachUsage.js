// Límite diario del Coach IA compartido entre la página Coach y el Coach global.
export const FREE_DAILY_LIMIT = 10;

const DATE_KEY = 'coach_messages_date';
const COUNT_KEY = 'coach_messages_count';

export function getDailyUsage() {
  const today = new Date().toDateString();
  if (localStorage.getItem(DATE_KEY) !== today) {
    localStorage.setItem(DATE_KEY, today);
    localStorage.setItem(COUNT_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);
}

export function incrementDailyUsage() {
  const next = getDailyUsage() + 1;
  localStorage.setItem(COUNT_KEY, String(next));
  return next;
}