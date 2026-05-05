export default async function handler(req) {
  if(req.method !== 'POST') return new Response('Method not allowed',{status:405})
  const body = await req.text()
  const {prompt} = JSON.parse(body)
  const KEY = process.env.GEMINI_API_KEY
  if(!KEY) return new Response(JSON.stringify({error:'No API key'}),{status:500,headers:{'Content-Type':'application/json'}})
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+KEY,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({contents:[{parts:[{text:'당신은 전문 포트폴리오 분석가입니다. 한국어로 간결하고 인사이트있는 분석을 마크다운 형식으로 제공하세요.\n\n'+prompt}]}],generationConfig:{temperature:0.7,maxOutputTokens:1024}})
    })
    const d = await r.json()
    const text = d?.candidates?.[0]?.content?.parts?.[0]?.text || '분석 불가'
    return new Response(JSON.stringify({text}),{headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}})
  } catch(e) {
    return new Response(JSON.stringify({error:e.message}),{status:500,headers:{'Content-Type':'application/json'}})
  }
}
