export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’)
const ticker = req.query.ticker
if (!ticker) return res.status(400).json({ error: ‘No ticker’ })
try {
const r = await fetch(‘https://query2.finance.yahoo.com/v10/finance/quoteSummary/’ + encodeURIComponent(ticker) + ‘?modules=earnings%2CearningsHistory%2CcalendarEvents’, { headers: { ‘User-Agent’: ‘Mozilla/5.0 (Windows NT 10.0; Win64; x64)’, ‘Accept’: ‘application/json’, ‘Referer’: ‘https://finance.yahoo.com’ } })
const d = await r.json()
const s = d && d.quoteSummary && d.quoteSummary.result && d.quoteSummary.result[0]
if (!s) return res.json({ earningsHistory: [], earningsDate: null, quarterlyEPS: [] })
const earningsHistory = ((s.earningsHistory && s.earningsHistory.history) || []).map(function(h) {
return { date: h.quarter && h.quarter.fmt, epsActual: h.epsActual && h.epsActual.raw, epsEstimate: h.epsEstimate && h.epsEstimate.raw, surprisePct: h.surprisePercent && h.surprisePercent.raw }
})
const earningsDate = (s.calendarEvents && s.calendarEvents.earnings && s.calendarEvents.earnings.earningsDate && s.calendarEvents.earnings.earningsDate[0] && s.calendarEvents.earnings.earningsDate[0].fmt) || null
const quarterlyEPS = ((s.earnings && s.earnings.financialsChart && s.earnings.financialsChart.quarterly) || []).map(function(q) {
return { date: q.date, actual: q.actual && q.actual.raw, estimate: q.estimate && q.estimate.raw }
})
res.json({ earningsHistory: earningsHistory, earningsDate: earningsDate, quarterlyEPS: quarterlyEPS })
} catch(e) {
res.status(500).json({ error: e.message })
}
}