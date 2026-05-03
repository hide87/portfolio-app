module.exports = async (req, res) => {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’)
const symbol = req.query.symbol
const range = req.query.range || ‘3mo’
const interval = req.query.interval || ‘1d’
try {
const r = await fetch(‘https://query2.finance.yahoo.com/v8/finance/chart/’ + encodeURIComponent(symbol) + ‘?range=’ + range + ‘&interval=’ + interval, { headers: { ‘User-Agent’: ‘Mozilla/5.0’ } })
const d = await r.json()
const chart = d && d.chart && d.chart.result && d.chart.result[0]
if (!chart) throw new Error(‘No data’)
const ts = chart.timestamp || []
const q = (chart.indicators && chart.indicators.quote && chart.indicators.quote[0]) || {}
const candles = ts.map(function(t, i) {
return { time: t, open: q.open && q.open[i], high: q.high && q.high[i], low: q.low && q.low[i], close: q.close && q.close[i] }
}).filter(function(c) { return c.open && c.close })
res.json({ candles: candles, meta: chart.meta })
} catch(e) {
res.status(500).json({ error: e.message })
}
}