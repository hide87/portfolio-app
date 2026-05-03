export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’)
const { ticker } = req.query
if (!ticker) return res.status(400).json({ error: ‘No ticker’ })
const tryFetch = async (v) => fetch(
`https://query${v}.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=earnings%2CearningsHistory%2CcalendarEvents&corsDomain=finance.yahoo.com`,
{ headers: { ‘User-Agent’: ‘Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36’, ‘Accept’: ‘application/json’, ‘Referer’: ‘https://finance.yahoo.com’ } }
)
try {
let r = await tryFetch(1)
if (!r.ok) r = await tryFetch(2)
const data = await r.json()
const s = data?.quoteSummary?.result?.[0]
if (!s) return res.json({ earningsHistory: [], earningsDate: null, quarterlyEPS: [] })
const earningsHistory = s?.earningsHistory?.history?.map(h => ({
date: h.quarter?.fmt, epsActual: h.epsActual?.raw,
epsEstimate: h.epsEstimate?.raw, surprisePct: h.surprisePercent?.raw,
})) || []
const earningsDate = s?.calendarEvents?.earnings?.earningsDate?.[0]?.fmt || null
const quarterlyEPS = s?.earnings?.financialsChart?.quarterly?.map(q => ({
date: q.date, actual: q.actual?.raw, estimate: q.estimate?.raw,
})) || []
res.json({ earningsHistory, earningsDate, quarterlyEPS })
} catch (e) {
res.status(500).json({ error: e.message })
}
}