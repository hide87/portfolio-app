export default async function handler(req, res) {
  const symbol = req.query.symbol
  const range = req.query.range || '3mo'
  const interval = req.query.interval || '1d'
  try {
    const r = await fetch('https://query2.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?range='+range+'&interval='+interval,{headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36','Accept':'application/json','Accept-Language':'en-US,en;q=0.9'}})
    const d = await r.json()
    const chart = d?.chart?.result?.[0]
    if(!chart) throw new Error('No data')
    const ts = chart.timestamp||[]
    const q = chart.indicators?.quote?.[0]||{}
    const candles = ts.map((t,i)=>({time:t,open:q.open?.[i],high:q.high?.[i],low:q.low?.[i],close:q.close?.[i]})).filter(c=>c.open&&c.close)
    res.setHeader('Access-Control-Allow-Origin','*')
    res.json({candles,meta:chart.meta})
  } catch(e) {
    res.status(500).json({error:e.message})
  }
}
