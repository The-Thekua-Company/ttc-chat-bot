const express = require('express');
const { querySessions } = require('../services/chatSessionQuery');

const router = express.Router();

router.get('/', async (req, res) => {
  const password = req.headers['x-admin-password'];
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { date, mode, page } = req.query;

  try {
    const result = await querySessions({ date, mode, page });
    res.json(result);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Something went wrong while fetching sessions.' });
  }
});

module.exports = router;
