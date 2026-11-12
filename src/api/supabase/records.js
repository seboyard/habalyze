export function fail(message) {
  const error = new Error(message);
  error.response = { data: { error: message } };
  throw error;
}

export function matches(record, query) {
  if (!query || typeof query !== 'object') return true;
  return Object.entries(query).every(([key, expected]) => {
    const value = record[key];
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      if ('$gte' in expected && !(value >= expected.$gte)) return false;
      if ('$lte' in expected && !(value <= expected.$lte)) return false;
      if ('$gt' in expected && !(value > expected.$gt)) return false;
      if ('$lt' in expected && !(value < expected.$lt)) return false;
      if ('$in' in expected && !expected.$in.map(String).includes(String(value))) return false;
      if ('$nin' in expected && expected.$nin.map(String).includes(String(value))) return false;
      if ('$ne' in expected && value === expected.$ne) return false;
      return true;
    }
    return value === expected;
  });
}

export function sortRecords(records, sort) {
  if (!sort || typeof sort !== 'string') return records;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return [...records].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av === bv) return 0;
    if (av === undefined || av === null) return 1;
    if (bv === undefined || bv === null) return -1;
    if (av > bv) return desc ? -1 : 1;
    return desc ? 1 : -1;
  });
}

export function applyWindow(records, sort, limit) {
  const sorted = sortRecords(records, sort);
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}
