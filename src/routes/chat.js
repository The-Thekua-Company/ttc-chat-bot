const express = require('express');
const { getChatReply } = require('../services/claude');
const { logChatInteraction } = require('../services/chatLogger');

const router = express.Router();

router.post('/', async (req, res) => {
  const { message, history = [], sessionId, username } = req.body;

  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string' });
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

  try {
    const reply = await getChatReply(message.trim(), history);
    await logChatInteraction({ sessionId, mode: 'chat', userMessage: message.trim(), botReply: reply, username, ip }).catch(() => {});
    res.json({ reply });
  } catch (error) {
    console.error('Error getting chat reply:', error);
    res.status(500).json({ error: 'Something went wrong while generating a reply. Please try again.' });
  }
});

module.exports = router;
