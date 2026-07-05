const requests = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 50;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetTime) {
    requests.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false };
  }

  entry.count += 1;
  return { allowed: true };
}

module.exports = { checkRateLimit };
