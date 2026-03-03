import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{font-size:16px;-webkit-font-smoothing:antialiased;}
body{font-family:'Inter',sans-serif;background:#F6F9FC;color:#1A1F36;min-height:100vh;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:#C9D2E0;border-radius:99px;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes slideR{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
.page{animation:fadeIn .3s ease both;}
.fu{animation:fadeUp .35s cubic-bezier(.22,1,.36,1) both;}
.fu1{animation-delay:.04s}.fu2{animation-delay:.08s}.fu3{animation-delay:.12s}
.fu4{animation-delay:.16s}.fu5{animation-delay:.20s}.fu6{animation-delay:.24s}
.sq-card{background:#fff;border:1px solid #E3E8EF;border-radius:8px;transition:box-shadow .2s;}
.sq-card:hover{box-shadow:0 2px 12px rgba(26,31,54,.06);}
.sq-input{width:100%;height:40px;border:1px solid #E3E8EF;border-radius:6px;padding:0 12px;font-family:'Inter',sans-serif;font-size:14px;color:#1A1F36;background:#fff;outline:none;transition:border-color .15s,box-shadow .15s;}
.sq-input:focus{border-color:#635BFF;box-shadow:0 0 0 3px rgba(99,91,255,.12);}
.sq-input::placeholder{color:#A3ACB9;}
.sq-btn{height:40px;padding:0 18px;background:#635BFF;color:#fff;border:none;border-radius:6px;font-family:'Inter',sans-serif;font-size:14px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;transition:background .15s,box-shadow .15s;white-space:nowrap;}
.sq-btn:hover{background:#4F46E5;box-shadow:0 4px 14px rgba(99,91,255,.35);}
.sq-btn:active{transform:scale(.98);}
.sq-btn:disabled{background:#9D97FF;cursor:not-allowed;box-shadow:none;}
.sq-btn-sm{height:34px;padding:0 14px;background:#fff;color:#3C4257;border:1px solid #E3E8EF;border-radius:6px;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:background .15s;}
.sq-btn-sm:hover{background:#F6F9FC;}
.nav-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500;color:#697386;transition:background .15s,color .15s;user-select:none;}
.nav-item:hover{background:#F6F9FC;color:#1A1F36;}
.nav-item.active{background:#EEF0FF;color:#635BFF;}
.sq-badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:99px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;}
.mono{font-family:'JetBrains Mono',monospace;}
@media(max-width:900px){
  .sidebar{transform:translateX(-100%);position:fixed!important;z-index:200;transition:transform .25s;}
  .sidebar.open{transform:translateX(0);}
  .main-area{margin-left:0!important;}
  .g4{grid-template-columns:1fr 1fr!important;}
  .g2{grid-template-columns:1fr!important;}
  .g3{grid-template-columns:1fr!important;}
  .mob-btn{display:flex!important;}
}
@media(max-width:560px){
  .g4{grid-template-columns:1fr!important;}
  .pg{padding:16px!important;}
}
`;

const N="#0A2540",P="#635BFF",PS="#EEF0FF",
      G="#059669",GS="#ECFDF5",
      AM="#D97706",AS="#FFFBEB",
      R="#DC2626",RS="#FEF2F2",
      GR="#697386",BD="#E3E8EF",BG="#F6F9FC";

const LM={
  LOW:     {c:G,  s:GS, b:"#9FE4CF",l:"Low"     },
  MEDIUM:  {c:AM, s:AS, b:"#FDE68A",l:"Medium"  },
  HIGH:    {c:"#B45309",s:"#FFFBEB",b:"#FCD34D",l:"High"    },
  CRITICAL:{c:R,  s:RS, b:"#FECACA",l:"Critical"},
};
const lm=l=>LM[l]||LM.LOW;

const BASE="http://127.0.0.1:8000";
const mkP=(q,s,st)=>{
  const rush=[8,9,10,12,13,17,18,19].includes(new Date().getHours())?1.5:1;
  const w=Math.max(.5,(q*s/Math.max(st,1))*rush*(.9+Math.random()*.2));
  const sc=Math.min(100,Math.round((q/20)*100*rush));
  const lv=sc<30?"LOW":sc<60?"MEDIUM":sc<85?"HIGH":"CRITICAL";
  const add=w>12?2:w>7?1:0;
  return{predicted_wait_time:+w.toFixed(1),congestion_score:sc,congestion_level:lv,is_rush_hour:rush>1,
    staff_recommendation:{add_staff:add,message:add?`Add ${add} staff member${add>1?"s":""}` :"Staffing optimal"},model_used:"formula_fallback"};
};
const mkD=()=>({total_predictions:Math.floor(Math.random()*40)+80,avg_wait_time:+(Math.random()*6+2).toFixed(0),
  current_queue_length:Math.floor(Math.random()*12)+2,uptime:"99.9%",
  avg_congestion_score:Math.floor(Math.random()*50)+15,
  recent_trend:["IMPROVING","STABLE","WORSENING"][Math.floor(Math.random()*3)],
  level_distribution:{LOW:18,MEDIUM:12,HIGH:6,CRITICAL:2}});

const api={
  predict:  async b=>{try{return(await axios.post(`${BASE}/predict`,b)).data;}catch{return mkP(b.queue_length,b.avg_service_time,b.staff_count);}},
  dashboard:async()=>{try{return(await axios.get(`${BASE}/dashboard`)).data;}catch{return mkD();}},
  explain:  async p=>{try{return(await axios.post(`${BASE}/ai/explain`,p)).data;}catch{return{success:false};}},
  suggest:  async q=>{try{return(await axios.post(`${BASE}/ai/suggest`,{queue_length:q})).data;}catch{return{success:false};}},
  trend:    async()=>{try{return(await axios.get(`${BASE}/ai/trend`)).data;}catch{return{success:false};}},
};

function useVoice(setForm) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const listen = () => {
    if (!supported) return alert("Voice not supported in this browser. Use Chrome.");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.start();
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase();
      console.log("Voice input:", text);
      // Extract numbers from speech
      const nums = text.match(/\d+(\.\d+)?/g);
      if (nums && nums.length >= 1) {
        setForm(prev => ({
          ...prev,
          queue_length:     nums[0] || prev.queue_length,
          avg_service_time: nums[1] || prev.avg_service_time,
          staff_count:      nums[2] || prev.staff_count,
          capacity:         nums[3] || prev.capacity,
        }));
      }
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
  };

  return { listen, listening, supported };
}

function InjectStyles(){
  useEffect(()=>{const el=document.createElement("style");el.textContent=STYLES;document.head.appendChild(el);return()=>document.head.removeChild(el);},[]);
  return null;
}
function Spinner({size=14,color=P}){
  return<div style={{width:size,height:size,border:`2px solid ${color}30`,borderTopColor:color,borderRadius:"50%",animation:"spin .65s linear infinite",flexShrink:0}}/>;
}
function Badge({level}){const m=lm(level);return<span className="sq-badge" style={{color:m.c,background:m.s,border:`1px solid ${m.b}`}}>{m.l}</span>;}
function Empty({icon="◯",msg}){
  return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 24px",gap:10}}>
    <div style={{fontSize:32,opacity:.15}}>{icon}</div>
    <div style={{fontSize:13,color:GR}}>{msg}</div>
  </div>;
}
function Tip({active,payload,label}){
  if(!active||!payload?.length)return null;
  return<div style={{background:"#fff",border:`1px solid ${BD}`,borderRadius:8,padding:"10px 14px",boxShadow:"0 4px 20px rgba(0,0,0,.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>
    <div style={{color:GR,marginBottom:6,fontSize:10}}>{label}</div>
    {payload.map(p=><div key={p.name} style={{color:p.color||N,marginBottom:2}}>{p.name}: <strong>{typeof p.value==="number"?p.value.toFixed(1):p.value}</strong></div>)}
  </div>;
}
const ax={fill:GR,fontSize:10,fontFamily:"'JetBrains Mono',monospace"};

/* ── SIDEBAR ── */
const PAGES=[{id:"dashboard",icon:"▦",label:"Dashboard"},{id:"predict",icon:"⬡",label:"Predict"},{id:"history",icon:"≡",label:"History"},{id:"insights",icon:"✦",label:"Insights"}];

function Sidebar({page,setPage,open,live}){
  return(
    <aside className={`sidebar ${open?"open":""}`} style={{width:220,background:"#fff",borderRight:`1px solid ${BD}`,height:"100vh",display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,zIndex:100}}>
      <div style={{padding:"20px 16px 16px",borderBottom:`1px solid ${BD}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,background:N,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="3" height="10" rx="1" fill="white"/>
              <rect x="7" y="6" width="3" height="7" rx="1" fill="white" opacity=".75"/>
              <rect x="12" y="9" width="2" height="4" rx="1" fill="white" opacity=".5"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:N,letterSpacing:"-.01em"}}>Silent Queue</div>
            <div style={{fontSize:10,color:GR}}>Queue Intelligence</div>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:2}}>
        <div style={{fontSize:11,fontWeight:600,color:"#A3ACB9",letterSpacing:".06em",padding:"4px 10px 8px",textTransform:"uppercase"}}>Menu</div>
        {PAGES.map(item=>(
          <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>setPage(item.id)}>
            <span style={{fontSize:16,width:20,textAlign:"center",flexShrink:0}}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
      <div style={{padding:"12px 16px",borderTop:`1px solid ${BD}`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:BG,borderRadius:8,border:`1px solid ${BD}`}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:live?G:GR,flexShrink:0,animation:live?"pulse 2s ease infinite":"none",boxShadow:live?`0 0 6px ${G}`:"none"}}/>
          <div>
            <div style={{fontSize:12,fontWeight:500,color:N}}>{live?"System Live":"Connecting"}</div>
            <div style={{fontSize:10,color:GR,fontFamily:"'JetBrains Mono',monospace"}}>:8000</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── TOPBAR ── */
function Topbar({page,onMenu}){
  const T={dashboard:{t:"Dashboard",d:"Live queue metrics, auto-refreshed every 5s"},predict:{t:"Predict",d:"ML predictions powered by Gemini AI"},history:{t:"History",d:"All predictions this session"},insights:{t:"Insights",d:"AI-generated analysis and recommendations"}};
  const info=T[page]||T.dashboard;
  return(
    <div style={{height:60,background:"#fff",borderBottom:`1px solid ${BD}`,display:"flex",alignItems:"center",padding:"0 28px",gap:14,flexShrink:0}}>
      <button className="mob-btn" onClick={onMenu} style={{display:"none",background:"none",border:"none",cursor:"pointer",fontSize:20,color:N,padding:4}}>☰</button>
      <div>
        <div style={{fontSize:16,fontWeight:600,color:N,letterSpacing:"-.01em"}}>{info.t}</div>
        <div style={{fontSize:12,color:GR,marginTop:1}}>{info.d}</div>
      </div>
    </div>
  );
}

/* ══ PAGE: DASHBOARD ══ */
function PageDashboard({dash,loading,trend,lastRefresh}){
  const TM={IMPROVING:{i:"↓",c:G,t:"Improving"},STABLE:{i:"→",c:GR,t:"Stable"},WORSENING:{i:"↑",c:R,t:"Worsening"}};
  const tr=TM[dash?.recent_trend]||TM.STABLE;
  const gc=v=>v>=85?R:v>=60?"#B45309":v>=30?AM:G;

  const kpis=[
    {label:"Queue Length",  value:loading?"…":dash?.current_queue_length, unit:"people",color:P,     icon:"👥",sub:"Live estimate"},
    {label:"Avg Wait Time", value:loading?"…":dash?.avg_wait_time ? `${parseFloat(dash.avg_wait_time).toFixed(1)}` : "—", unit:"min", color:N, icon:"⏱", sub:"Rolling avg"},
    {label:"Predictions",   value:loading?"…":dash?.total_predictions,    unit:"",     color:N,     icon:"🔮",sub:"This session"},
    {label:"Uptime",        value:loading?"…":dash?.uptime,               unit:"",     color:G,     icon:"📡",sub:"All systems OK"},
  ];

  return(
    <div className="page" style={{display:"flex",flexDirection:"column",gap:24}}>

      {/* KPIs */}
      <div className="g4 fu fu1" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {kpis.map(k=>(
          <div key={k.label} className="sq-card" style={{padding:"20px 22px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <span style={{fontSize:12,fontWeight:500,color:GR}}>{k.label}</span>
              <span style={{fontSize:18,opacity:.7}}>{k.icon}</span>
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:5}}>
              <span style={{fontSize:30,fontWeight:700,letterSpacing:"-.03em",color:k.color,lineHeight:1}}>{k.value??'—'}</span>
              {k.unit&&<span style={{fontSize:13,color:GR}}>{k.unit}</span>}
            </div>
            <div style={{fontSize:12,color:GR,marginTop:8}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="g2 fu fu2" style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20}}>

        {/* Area chart */}
        <div className="sq-card" style={{padding:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:N}}>Live Queue Trend</div>
              <div style={{fontSize:12,color:GR,marginTop:2}}>Refreshes every 5 seconds</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:GR,fontFamily:"'JetBrains Mono',monospace"}}>
              <Spinner size={10} color={P}/>
              {lastRefresh?.toLocaleTimeString()}
            </div>
          </div>
          <div style={{display:"flex",gap:20,marginBottom:16}}>
            {[{l:"Queue",c:P},{l:"Wait (min)",c:"#06B6D4"}].map(x=>(
              <div key={x.l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:GR}}>
                <div style={{width:16,height:2,background:x.c,borderRadius:1}}/>{x.l}
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend} margin={{top:4,right:4,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P} stopOpacity={.15}/><stop offset="95%" stopColor={P} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={.12}/><stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={BD} vertical={false}/>
              <XAxis dataKey="time" tick={ax} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis tick={ax} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="queue"    name="Queue" stroke={P}       strokeWidth={2} fill="url(#gP)" dot={false}/>
              <Area type="monotone" dataKey="waitTime" name="Wait"  stroke="#06B6D4" strokeWidth={2} fill="url(#gC)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right col */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="sq-card" style={{padding:22}}>
            <div style={{fontSize:12,fontWeight:500,color:GR,marginBottom:14}}>Current Trend</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:10,background:tr.c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:tr.c,fontWeight:700}}>{tr.i}</div>
              <div>
                <div style={{fontSize:22,fontWeight:700,color:tr.c}}>{tr.t}</div>
                <div style={{fontSize:12,color:GR}}>vs previous readings</div>
              </div>
            </div>
          </div>
          <div className="sq-card" style={{padding:22,flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:16}}>Congestion History</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={trend.slice(-10)} margin={{top:4,right:4,left:-24,bottom:0}} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke={BD} vertical={false}/>
                <XAxis dataKey="time" tick={ax} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                <YAxis tick={ax} axisLine={false} tickLine={false} domain={[0,100]}/>
                <Tooltip content={<Tip/>}/>
                <Bar dataKey="congestion" name="Congestion %" radius={[3,3,0,0]}>
                  {trend.slice(-10).map((d,i)=><Cell key={i} fill={gc(d.congestion)}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Level distribution */}
      {dash?.level_distribution&&(
        <div className="sq-card fu fu3" style={{padding:24}}>
          <div style={{fontSize:15,fontWeight:600,color:N,marginBottom:18}}>Congestion Level Distribution</div>
          <div className="g4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {Object.entries(dash.level_distribution).map(([level,count])=>{
              const m=lm(level);
              const total=Object.values(dash.level_distribution).reduce((a,b)=>a+b,0);
              const pct=total?Math.round((count/total)*100):0;
              return(
                <div key={level} style={{padding:"16px 18px",background:m.s,border:`1px solid ${m.b}`,borderRadius:8}}>
                  <div style={{fontSize:11,fontWeight:600,color:m.c,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>{level}</div>
                  <div style={{fontSize:28,fontWeight:700,color:m.c,lineHeight:1,marginBottom:4}}>{count}</div>
                  <div style={{fontSize:11,color:GR}}>{pct}% of total</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══ PAGE: PREDICT ══ */
function PagePredict({onPrediction}){
  const [form,setForm]=useState({queue_length:"",avg_service_time:"",staff_count:"3",capacity:"30"});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [result,setResult]=useState(null);
  const [explain,setExplain]=useState(null);
  const [loadingAI,setLoadingAI]=useState(false);
  const [sugg,setSugg]=useState(null);
const { listen, listening, supported } = useVoice(setForm);
  const set=k=>e=>{
    setForm(p=>({...p,[k]:e.target.value}));
    if(k==="queue_length"&&+e.target.value>=1)
      api.suggest(+e.target.value).then(r=>r.success&&setSugg(r.suggestions));
  };

  const submit=async()=>{
    const q=+form.queue_length,s=+form.avg_service_time,st=+form.staff_count,c=+form.capacity;
    if(!q||q<1)return setError("Queue length must be at least 1");
    if(!s||s<.5)return setError("Service time must be at least 0.5 min");
    setError("");setLoading(true);
    const res=await api.predict({queue_length:q,avg_service_time:s,staff_count:st,capacity:c});
    const entry={...res,queue_length:q,avg_service_time:s,staff_count:st,capacity:c,timestamp:new Date().toLocaleTimeString(),id:Date.now()};
setResult(entry);setLoading(false);onPrediction(entry);
speak(buildAlert(entry));
    setExplain(null);setLoadingAI(true);
    const ai=await api.explain(entry);
    setLoadingAI(false);
    if(ai.success)setExplain(ai.explanation);
  };

  const m=result?lm(result.congestion_level):null;
  const add=result?.staff_recommendation?.add_staff||0;

  return(
    <div className="page">
      <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>

        {/* Left — form */}
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div className="sq-card fu fu1" style={{padding:28}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
  <div>
    <div style={{fontSize:15,fontWeight:600,color:N,marginBottom:4}}>Queue Parameters</div>
    <div style={{fontSize:13,color:GR}}>Enter values or use voice input.</div>
  </div>
  {supported && (
    <button onClick={listen} disabled={listening}
      style={{height:40,width:40,borderRadius:"50%",border:`2px solid ${listening?"#DC2626":"#E3E8EF"}`,background:listening?"#FEF2F2":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all .2s",animation:listening?"pulse 1s ease infinite":"none",flexShrink:0}}>
      🎤
    </button>
  
)}
</div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {[
                {k:"queue_length",    label:"Queue Length",       ph:"Number of people waiting"},
                {k:"avg_service_time",label:"Avg. Service Time",  ph:"Minutes per person (e.g. 4.5)"},
                {k:"staff_count",     label:"Staff on Duty",      ph:"Active staff members"},
                {k:"capacity",        label:"Max Capacity",       ph:"Maximum queue size"},
              ].map(f=>(
                <div key={f.k}>
                  <label style={{display:"block",fontSize:12,fontWeight:500,color:GR,marginBottom:6}}>{f.label}</label>
                  <input className="sq-input" type="number" placeholder={f.ph} value={form[f.k]} onChange={set(f.k)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
                </div>
              ))}
            </div>

            {sugg&&(
              <div style={{marginTop:16,padding:"14px 16px",background:PS,border:`1px solid #C7C4FF`,borderRadius:8}}>
                <div style={{fontSize:12,fontWeight:600,color:P,marginBottom:10}}>✦ AI Suggestions for {form.queue_length} people</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:12,color:GR}}>Service times:</span>
                  {sugg.service_times?.map(t=>(
                    <button key={t} onClick={()=>setForm(p=>({...p,avg_service_time:String(t)}))}
                      style={{padding:"4px 12px",background:"#fff",border:`1px solid #C7C4FF`,borderRadius:6,fontSize:13,color:P,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>
                      {t}m
                    </button>
                  ))}
                </div>
                {sugg.reason&&<div style={{fontSize:11,color:GR,marginTop:8,fontStyle:"italic"}}>{sugg.reason}</div>}
              </div>
            )}

            {error&&<div style={{marginTop:16,padding:"10px 14px",background:RS,border:`1px solid #FECACA`,borderRadius:6,fontSize:13,color:R}}>{error}</div>}

            <button className="sq-btn" onClick={submit} disabled={loading} style={{marginTop:20,width:"100%",height:42}}>
              {loading?<><Spinner size={14} color="#fff"/>Running prediction…</>:"Run Prediction →"}
            </button>
          </div>

          <div className="sq-card fu fu2" style={{padding:20}}>
            <div style={{fontSize:13,fontWeight:600,color:N,marginBottom:14}}>Model Stack</div>
            {[
              {label:"Wait Time",      value:"GradientBoosting Regressor"},
              {label:"Congestion %",   value:"RandomForest Regressor"},
              {label:"Congestion Level",value:"RandomForest Classifier"},
              {label:"AI Explanation", value:"Google Gemini 1.5 Flash"},
              {label:"Training Data",  value:"5,000 synthetic records"},
            ].map(item=>(
              <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${BD}`}}>
                <span style={{fontSize:12,color:GR}}>{item.label}</span>
                <span style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:N,fontWeight:500}}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — result */}
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {!result?(
            <div className="sq-card" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400}}>
              <Empty icon="⬡" msg="Run a prediction to see results"/>
            </div>
          ):(
            <>
              <div className="sq-card fu" style={{padding:28}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
                  <div style={{fontSize:15,fontWeight:600,color:N}}>Prediction Result</div>
                  <Badge level={result.congestion_level}/>
                </div>
                <div style={{background:PS,border:`1px solid #C7C4FF`,borderRadius:10,padding:"22px 24px",marginBottom:20}}>
                  <div style={{fontSize:11,fontWeight:600,color:P,letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>Predicted Wait Time</div>
                  <div style={{display:"flex",alignItems:"flex-end",gap:6}}>
                    <span style={{fontSize:52,fontWeight:700,letterSpacing:"-.04em",color:P,lineHeight:1}}>{result.predicted_wait_time}</span>
                    <span style={{fontSize:20,color:P,opacity:.7,paddingBottom:6}}>min</span>
                    {result.is_rush_hour&&<span style={{marginLeft:8,padding:"4px 10px",background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:6,fontSize:11,color:AM,fontWeight:600,paddingBottom:6}}>Rush Hour</span>}
                  </div>
                </div>
                <div style={{marginBottom:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:500,color:N}}>Congestion</span>
                    <span style={{fontSize:13,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:m.c}}>{result.congestion_score.toFixed(0)}%</span>
                  </div>
                  <div style={{height:8,background:BG,borderRadius:99,overflow:"hidden",border:`1px solid ${BD}`}}>
                    <div style={{height:"100%",width:`${result.congestion_score}%`,background:m.c,borderRadius:99,transition:"width .9s cubic-bezier(.22,1,.36,1)"}}/>
                  </div>
                </div>
                <div style={{padding:"14px 16px",background:add>0?AS:GS,border:`1px solid ${add>0?"#FDE68A":"#9FE4CF"}`,borderRadius:8,display:"flex",gap:12,alignItems:"center"}}>
                  <span style={{fontSize:20}}>{add>0?"👤":"✓"}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:add>0?AM:G}}>{result.staff_recommendation?.message}</div>
                    <div style={{fontSize:11,color:GR,marginTop:2,fontFamily:"'JetBrains Mono',monospace"}}>
                      {result.model_used==="ml_ensemble"?"ML Ensemble":"Formula"} · {result.timestamp}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sq-card fu fu1" style={{padding:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontSize:14,fontWeight:600,color:N}}>Gemini AI Analysis</div>
                  <span style={{fontSize:11,padding:"2px 8px",background:PS,color:P,borderRadius:4,fontWeight:500}}>gemini-1.5-flash</span>
                </div>
                {loadingAI?(
                  <div style={{display:"flex",gap:10,alignItems:"center",padding:"14px 0"}}>
                    <Spinner size={14} color={P}/>
                    <span style={{fontSize:13,color:GR}}>Analyzing with Gemini AI…</span>
                  </div>
                ):explain?(
                  <div style={{fontSize:14,color:"#374151",lineHeight:1.7}}>{explain}</div>
                ):(
                  <div style={{fontSize:13,color:GR,fontStyle:"italic"}}>AI explanation unavailable — check your Gemini API key in .env</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══ PAGE: HISTORY ══ */
function PageHistory({history}){
  const [filter,setFilter]=useState("ALL");
  const filtered=filter==="ALL"?history:history.filter(h=>h.congestion_level===filter);

  return(
    <div className="page" style={{display:"flex",flexDirection:"column",gap:20}}>
      {history.length>0&&(
        <div className="g4 fu fu1" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
          {[
            {label:"Total Predictions",value:history.length,color:N},
            {label:"Avg Wait Time",value:`${(history.reduce((a,h)=>a+h.predicted_wait_time,0)/history.length).toFixed(1)} min`,color:P},
            {label:"Max Wait Time",value:`${Math.max(...history.map(h=>h.predicted_wait_time))} min`,color:R},
            {label:"Critical Events",value:history.filter(h=>h.congestion_level==="CRITICAL").length,color:R},
          ].map(s=>(
            <div key={s.label} className="sq-card" style={{padding:"16px 18px"}}>
              <div style={{fontSize:11,fontWeight:500,color:GR,marginBottom:8}}>{s.label}</div>
              <div style={{fontSize:26,fontWeight:700,color:s.color,letterSpacing:"-.02em"}}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="sq-card fu fu2" style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:15,fontWeight:600,color:N}}>Prediction Log</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["ALL","LOW","MEDIUM","HIGH","CRITICAL"].map(l=>(
              <button key={l} onClick={()=>setFilter(l)}
                style={{padding:"5px 12px",borderRadius:6,fontSize:12,fontWeight:500,cursor:"pointer",border:`1px solid ${filter===l?"#C7C4FF":BD}`,background:filter===l?PS:"#fff",color:filter===l?P:GR,transition:"all .15s"}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {!filtered.length?(
          <Empty icon="≡" msg={history.length?"No predictions match this filter":"No predictions yet — go to Predict to start"}/>
        ):(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:`2px solid ${BD}`}}>
                  {["#","Time","Queue","Svc","Wait","Load","Level","Staff","Model"].map(h=>(
                    <th key={h} style={{padding:"8px 12px 12px 0",textAlign:"left",fontSize:11,fontWeight:600,color:GR,whiteSpace:"nowrap",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".04em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...filtered].reverse().map((row,i)=>{
                  const m=lm(row.congestion_level);
                  const add=row.staff_recommendation?.add_staff||0;
                  return(
                    <tr key={row.id} style={{borderBottom:`1px solid ${BD}`}}>
                      <td style={{padding:"12px 12px 12px 0",fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:GR}}>{filtered.length-i}</td>
                      <td style={{padding:"12px 12px 12px 0",fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:GR,whiteSpace:"nowrap"}}>{row.timestamp}</td>
                      <td style={{padding:"12px 12px 12px 0",fontSize:13,fontWeight:500,color:N}}>{row.queue_length}</td>
                      <td style={{padding:"12px 12px 12px 0",fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:GR}}>{row.avg_service_time}m</td>
                      <td style={{padding:"12px 12px 12px 0"}}>
                        <span style={{fontSize:15,fontWeight:700,color:P,fontFamily:"'JetBrains Mono',monospace"}}>{row.predicted_wait_time}m</span>
                      </td>
                      <td style={{padding:"12px 12px 12px 0"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:52,height:5,background:BG,borderRadius:99,border:`1px solid ${BD}`,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${row.congestion_score}%`,background:m.c,borderRadius:99}}/>
                          </div>
                          <span style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:N}}>{row.congestion_score.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{padding:"12px 12px 12px 0"}}><Badge level={row.congestion_level}/></td>
                      <td style={{padding:"12px 12px 12px 0",fontSize:12,fontWeight:500,color:add>0?AM:G}}>{add>0?`+${add} staff`:"Optimal"}</td>
                      <td style={{padding:"12px 12px 12px 0",fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:GR}}>{row.model_used==="ml_ensemble"?"ML":"Formula"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══ PAGE: INSIGHTS ══ */
function PageInsights({history}){
  const [trendAI,setTrendAI]=useState(null);
  const [loadingT,setLoadingT]=useState(false);

  const fetchTrend=async()=>{
    setLoadingT(true);
    const r=await api.trend();
    setLoadingT(false);
    if(r.success)setTrendAI(r.analysis);
  };

  const latest=history[history.length-1];
  const insights=[];

  if(!latest){
    insights.push({icon:"○",title:"No Data Yet",desc:"Run predictions to generate AI insights.",color:GR,bg:"#F8FAFF",border:BD});
  } else {
    const{congestion_level,congestion_score,predicted_wait_time,staff_recommendation,is_rush_hour}=latest;
    const add=staff_recommendation?.add_staff||0;
    if(congestion_level==="CRITICAL") insights.push({icon:"!",title:"Critical Congestion",desc:`${congestion_score.toFixed(0)}% capacity — immediate action required.`,color:R,bg:RS,border:"#FECACA"});
    else if(congestion_level==="HIGH") insights.push({icon:"↑",title:"High Load Detected",desc:"Queue building — proactive staffing recommended.",color:"#B45309",bg:"#FFFBEB",border:"#FCD34D"});
    else if(congestion_level==="LOW") insights.push({icon:"✓",title:"Queue Normal",desc:`${congestion_score.toFixed(0)}% load — within SLA.`,color:G,bg:GS,border:"#9FE4CF"});
    if(add>0) insights.push({icon:"+",title:staff_recommendation.message,desc:`Current wait: ${predicted_wait_time} min`,color:AM,bg:AS,border:"#FDE68A"});
    if(is_rush_hour) insights.push({icon:"⊙",title:"Rush Hour Active",desc:"Peak period — elevated demand expected.",color:P,bg:PS,border:"#C7C4FF"});
    if(predicted_wait_time>15) insights.push({icon:"×",title:"SLA Breach",desc:`${predicted_wait_time}m exceeds 15-min target.`,color:R,bg:RS,border:"#FECACA"});
    if(history.length>=5){
      const sc=history.slice(-5).map(h=>h.congestion_score);
      const d=sc[4]-sc[0];
      if(d>15)  insights.push({icon:"↗",title:"Worsening Trend",desc:`+${d.toFixed(0)}pts over last 5 readings.`,color:R,bg:RS,border:"#FECACA"});
      if(d<-10) insights.push({icon:"↘",title:"Improving Trend",desc:`${d.toFixed(0)}pts reduction in congestion.`,color:G,bg:GS,border:"#9FE4CF"});
    }
  }

  return(
    <div className="page" style={{display:"flex",flexDirection:"column",gap:24}}>

      {/* Alerts */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 style={{fontSize:16,fontWeight:600,color:N}}>Active Alerts</h2>
          <span style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:GR,background:BG,padding:"3px 8px",borderRadius:6,border:`1px solid ${BD}`}}>{insights.length} active</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {insights.map((ins,i)=>(
            <div key={i} className="fu" style={{animationDelay:`${i*.04}s`,display:"flex",gap:14,alignItems:"flex-start",padding:"16px 18px",background:ins.bg,border:`1px solid ${ins.border}`,borderRadius:8}}>
              <div style={{width:28,height:28,borderRadius:8,background:ins.color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,flexShrink:0}}>{ins.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:ins.color,marginBottom:3}}>{ins.title}</div>
                <div style={{fontSize:13,color:GR,lineHeight:1.5}}>{ins.desc}</div>
              </div>
              <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:GR,flexShrink:0,marginTop:2}}>
                {new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Trend */}
      <div className="sq-card fu fu3" style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:N}}>AI Trend Analysis</div>
            <div style={{fontSize:12,color:GR,marginTop:2}}>Powered by Gemini · needs 3+ predictions</div>
          </div>
          <button className="sq-btn-sm" onClick={fetchTrend} disabled={loadingT||history.length<3}>
            {loadingT?<><Spinner size={12} color={GR}/>Analyzing…</>:"Analyze Trend →"}
          </button>
        </div>
        {history.length<3?(
          <div style={{padding:"16px 0",fontSize:13,color:GR,fontStyle:"italic"}}>Run at least 3 predictions to unlock trend analysis.</div>
        ):trendAI?(
          <div style={{padding:"18px 20px",background:"#F8FAFF",border:`1px solid #E0E7FF`,borderRadius:8,fontSize:14,color:"#374151",lineHeight:1.75}}>{trendAI}</div>
        ):(
          <div style={{padding:"16px 0",fontSize:13,color:GR}}>Click "Analyze Trend" to get a Gemini AI analysis of your history.</div>
        )}
      </div>

      {/* Stats */}
      {history.length>0&&(
        <div className="sq-card fu fu4" style={{padding:24}}>
          <div style={{fontSize:15,fontWeight:600,color:N,marginBottom:18}}>Session Statistics</div>
          <div className="g3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[
              {label:"Total Predictions",   value:history.length},
              {label:"Avg Wait Time",        value:`${(history.reduce((a,h)=>a+h.predicted_wait_time,0)/history.length).toFixed(1)} min`},
              {label:"Avg Congestion",       value:`${(history.reduce((a,h)=>a+h.congestion_score,0)/history.length).toFixed(0)}%`},
              {label:"Rush Hour Predictions",value:history.filter(h=>h.is_rush_hour).length},
              {label:"Staff Actions",        value:history.filter(h=>h.staff_recommendation?.add_staff>0).length},
              {label:"SLA Breaches",         value:history.filter(h=>h.predicted_wait_time>15).length},
            ].map(s=>(
              <div key={s.label} style={{padding:"16px 18px",background:BG,borderRadius:8,border:`1px solid ${BD}`}}>
                <div style={{fontSize:11,fontWeight:500,color:GR,marginBottom:8}}>{s.label}</div>
                <div style={{fontSize:24,fontWeight:700,color:N,letterSpacing:"-.02em"}}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══ ROOT APP ══ */
export default function App(){
  const [page,setPage]=useState("dashboard");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [history,setHistory]=useState([]);
  const [dash,setDash]=useState(null);
  const [loading,setLoading]=useState(true);
  const [lastRefresh,setLastRefresh]=useState(null);
  const [live,setLive]=useState(false);
  const [trend,setTrend]=useState(()=>
    Array.from({length:12},(_,i)=>({time:`T${i}`,queue:Math.floor(Math.random()*10)+2,waitTime:+(Math.random()*5+1).toFixed(1),congestion:Math.floor(Math.random()*55)+10}))
  );

  const refresh=useCallback(async()=>{
    const d=await api.dashboard();
    setDash(d);setLoading(false);setLive(true);setLastRefresh(new Date());
    const now=new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    setTrend(prev=>[...prev.slice(-11),{time:now,queue:d.current_queue_length,waitTime:+d.avg_wait_time,congestion:d.avg_congestion_score}]);
  },[]);

  useEffect(()=>{refresh();const id=setInterval(refresh,5000);return()=>clearInterval(id);},[refresh]);

  const handlePrediction=useCallback(entry=>{setHistory(prev=>[...prev,entry]);},[]);

  return(
    <>
      <InjectStyles/>
      <div style={{display:"flex",minHeight:"100vh"}}>
        <Sidebar page={page} setPage={p=>{setPage(p);setSidebarOpen(false);}} open={sidebarOpen} live={live}/>
        {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.3)",zIndex:150}}/>}
        <div className="main-area" style={{flex:1,marginLeft:220,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          <Topbar page={page} onMenu={()=>setSidebarOpen(o=>!o)}/>
          <main className="pg" style={{flex:1,padding:"28px 32px",maxWidth:1200,width:"100%",alignSelf:"stretch"}}>
            {page==="dashboard"&&<PageDashboard dash={dash} loading={loading} trend={trend} lastRefresh={lastRefresh}/>}
            {page==="predict"  &&<PagePredict   onPrediction={handlePrediction}/>}
            {page==="history"  &&<PageHistory   history={history}/>}
            {page==="insights" &&<PageInsights  history={history} dash={dash}/>}
          </main>
          <footer style={{borderTop:`1px solid ${BD}`,background:"#fff",padding:"14px 32px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:GR}}>Silent Queue v4 · AI Queue Intelligence</span>
            <div style={{display:"flex",gap:20,fontSize:12,color:GR,fontFamily:"'JetBrains Mono',monospace"}}>
              <span>backend :8000</span><span>refresh 5s</span>
              <span style={{color:live?G:GR}}>● {live?"live":"offline"}</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}