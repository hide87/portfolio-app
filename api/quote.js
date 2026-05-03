export const config = { runtime: 'edge' }

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const symbols = searchParams.get('symbols')
  if (!symbols) return new Response(JSON.stringify({ error: 'No symbols' }), { status: 400 })
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketChange,regularMarketPreviousClose,shortName`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const data = await r.json()
    const result = {}
    ;(data?.quoteResponse?.result || []).forEach(q => {
      result[q.symbol] = { price: q.regularMarketPrice, change: q.regularMarketChange, changePct: q.regularMarketChangePercent, prevClose: q.regularMarketPreviousClose, name: q.shortName }
    })
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}
