export default async function handler(req, res) {
const ticker = req.query.ticker
if(!ticker) return res.status(400).json({error:‘No ticker’})
const KEY = process.env.FINNHUB_API_KEY

try {
// Finnhub EPS 히스토리
const epsRes = await fetch(‘https://finnhub.io/api/v1/stock/earnings?symbol=’+ticker+’&token=’+KEY)
const epsData = await epsRes.json()

```
// Yahoo Finance로 다음 어닝 날짜 가져오기
let earningsDate = null
let nextEpsEstimate = null
try {
  const yhRes = await fetch(
    'https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+encodeURIComponent(ticker)+'?modules=calendarEvents,earningsTrend',
    {headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}}
  )
  const yhData = await yhRes.json()
  const cal = yhData?.quoteSummary?.result?.[0]?.calendarEvents?.earnings
  const trend = yhData?.quoteSummary?.result?.[0]?.earningsTrend?.trend

  // 다음 어닝 날짜
  if(cal?.earningsDate?.[0]?.fmt) {
    earningsDate = cal.earningsDate[0].fmt
  }

  // 다음 분기 컨센서스 EPS 예상치
  if(trend && trend.length > 0) {
    const nextQ = trend.find(t => t.period === '+1q') || trend[0]
    if(nextQ?.earningsEstimate?.avg?.raw) {
      nextEpsEstimate = nextQ.earningsEstimate.avg.raw
    }
  }
} catch(e) {}

// EPS 히스토리
const earningsHistory = Array.isArray(epsData) ? epsData.slice(0,4).map(e => ({
  date: e.period,
  epsActual: e.actual,
  epsEstimate: e.estimate,
  surprisePct: e.estimate && e.actual != null ? (e.actual - e.estimate) / Math.abs(e.estimate) * 100 : null
})) : []

const quarterlyEPS = Array.isArray(epsData) ? epsData.slice(0,6).map(e => ({
  date: e.period, actual: e.actual, estimate: e.estimate
})) : []

res.setHeader('Access-Control-Allow-Origin','*')
res.json({ earningsDate, nextEpsEstimate, earningsHistory, quarterlyEPS })
```

} catch(e) {
res.status(500).json({error: e.message})
}
}