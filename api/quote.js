export default async function handler(req) {
  const {searchParams} = new URL(req.url, 'https://example.com')
  const symbols = searchParams.get('symbols') || ''
  const KEY = process.env.FINNHUB_API_KEY
  const tickers = symbols.split(',').filter(Boolean)
  const result = {}
  await Promise.all(tickers.map(async (ticker) => {
    if(ticker.includes('.KS')||ticker.includes('.KQ')) {
      try {
        const r = await fetch('https://query2.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(ticker)+'?range=1d&interval=1d',{headers:{'User-Agent':'Mozilla/5.0'}})
        const d = await r.json()
        const m = d?.chart?.result?.[0]?.meta
        if(m?.regularMarketPrice) result[ticker]={price:m.regularMarketPrice,changePct:m.previousClose?(m.regularMarketPrice-m.previousClose)/m.previousClose*100:0,change:m.regularMarketPrice-(m.previousClose||m.regularMarketPrice),prevClose:m.previousClose,name:ticker}
      } catch(e){}
    } else {
      try {
        const r = await fetch('https://finnhub.io/api/v1/quote?symbol='+ticker+'&token='+KEY)
        const d = await r.json()
        if(d?.c) result[ticker]={price:d.c,change:d.d,changePct:d.dp,prevClose:d.pc,name:ticker}
      } catch(e){}
    }
  }))
  return new Response(JSON.stringify(result),{headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}})
}
