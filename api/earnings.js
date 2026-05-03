export const config = { runtime: 'edge' }

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const ticker = searchParams.get('ticker')
  if (!ticker) return new Response(JSON.stringify({ error: 'No ticker' }), { status: 400 })
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=earnings%2CearningsHistory%2CcalendarEvents&corsDomain=finance.yahoo.com`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json', 'Referer': 'https://finance.yahoo.com' }
    })
    const data = await r.json()
    const s = data?.quoteSummary?.result?.[0]
    if (!s) return new Response(JSON.stringify({ earningsHistory: [], earningsDate: null, quarterlyEPS: [] }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
    const earningsHistory = s?.earningsHistory?.history?.map(h => ({
      date: h.quarter?.fmt, epsActual: h.epsActual?.raw, epsEstimate: h.epsEstimate?.raw, surprisePct: h.surprisePercent?.raw
    })) || []
    const earningsDate = s?.calendarEvents?.earnings?.earningsDate?.[0]?.fmt || null
    const quarterlyEPS = s?.earnings?.financialsChart?.quarterly?.map(q => ({
      date: q.date, actual: q.actual?.raw, estimate: q.estimate?.raw
    })) || []
    return new Response(JSON.stringify({ earningsHistory, earningsDate, quarterlyEPS }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}
