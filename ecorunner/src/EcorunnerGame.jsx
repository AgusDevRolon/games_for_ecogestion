import React, {useEffect,useRef,useState} from 'react';
// Simple 2D runner using DOM elements and basic physics
export default function Game(){
  const areaRef = useRef();
  const [player, setPlayer] = useState({x:60,y:220,vx:0,vy:0,onGround:false});
  const [items, setItems] = useState([]); // collectibles with x,y,type,uid
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const keys = useRef({});
  const gravity = 900;
  const playerW=48, playerH=64;
  useEffect(()=>{
    const onKey=(e)=>{ keys.current[e.type==='keydown'? 'down':'up'] = keys.current[e.type==='keydown'? 'down': 'up'];};
    // simpler: use keydown/keyup mapping
    const kd = (e)=> keys.current[e.key.toLowerCase()] = true;
    const ku = (e)=> keys.current[e.key.toLowerCase()] = false;
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return ()=>{ window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); }
  },[]);
  // spawn items on platforms periodically
  useEffect(()=>{
    const iv = setInterval(()=>{
      const area = areaRef.current;
      if(!area) return;
      const w = area.clientWidth;
      const x = 40 + Math.random()*(w-80);
      const y = 300 - Math.random()*160; // platform-ish heights
      const types = ['Reciclable','Orgánico','Peligroso'];
      setItems(it=> [...it, {uid:Date.now()+Math.random(), x, y, type: types[Math.floor(Math.random()*types.length)]}]);
    }, 1200);
    return ()=> clearInterval(iv);
  },[]);
  useEffect(()=>{
    let raf = null;
    let last = performance.now();
    const loop = (t)=>{
      const dt = (t-last)/1000; last = t;
      // controls
      let {x,y,vx,vy,onGround} = player;
      if(keys.current['arrowleft']||keys.current['a']) vx = -180;
      else if(keys.current['arrowright']||keys.current['d']) vx = 180;
      else vx = 0;
      if((keys.current[' ']||keys.current['w']||keys.current['arrowup']) && onGround){
        vy = -420; onGround=false;
      }
      vy += gravity*dt;
      x += vx*dt; y += vy*dt;
      // ground collision
      const groundY = 300;
      if(y + playerH/2 >= groundY){ y = groundY - playerH/2; vy=0; onGround=true; }
      // bounds
      const area = areaRef.current;
      if(area){
        const w = area.clientWidth;
        x = Math.max(playerW/2, Math.min(w-playerW/2, x));
      }
      setPlayer({x,y,vx,vy,onGround});
      // check item collisions
      setItems(prev=>{
        const remain=[];
        for(const it of prev){
          // simple AABB collision
          const iw=36, ih=36;
          if(it.x+iw/2 > x-playerW/2 && it.x-iw/2 < x+playerW/2 && it.y+ih/2 > y-playerH/2 && it.y-ih/2 < y+playerH/2){
            // caught: score if recyclable
            if(it.type==='Reciclable') setScore(s=>s+1);
            else setScore(s=>Math.max(0,s-1));
          } else remain.push(it);
        }
        return remain;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return ()=> cancelAnimationFrame(raf);
  },[player]);
  return (<div>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><div>Score: <strong>{score}</strong></div><div>Nivel: {level}</div></div>
    <div ref={areaRef} style={{position:'relative',height:360,background:'linear-gradient(180deg,#cfeecf,#eefef2)',borderRadius:8,overflow:'hidden'}} onClick={(e)=>{ const rect=areaRef.current.getBoundingClientRect(); setPlayer(p=>({...p,x:e.clientX-rect.left})); }}>
      {/* ground */}
      <div style={{position:'absolute',left:0,right:0,bottom:40,height:60,background:'#6bb06b'}}></div>
      {/* player */}
      <div style={{position:'absolute',width:playerW,height:playerH,left:player.x-playerW/2,top:player.y-playerH/2,background:'#fff',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 16px rgba(0,0,0,0.12)'}}>
        <div style={{fontWeight:700}}>🗑️</div>
      </div>
      {/* items */}
      {items.map(it=>(<div key={it.uid} style={{position:'absolute',left:it.x-18,top:it.y-18,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,background:'#fff',boxShadow:'0 4px 10px rgba(0,0,0,0.06)'}}>
        <div style={{fontSize:20}}>{it.type==='Reciclable'?'♻️': it.type==='Orgánico'?'🍌':'⚠️'}</div>
      </div>))}
    </div>
    <div style={{marginTop:8}} className="small-muted">Controles: flechas izquierda/derecha, W/A/D para saltar</div>
  </div>);
}