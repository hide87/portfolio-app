export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const r = await fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=USDKRW%3DX&fields=regularMarketPrice,regularMarketChangePercent', { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const data = await r.json()
    const q = data?.quoteResponse?.result?.[0]
    res.json({ usdkrw: q?.regularMarketPrice || 1380, changePct: q?.regularMarketChangePercent || 0 })
  } catch {
    res.json({ usdkrw: 1380, changePct: 0 })
  }
}
