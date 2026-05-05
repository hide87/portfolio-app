export default async function handler(req, res) {
const ticker = req.query.ticker
if(!ticker) return res.status(400).json({error:‘No ticker’})
const KEY = process.env.FINNHUB_API_KEY

try {
const epsRes = await fetch(‘https://finnhub.io/api/v1/stock/earnings?symbol=’+ticker+’&token=’+KEY)
const epsData = await epsRes.json()

```
let earningsDate = null
let nextEpsEstimate = null

try {
  const yhRes = await fetch(
    'https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+encodeURIComponent(ticker)+'?modules=calendarEvents,earningsTrend',
    {headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}}
  )
  const yhData = await yhRes.json()
  const result = yhData && yhData.quoteSummary && yhData.quoteSummary.result && yhData.quoteSummary.result[0]
  const cal = result && result.calendarEvents && result.calendarEvents.earnings
  const trend = result && result.earningsTrend && result.earningsTrend.trend

  if(cal && cal.earningsDate && cal.earningsDate[0] && cal.earningsDate[0].fmt) {
    earningsDate = cal.earningsDate[0].fmt
  }

  if(trend && trend.length > 0) {
    var nextQ = null
    for(var i=0;i<trend.length;i++){
      if(trend[i].period==='+1q'){nextQ=trend[i];break}
    }
    if(!nextQ) nextQ = trend[0]
    if(nextQ && nextQ.earningsEstimate && nextQ.earningsEstimate.avg && nextQ.earningsEstimate.avg.raw) {
      nextEpsEstimate = nextQ.earningsEstimate.avg.raw
    }
  }
} catch(e2) {}

var earningsHistory = []
var quarterlyEPS = []

if(Array.isArray(epsData)) {
  earningsHistory = epsData.slice(0,4).map(function(e) {
    return {
      date: e.period,
      epsActual: e.actual,
      epsEstimate: e.estimate,
      surprisePct: e.estimate && e.actual != null ? (e.actual - e.estimate) / Math.abs(e.estimate) * 100 : null
    }
  })
  quarterlyEPS = epsData.slice(0,6).map(function(e) {
    return {date: e.period, actual: e.actual, estimate: e.estimate}
  })
}

res.setHeader('Access-Control-Allow-Origin','*')
res.json({earningsDate: earningsDate, nextEpsEstimate: nextEpsEstimate, earningsHistory: earningsHistory, quarterlyEPS: quarterlyEPS})
```

} catch(e) {
res.status(500).json({error: e.message})
}
}