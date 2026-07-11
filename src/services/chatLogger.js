const { getSupabaseClient } = require('./supabase');
const { lookupLocation } = require('./geolocation');

async function logChatInteraction({ sessionId, mode, userMessage, botReply, username, ip }) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  if (!sessionId || !userMessage || !botReply) return;

  try {
    const location = await lookupLocation(ip);
    const supabase = getSupabaseClient();

    await supabase.from('chat_logs').insert({
      session_id: sessionId,
      mode: mode || 'chat',
      user_message: userMessage,
      bot_reply: botReply,
      username: username || null,
      ip_address: ip || null,
      city: location.city,
      region: location.region,
      country: location.country,
    });
  } catch (error) {
    console.error('Error logging chat interaction:', error);
  }
}

module.exports = { logChatInteraction };
