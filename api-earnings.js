export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { ticker } = req.query
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=earnings,earningsHistory,calendarEvents`
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
    const data = await r.json()
    const s = data?.quoteSummary?.result?.[0]
    const earningsHistory = s?.earningsHistory?.history?.map(h => ({
      date: h.quarter?.fmt,
      epsActual: h.epsActual?.raw,
      epsEstimate: h.epsEstimate?.raw,
      surprisePct: h.surprisePercent?.raw,
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
