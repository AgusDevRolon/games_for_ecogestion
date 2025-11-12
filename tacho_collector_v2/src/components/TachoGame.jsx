
import React, { useEffect, useRef, useState } from 'react';
import '../styles.css';
import banana from '../assets/banana.svg';
import glass from '../assets/glass.svg';
import plastic from '../assets/plastic.svg';
import can from '../assets/can.svg';
import battery from '../assets/battery.svg';
import oil from '../assets/oil.svg';
import box from '../assets/box.svg';
import syringe from '../assets/syringe.svg';
import binGeneric from '../assets/bin_generic.svg';
import heartF from '../assets/heart_f.svg';
import heartE from '../assets/heart_e.svg';

const RES = [
  { id:1, icon: banana, tipo:'Orgánico', nombre:'Cáscara de banana' },
  { id:2, icon: glass, tipo:'Vidrio', nombre:'Botella de vidrio' },
  { id:3, icon: plastic, tipo:'Plástico', nombre:'Botella plástica' },
  { id:4, icon: can, tipo:'Metal', nombre:'Lata de aluminio' },
  { id:5, icon: battery, tipo:'Peligroso', nombre:'Pila usada' },
  { id:6, icon: oil, tipo:'Peligroso', nombre:'Aceite usado' },
  { id:7, icon: box, tipo:'PapelCarton', nombre:'Cartón limpio' },
  { id:8, icon: syringe, tipo:'Peligroso', nombre:'Jeringa' }
];

const TACHOS = ['Orgánico','Plástico','Vidrio','PapelCarton','Metal','Peligroso','NoReciclable'];

function randChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

export default function TachoGame(){
  const areaRef = useRef();
  const [playerX, setPlayerX] = useState(0.5); // 0..1 fraction
  const [items, setItems] = useState([]); // {uid,x,y,vy,res,size}
  const itemsRef = useRef([]);
  const [running, setRunning] = useState(true);
  const [tacho, setTacho] = useState(()=> randChoice(TACHOS));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const keys = useRef({});
  const raf = useRef();
  const lastTime = useRef();
  const playerWidth = 120;
  const playerHeight = 80;
  const itemSize = 72;

  useEffect(()=>{ itemsRef.current = items; }, [items]);

  // spawn items interval
  useEffect(()=>{
    const iv = setInterval(()=>{
      if(!running) return;
      const area = areaRef.current;
      if(!area) return;
      const w = area.clientWidth;
      const x = Math.random() * (w - itemSize) + itemSize/2;
      const vy = 100 + Math.random()*80;
      const res = RES[Math.floor(Math.random()*RES.length)];
      const obj = { uid: Date.now()+Math.random(), x, y: -itemSize, vy, res, size: itemSize };
      setItems(prev => [...prev, obj]);
    }, 800);
    return ()=> clearInterval(iv);
  }, [running]);

  // keyboard handling
  useEffect(()=>{
    const onKey = (e)=>{
      if(e.type==='keydown') keys.current[e.key.toLowerCase()] = true;
      else keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return ()=>{ window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); }
  }, []);

  // game loop: RAF updates positions and collision reliably
  useEffect(()=>{
    lastTime.current = performance.now();
    const loop = (t)=>{
      const dt = (t - lastTime.current)/1000;
      lastTime.current = t;
      const area = areaRef.current;
      if(area && running){
        const w = area.clientWidth;
        const h = area.clientHeight;

        // update player position
        const left = keys.current['arrowleft'] || keys.current['a'];
        const right = keys.current['arrowright'] || keys.current['d'];
        let px = playerX;
        const moveSpeed = 0.8; // fraction per second
        if(left && !right) px = Math.max(0.05, px - moveSpeed*dt);
        if(right && !left) px = Math.min(0.95, px + moveSpeed*dt);
        setPlayerX(px);

        // update items and handle collisions
        setItems(prev => {
          const next = [];
          for(const it of prev){
            const newY = it.y + it.vy * dt;
            // check collision with player's tacho rectangle
            const playerCenterX = px * w;
            const playerLeft = playerCenterX - playerWidth/2;
            const playerRight = playerCenterX + playerWidth/2;
            const playerTop = h - 12 - playerHeight; // top y of tacho
            const itemLeft = it.x - it.size/2;
            const itemRight = it.x + it.size/2;
            const itemBottom = newY + it.size/2;
            // collision if itemBottom >= playerTop and horizontal overlap
            if(itemBottom >= playerTop && itemLeft < playerRight && itemRight > playerLeft){
              // caught
              if(it.res.tipo === tacho){
                setScore(s => s+1);
              } else {
                setLives(l => l-1);
              }
              // do not push to next (removed)
            } else if(newY > h + 100){
              // fell beyond bottom, ignore
            } else {
              next.push({ ...it, y: newY });
            }
          }
          return next;
        });
      }
      // game over check
      if(lives <= 0){
        setRunning(false);
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return ()=> cancelAnimationFrame(raf.current);
  }, [playerX, running, lives, tacho]);

  const handleAreaClick = (e)=>{
    const area = areaRef.current;
    if(!area) return;
    const rect = area.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setPlayerX(x / area.clientWidth);
  };

  const changeTacho = ()=> setTacho(randChoice(TACHOS));
  const restart = ()=>{ setItems([]); setScore(0); setLives(3); setRunning(true); setTacho(randChoice(TACHOS)); lastTime.current = performance.now(); };

  return (
    <div>
      <div className="hud">
        <div className="score">Puntaje: {score}</div>
        <div className="small-muted">Tacho: <strong>{tacho}</strong></div>
        <div className="lives" aria-hidden>
          {Array.from({length:3}).map((_,i)=>(
            <img key={i} src={ i < lives ? heartF : heartE } className="heart" alt={i<lives ? 'vida' : 'sin vida'} />
          ))}
        </div>
      </div>

      <div className="canvas-area" ref={areaRef} onClick={handleAreaClick}>
        {items.map(it=>(
          <div className={'fall-item'} key={it.uid} style={{left: it.x - it.size/2, top: it.y, width: it.size, height: it.size}}>
            <img src={it.res.icon} alt={it.res.nombre} />
          </div>
        ))}

        <div className="tacho" style={{left: `calc(${playerX*100}% - ${playerWidth/2}px)`}}>
          <img src={binGeneric} alt="tacho" className="tacho-img" />
          <div style={{fontSize:12}}>{tacho}</div>
        </div>

        {!running && (
          <div className="message">
            <h4>Game Over</h4>
            <p>Puntaje final: {score}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-primary" onClick={restart}>Reintentar</button>
              <button className="btn btn-outline-secondary" onClick={changeTacho}>Cambiar tacho</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
