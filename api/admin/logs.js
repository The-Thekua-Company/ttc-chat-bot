const { queryChatLogs } = require('../../src/services/chatLogQuery');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
};
