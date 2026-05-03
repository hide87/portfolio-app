export default async function handler(req) {
const { searchParams } = new URL(req.url)
const symbols = searchParams.get(‘symbols’) || ‘’
const KEY = process.env.FINNHUB_API_KEY
const tickers = symbols.split(’,’).filter(Boolean)
const result = {}
await Promise.all(tickers.map(async (ticker) => {
const isKorean = ticker.includes(’.KS’) || ticker.includes(’.KQ’)
if (isKorean) {
try {
const r = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d`, { headers: { ‘User-Agent’: ‘Mozilla/5.0’ } })
const data = await r.json()
const meta = data?.chart?.result?.[0]?.meta
if (meta?.regularMarketPrice) {
result[ticker] = { price: meta.regularMarketPrice, changePct: meta.previousClose ? (meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100 : 0, change: meta.regularMarketPrice - (meta.previousClose || meta.regularMarketPrice), prevClose: meta.previousClose, name: ticker }
}
} catch {}
return
}
try {
const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${KEY}`)
const data = await r.json()
if (data.c) result[ticker] = { price: data.c, change: data.d, changePct: data.dp, prevClose: data.pc, name: ticker }
} catch {}
}))
return new Response(JSON.stringify(result), { headers: { ‘Content-Type’: ‘application/json’, ‘Access-Control-Allow-Origin’: ‘*’ } })
}