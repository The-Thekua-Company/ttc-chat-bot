const express = require('express');
const { getRecipeSuggestion } = require('../services/recipeAssistant');

const router = express.Router();

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string' });
  }

  try {
    const reply = await getRecipeSuggestion(message.trim());
    res.json({ reply });
  } catch (error) {
    console.error('Error getting recipe suggestion:', error);
    res.status(500).json({ error: 'Something went wrong while generating a suggestion. Please try again.' });
  }
});

module.exports = router;
