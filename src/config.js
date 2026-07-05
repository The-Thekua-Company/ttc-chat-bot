require('dotenv').config();

if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
  throw new Error(
    'ANTHROPIC_API_KEY is missing. Copy .env.example to .env and add your real Anthropic API key.'
  );
}

module.exports = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  port: process.env.PORT || 3000,
  model: process.env.CLAUDE_MODEL || 'claude-haiku-4-5',
};
