import React,{useEffect,useState, useRef} from 'react';
export default function Conveyor(){
  const [items,setItems]=useState([]); const [score,setScore]=useState(0); const [speed,setSpeed]=useState(1); const [running,setRunning]=useState(true); const types=['Reciclable','Orgánico','Peligroso','NoReciclable'];
  useEffect(()=>{ const iv=setInterval(()=>{ if(!running) return; const t=types[Math.floor(Math.random()*types.length)]; setItems(it=>[...it,{id:Date.now()+Math.random(), type:t, pos:0}]); }, 900); return ()=>clearInterval(iv); },[running]);
  useEffect(()=>{ const iv=setInterval(()=>{ setItems(prev=>prev.map(it=>({...it,pos:it.pos+0.02*speed})).filter(it=>it.pos<1)); },80); return ()=>clearInterval(iv); },[speed]);
  const sendTo=(itemId, target)=>{ setItems(prev=>prev.filter(it=>{ if(it.id!==itemId) return true; if(it.type===target) setScore(s=>s+1); else setScore(s=>Math.max(0,s-1)); return false; })); };
  return (<div>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><div>Puntaje: <strong>{score}</strong></div><div><button className="btn btn-outline-secondary" onClick={()=>setRunning(r=>!r)}>{running?'Pausar':'Reanudar'}</button></div></div>
    <div style={{background:'#fff',padding:12,borderRadius:8}}>
      <div style={{height:120,position:'relative',overflow:'hidden',borderRadius:8,background:'linear-gradient(180deg,#f3f7f3,#fff)'}}>
        {items.map(it=>(<div key={it.id} style={{position:'absolute',left:`${it.pos*100}%`,top:20,transition:'left 80ms linear',width:80,height:80,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,boxShadow:'0 6px 16px rgba(0,0,0,0.08)',background:'#fff'}}>{it.type==='Reciclable'?'♻️':it.type==='Orgánico'?'🍌':'⚠️'}</div>))}
      </div>
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <button className="btn btn-success" onClick={()=>{ if(items.length) sendTo(items[0].id,'Reciclable') }}>Enviar a Reciclable</button>
        <button className="btn btn-warning" onClick={()=>{ if(items.length) sendTo(items[0].id,'Orgánico') }}>Enviar a Orgánico</button>
        <button className="btn btn-secondary" onClick={()=>{ if(items.length) sendTo(items[0].id,'NoReciclable') }}>Enviar a Resto</button>
      </div>
    </div>
    <div style={{marginTop:8}} className="small-muted">Usá los botones para clasificar el primer elemento de la cinta.</div>
  </div>); }