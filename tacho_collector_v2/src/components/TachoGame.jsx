import React, { useEffect, useRef, useState } from 'react';
import '../styles.css';

// RUTAS que me diste (nombres originales)
import banana from '../assets/cascara-de-platano.png'; 
import vidrio from '../assets/botella-de-vidrio.png'; 
import plastico from '../assets/botella-de-plastico.png'; 
import carton from '../assets/carton.png'; 
import bateria from '../assets/baterias.png'; 
import aceite from '../assets/aceite-de-cocina.png'; 
import snacks from '../assets/envoltorio-de-snacks.png'; 
import jeringa from '../assets/jeringa.png'; 
import metal from '../assets/lata-de-aluminio.png'; 
import jugador from '../assets/player_bin.png'; 

const RES = [
  { id:1, icon: banana, tipo:'Orgánico', nombre:'Cáscara de banana' },
  { id:2, icon: vidrio, tipo:'Vidrio', nombre:'Botella de vidrio' },
  { id:3, icon: plastico, tipo:'Plástico', nombre:'Botella plástica' },
  { id:4, icon: metal, tipo:'Metal', nombre:'Lata de aluminio' },
  { id:5, icon: bateria, tipo:'Peligroso', nombre:'Pila usada' },
  { id:6, icon: aceite, tipo:'Peligroso', nombre:'Aceite usado' },
  { id:7, icon: carton, tipo:'PapelCarton', nombre:'Cartón limpio' },
  { id:8, icon: jeringa, tipo:'Peligroso', nombre:'Jeringa' },
  { id:9, icon: snacks, tipo:'NoReciclable', nombre:'Envoltorio de snacks' }
];

const TACHOS = ['Orgánico','Plástico','Vidrio','PapelCarton','Metal','Peligroso','NoReciclable'];
function randChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

