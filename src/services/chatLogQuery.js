const { getSupabaseClient } = require('./supabase');

const PAGE_SIZE = 50;

async function queryChatLogs({ date, mode, sessionId, page = 1 }) {
  const supabase = getSupabaseClient();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const from = (pageNum - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('chat_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (mode) query = query.eq('mode', mode);
  if (sessionId) query = query.eq('session_id', sessionId);
  if (date) {
    const start = `${date}T00:00:00.000Z`;
    const end = `${date}T23:59:59.999Z`;
    query = query.gte('created_at', start).lte('created_at', end);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { rows: data, total: count, page: pageNum, pageSize: PAGE_SIZE };
}

module.exports = { queryChatLogs };
