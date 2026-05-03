module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’)
const { symbols } = req.query
if (!symbols) return res.status(400).json({ error: ‘No symbols’ })
try {
const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketChange,regularMarketPreviousClose,shortName`
const r = await fetch(url, { headers: { ‘User-Agent’: ‘Mozilla/5.0’ } })
const data = await r.json()
const quotes = data?.quoteResponse?.result || []
const result = {}
quotes.forEach(q => {
result[q.symbol] = {
price: q.regularMarketPrice,
change: q.regularMarketChange,
changePct: q.regularMarketChangePercent,
prevClose: q.regularMarketPreviousClose,
name: q.shortName,
}
})
res.json(result)
} catch (e) {
res.status(500).json({ error: e.message })
}
}