export default function TachoGame(){
  const areaRef = useRef(null);
  const rafRef = useRef(null);
  const lastTime = useRef(performance.now());
  const itemsRef = useRef([]);        // mutable list para físicas
  const [itemsState, setItemsState] = useState([]); // para render
  const spawnTimer = useRef(0);

  // player en px para movimiento inmediato (como Shooter)
  const playerPxRef = useRef(0); // posición X en px (centro)
  const [playerX, setPlayerX] = useState(0.5); // fracción 0..1 usada para render en css

  // input
  const keys = useRef({});

  // juego
  const [running, setRunning] = useState(true);
  const [tacho, setTacho] = useState(()=> randChoice(TACHOS));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(lives);

  // parámetros (ajustables)
  const PLAYER_W = 140;
  const PLAYER_H = 100;
  const ITEM_SZ = 64;
  const SPAWN_INTERVAL = 1000; // ms
  const MAX_CONCURRENT = 7;
  const MIN_SPAWN_DIST = 90;

  useEffect(()=> { livesRef.current = lives; }, [lives]);

  // Utils
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Try spawn avoiding near items
  const trySpawnAt = (area, attempts = 6) => {
    if(!area) return null;
    const w = area.clientWidth;
    for(let i=0;i<attempts;i++){
      const x = Math.random() * (w - ITEM_SZ) + ITEM_SZ/2;
      const tooClose = itemsRef.current.some(it => Math.abs(it.x - x) < MIN_SPAWN_DIST && it.y < 150);
      if(!tooClose){
        const vy = 100 + Math.random()*200;
        const res = RES[Math.floor(Math.random()*RES.length)];
        return { uid: Date.now() + Math.random(), x, y: -ITEM_SZ, vy, res, size: ITEM_SZ };
      }
    }
    // fallback
    const x = Math.random() * (w - ITEM_SZ) + ITEM_SZ/2;
    const vy = 100 + Math.random()*200;
    const res = RES[Math.floor(Math.random()*RES.length)];
    return { uid: Date.now() + Math.random(), x, y: -ITEM_SZ, vy, res, size: ITEM_SZ };
  };

  // Input: pointer movement => set playerPxRef directly (INMEDIATO, como shooter click)
  useEffect(()=>{
    const area = areaRef.current;
    if(!area) return;

    const setFromClientX = (clientX) => {
      const rect = area.getBoundingClientRect();
      const x = clientX - rect.left;
      const clamped = clamp(x, PLAYER_W/2, rect.width - PLAYER_W/2);
      playerPxRef.current = clamped;
      setPlayerX(clamped / rect.width);
    };

    const onPointerMove = (e) => {
      // mover inmediatamente con el puntero (si está dentro)
      setFromClientX(e.clientX);
    };
    const onPointerDown = (e) => {
      setFromClientX(e.clientX);
      try { e.target.setPointerCapture?.(e.pointerId); } catch(_) {}
    };
    const onPointerUp = (e) => {
      try { e.target.releasePointerCapture?.(e.pointerId); } catch(_) {}
    };
    const onTouchMove = (e) => {
      const t = e.touches && e.touches[0];
      if(t) setFromClientX(t.clientX);
    };

    area.addEventListener('pointermove', onPointerMove);
    area.addEventListener('pointerdown', onPointerDown);
    area.addEventListener('pointerup', onPointerUp);
    area.addEventListener('touchmove', onTouchMove, { passive: true });

    return ()=>{
      area.removeEventListener('pointermove', onPointerMove);
      area.removeEventListener('pointerdown', onPointerDown);
      area.removeEventListener('pointerup', onPointerUp);
      area.removeEventListener('touchmove', onTouchMove);
    };
  }, []); // run once

  // Optionally support keyboard like Shooter (move immediate using speed * dt)
  useEffect(()=>{
    const onKeyDown = (e) => { keys.current[e.code] = true; };
    const onKeyUp = (e) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return ()=>{ window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  // Game loop: física, spawn y render update
  useEffect(()=>{
    lastTime.current = performance.now();
    spawnTimer.current = 0;

    const playerSpeed = 420; // px/s similar feeling al shooter

    const loop = (now) => {
      const dt = Math.min((now - lastTime.current)/1000, 0.05);
      lastTime.current = now;

      const area = areaRef.current;
      if(area && running){
        const w = area.clientWidth;
        const h = area.clientHeight;

        // keyboard movement: aplica velocidad a playerPxRef (inmediato)
        let move = 0;
        if(keys.current['ArrowLeft'] || keys.current['KeyA']) move = -1;
        if(keys.current['ArrowRight'] || keys.current['KeyD']) move = 1;
        if(move !== 0){
          playerPxRef.current += move * playerSpeed * dt;
          playerPxRef.current = clamp(playerPxRef.current, PLAYER_W/2, w - PLAYER_W/2);
          setPlayerX(playerPxRef.current / w);
        } else {
          // si no hay teclado, mantenemos la fracción actual por seguridad (por ejemplo al iniciar)
          // si el playerPxRef no fue inicializado, setearlo centrándolo
          if(playerPxRef.current === 0) {
            playerPxRef.current = w * playerX;
            setPlayerX(playerPxRef.current / w);
          }
        }

        // spawn control
        spawnTimer.current += dt * 1000;
        if(spawnTimer.current >= SPAWN_INTERVAL){
          spawnTimer.current = 0;
          if(itemsRef.current.length < MAX_CONCURRENT){
            const it = trySpawnAt(area, 6);
            if(it) itemsRef.current.push(it);
          }
        }

        // update items
        const next = [];
        for(const it of itemsRef.current){
          const newY = it.y + it.vy * dt;
          const playerCenterX = playerPxRef.current || (playerX * w);
          const playerLeft = playerCenterX - PLAYER_W/2;
          const playerRight = playerCenterX + PLAYER_W/2;
          const playerTop = h - 12 - PLAYER_H;

          const itemLeft = it.x - it.size/2;
          const itemRight = it.x + it.size/2;
          const itemBottom = newY + it.size/2;

          // collision
          if(itemBottom >= playerTop && itemLeft < playerRight && itemRight > playerLeft){
            if(it.res.tipo === tacho){
              setScore(s => s + 10);
            } else {
              setLives(l => Math.max(0, l - 1));
              setScore(s => Math.max(0, s - 5));
            }
            continue;
          }

          // fell beyond
          if(newY > h + 120){
            if(it.res.tipo === tacho){
              setLives(l => Math.max(0, l - 1));
              setScore(s => Math.max(0, s - 5));
            }
            continue;
          }

          next.push({...it, y: newY});
        }

        itemsRef.current = next;
        setItemsState(next);
      }

      if(livesRef.current <= 0 && running) setRunning(false);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return ()=> { if(rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, tacho, lives, playerX]);

  // Click handler: teletransporta la posición del tacho (igual que shooter)
  useEffect(()=>{
    const area = areaRef.current;
    if(!area) return;
    const onClick = (e) => {
      const rect = area.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clamped = clamp(x, PLAYER_W/2, rect.width - PLAYER_W/2);
      playerPxRef.current = clamped;
      setPlayerX(clamped / rect.width);
    };
    area.addEventListener('click', onClick);
    return ()=> area.removeEventListener('click', onClick);
  }, []);

  const restart = ()=>{
    itemsRef.current = [];
    setItemsState([]);
    setScore(0);
    setLives(3);
    livesRef.current = 3;
    setTacho(randChoice(TACHOS));
    setRunning(true);
    // center player
    const area = areaRef.current;
    if(area){
      const center = area.clientWidth / 2;
      playerPxRef.current = center;
      setPlayerX(center / area.clientWidth);
    } else {
      setPlayerX(0.5);
    }
    lastTime.current = performance.now();
    spawnTimer.current = 0;
  };

  const changeTacho = ()=> setTacho(randChoice(TACHOS));

  return (
    <div className="tacho-game">
      <div className="hud">
        <div className="score">Puntaje: <strong>{score}</strong></div>
        <div className="small-muted">Tacho objetivo: <strong>{tacho}</strong></div>
        <div className="lives" aria-hidden>
          {Array.from({length:3}).map((_,i)=>(
            <span key={i} className={`heart ${i < lives ? 'full' : 'empty'}`} aria-label={i<lives ? 'vida' : 'sin vida'}>
              {i < lives ? '❤' : '♡'}
            </span>
          ))}
        </div>
      </div>

      <div className="canvas-area" ref={areaRef} role="application" aria-label="Área del juego">
        {itemsState.map(it=>(
          <div key={it.uid} className="fall-item" style={{left: it.x - it.size/2, top: it.y, width: it.size, height: it.size}}>
            <img src={it.res.icon} alt={it.res.nombre} draggable="false" />
          </div>
        ))}

        <div className="tacho" style={{left: `calc(${playerX*100}% - ${PLAYER_W/2}px)`}}>
          <img src={jugador} alt="tacho" className="tacho-img" draggable="false" />
          <div className="tacho-label">{tacho}</div>
        </div>

        {!running && (
          <div className="message">
            <h4>Game Over</h4>
            <p>Puntaje final: <strong>{score}</strong></p>
            <div className="message-actions">
              <button className="btn" onClick={restart}>Reintentar</button>
              <button className="btn btn-alt" onClick={changeTacho}>Cambiar tacho</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
