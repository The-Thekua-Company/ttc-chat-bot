const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
  /^unknown$/i,
];

function isPrivateOrUnknown(ip) {
  if (!ip) return true;
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

async function lookupLocation(ip) {
  if (isPrivateOrUnknown(ip)) {
    return { city: null, region: null, country: null };
  }

  try {
    const response = await fetch(`https://ipwho.is/${ip}`);
    const data = await response.json();

    if (!data || data.success === false) {
      return { city: null, region: null, country: null };
    }

    return {
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
    };
  } catch (error) {
    return { city: null, region: null, country: null };
  }
}

module.exports = { lookupLocation };
