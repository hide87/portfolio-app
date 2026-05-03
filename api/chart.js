module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’)
const { symbol, range = ‘3mo’, interval = ‘1d’ } = req.query
try {
const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`
const r = await fetch(url, { headers: { ‘User-Agent’: ‘Mozilla/5.0’ } })
const data = await r.json()
const chart = data?.chart?.result?.[0]
if (!chart) throw new Error(‘No data’)
const timestamps = chart.timestamp || []
const q = chart.indicators?.quote?.[0] || {}
const candles = timestamps.map((t, i) => ({
time: t, open: q.open?.[i], high: q.high?.[i], low: q.low?.[i], close: q.close?.[i]
})).filter(c => c.open && c.close)
res.json({ candles, meta: chart.meta })
} catch (e) {
res.status(500).json({ error: e.message })
}
}