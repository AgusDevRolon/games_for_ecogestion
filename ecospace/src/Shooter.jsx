import React,{useEffect,useRef,useState} from 'react';
const RES=[{id:1,label:'Botella',tipo:'Reciclable'},{id:2,label:'Jeringa',tipo:'Peligroso'},{id:3,label:'Lata',tipo:'Reciclable'},{id:4,label:'Pila',tipo:'Peligroso'}];
export default function Shooter(){
  const areaRef=useRef(); const [playerX,setPlayerX]=useState(50); const [bullets,setBullets]=useState([]); const [enemies,setEnemies]=useState([]); const [score,setScore]=useState(0); const keys=useRef({});
  useEffect(()=>{ const kd=(e)=>keys.current[e.key.toLowerCase()]=true; const ku=(e)=>keys.current[e.key.toLowerCase()]=false; window.addEventListener('keydown',kd); window.addEventListener('keyup',ku); return ()=>{window.removeEventListener('keydown',kd); window.removeEventListener('keyup',ku)} },[]);
  useEffect(()=>{ const iv=setInterval(()=>{ setEnemies(prev=>[...prev,{id:Date.now()+Math.random(), x:Math.random()*90+5, y:0, res: RES[Math.floor(Math.random()*RES.length)]}]); },900); return ()=>clearInterval(iv); },[]);
  useEffect(()=>{ let raf; const loop=(t)=>{ // movement and bullets
    if(keys.current['arrowleft']||keys.current['a']) setPlayerX(x=>Math.max(5,x-0.6)); if(keys.current['arrowright']||keys.current['d']) setPlayerX(x=>Math.min(95,x+0.6));
    setBullets(prev=>prev.map(b=>({...b,y:b.y-6})).filter(b=>b.y>0));
    setEnemies(prev=>prev.map(e=>({...e,y:e.y+1.8})).filter(e=>e.y<100));
    // collisions
    setEnemies(prevE=>{ let E=[]; for(const en of prevE){ let hit=false; for(const b of bullets){ if(Math.abs(b.x-en.x)<6 && Math.abs(b.y-en.y)<6){ hit=true; if(en.res.tipo==='Reciclable') setScore(s=>s+1); else setScore(s=>Math.max(0,s-1)); } } if(!hit) E.push(en); } return E; });
    raf=requestAnimationFrame(loop);
  }; raf=requestAnimationFrame(loop); return ()=>cancelAnimationFrame(raf); },[bullets]);
  const shoot=()=> setBullets(b=>[...b,{id:Date.now(), x:playerX, y:90}]);
  return (<div>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><div>Score: <strong>{score}</strong></div><div><button className="btn btn-primary" onClick={shoot}>Disparar</button></div></div>
    <div ref={areaRef} style={{position:'relative',height:420,background:'#010b1a',borderRadius:8,overflow:'hidden'}} onClick={(e)=>{ const r=areaRef.current.getBoundingClientRect(); setPlayerX(((e.clientX-r.left)/r.width)*100); }}>
      {/* player */}
      <div style={{position:'absolute',left:`${playerX}%`,bottom:10,transform:'translateX(-50%)',width:60,height:28,background:'#2dd4bf',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>🚀</div>
      {/* bullets */}
      {bullets.map(b=>(<div key={b.id} style={{position:'absolute',left:`${b.x}%`,bottom:`${b.y}%`,transform:'translateX(-50%)',width:6,height:12,background:'#fff'}}></div>))}
      {/* enemies */}
      {enemies.map(en=>(<div key={en.id} style={{position:'absolute',left:`${en.x}%`,top:`${en.y}%`,transform:'translateX(-50%)',width:36,height:24,background:'#fff',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>{en.res.label}</div>))}
    </div>
    <div style={{marginTop:8}} className="small-muted">Mover: flechas / A D. Click para mover. Pulsa Disparar o Espacio.</div>
  </div>); }