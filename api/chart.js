export const config = { runtime: 'edge' }

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const range = searchParams.get('range') || '3mo'
  const interval = searchParams.get('interval') || '1d'
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const data = await r.json()
    const chart = data?.chart?.result?.[0]
    if (!chart) throw new Error('No data')
    const timestamps = chart.timestamp || []
    const q = chart.indicators?.quote?.[0] || {}
    const candles = timestamps.map((t, i) => ({
      time: t, open: q.open?.[i], high: q.high?.[i], low: q.low?.[i], close: q.close?.[i]
    })).filter(c => c.open && c.close)
    return new Response(JSON.stringify({ candles, meta: chart.meta }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}
