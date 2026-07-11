const { getSupabaseClient } = require('./supabase');

const PAGE_SIZE = 30;

async function querySessions({ date, mode, page = 1 }) {
  const supabase = getSupabaseClient();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const from = (pageNum - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('chat_sessions')
    .select('*', { count: 'exact' })
    .order('last_message_at', { ascending: false })
    .range(from, to);

  if (mode) query = query.eq('mode', mode);
  if (date) {
    const start = `${date}T00:00:00.000Z`;
    const end = `${date}T23:59:59.999Z`;
    query = query.gte('last_message_at', start).lte('last_message_at', end);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { rows: data, total: count, page: pageNum, pageSize: PAGE_SIZE };
}

module.exports = { querySessions };
