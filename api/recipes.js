const { getRecipeSuggestion } = require('../src/services/recipeAssistant');
const { logChatInteraction } = require('../src/services/chatLogger');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const { message, sessionId, username } = req.body;

  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string' });
  }

  try {
    const reply = await getRecipeSuggestion(message.trim());
    logChatInteraction({ sessionId, mode: 'recipes', userMessage: message.trim(), botReply: reply, username, ip }).catch(() => {});
    res.json({ reply });
  } catch (error) {
    console.error('Error getting recipe suggestion:', error);
    res.status(500).json({ error: 'Something went wrong while generating a suggestion. Please try again.' });
  }
};
