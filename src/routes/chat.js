const express = require('express');
const { getChatReply } = require('../services/claude');

const router = express.Router();

router.post('/', async (req, res) => {
  const { message, history = [] } = req.body;

  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string' });
  }

  try {
    const reply = await getChatReply(message.trim(), history);
    res.json({ reply });
  } catch (error) {
    console.error('Error getting chat reply:', error);
    res.status(500).json({ error: 'Something went wrong while generating a reply. Please try again.' });
  }
});

module.exports = router;
