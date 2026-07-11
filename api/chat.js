const { getChatReply } = require('../src/services/claude');
const { checkRateLimit } = require('../src/services/rateLimit');
const { logChatInteraction } = require('../src/services/chatLogger');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please wait a few minutes and try again.' });
  }

  const { message, history = [], sessionId, username } = req.body;

  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string' });
  }

  try {
    const reply = await getChatReply(message.trim(), history);
    await logChatInteraction({ sessionId, mode: 'chat', userMessage: message.trim(), botReply: reply, username, ip }).catch(() => {});
    res.json({ reply });
  } catch (error) {
    console.error('Error getting chat reply:', error);
    res.status(500).json({ error: 'Something went wrong while generating a reply. Please try again.' });
  }
};
