const express = require('express');
const { queryChatLogs } = require('../services/chatLogQuery');

const router = express.Router();

router.get('/', async (req, res) => {
  const password = req.headers['x-admin-password'];
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { date, mode, sessionId, page } = req.query;

  try {
    const result = await queryChatLogs({ date, mode, sessionId, page });
    res.json(result);
  } catch (error) {
    console.error('Error fetching chat logs:', error);
    res.status(500).json({ error: 'Something went wrong while fetching logs.' });
  }
});

module.exports = router;
