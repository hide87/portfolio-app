export default async function handler(req, res) {
  const symbols = req.query.symbols || ''
  const KEY = process.env.FINNHUB_API_KEY
  const tickers = symbols.split(',').filter(Boolean)
  const result = {}
  await Promise.all(tickers.map(async (ticker) => {
    if(ticker.includes('.KS')||ticker.includes('.KQ')) {
      try {
        const r = await fetch('https://query2.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(ticker)+'?range=5d&interval=1d',{headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36','Accept':'application/json'}})
        const d = await r.json()
        const meta = d?.chart?.result?.[0]?.meta
        const quotes = d?.chart?.result?.[0]?.indicators?.quote?.[0]
        const closes = d?.chart?.result?.[0]?.timestamp
        const closeArr = quotes?.close || []
        const validCloses = closeArr.filter(v=>v!=null)
        const currentPrice = meta?.regularMarketPrice || validCloses[validCloses.length-1]
        const prevClose = validCloses.length>=2 ? validCloses[validCloses.length-2] : meta?.chartPreviousClose
        if(currentPrice) {
          result[ticker] = {
            price: currentPrice,
            changePct: prevClose ? (currentPrice-prevClose)/prevClose*100 : 0,
            change: prevClose ? currentPrice-prevClose : 0,
            prevClose: prevClose,
            name: ticker
          }
        }
      } catch(e){}
    } else {
      try {
        const r = await fetch('https://finnhub.io/api/v1/quote?symbol='+ticker+'&token='+KEY)
        const d = await r.json()
        if(d?.c) result[ticker]={price:d.c,change:d.d,changePct:d.dp,prevClose:d.pc,name:ticker}
      } catch(e){}
    }
  }))
  res.setHeader('Access-Control-Allow-Origin','*')
  res.json(result)
}
