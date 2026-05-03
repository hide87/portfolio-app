export const config = { runtime: 'edge' }

export default async function handler(req) {
  try {
    const r = await fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=USDKRW%3DX&fields=regularMarketPrice,regularMarketChangePercent', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const data = await r.json()
    const q = data?.quoteResponse?.result?.[0]
    return new Response(JSON.stringify({ usdkrw: q?.regularMarketPrice || 1380, changePct: q?.regularMarketChangePercent || 0 }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch {
    return new Response(JSON.stringify({ usdkrw: 1380, changePct: 0 }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  }
}
