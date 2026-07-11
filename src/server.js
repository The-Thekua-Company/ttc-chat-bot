// Not used on Vercel — kept for local development
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const chatRouter = require('./routes/chat');
const recipesRouter = require('./routes/recipes');
const leadRouter = require('./routes/lead');
const adminLogsRouter = require('./routes/adminLogs');
const adminSessionsRouter = require('./routes/adminSessions');

const app = express();

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests. Please wait a few minutes and try again.' },
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/chat', apiLimiter, chatRouter);
app.use('/recipes', recipesRouter);
app.use('/lead', apiLimiter, leadRouter);
app.use('/api/admin/logs', adminLogsRouter);
app.use('/api/admin/sessions', adminSessionsRouter);
app.use('/admin', express.static('admin'));

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
