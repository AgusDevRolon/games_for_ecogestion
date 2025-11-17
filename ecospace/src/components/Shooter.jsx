// src/components/Shooter.jsx
import React, { useEffect, useRef, useState } from 'react';
import shipImg from '../assets/ship.png';
import enemyBotella from '../assets/enemy_botella.png';
import enemyJeringa from '../assets/enemy_jeringa.png';
import enemyLata from '../assets/enemy_lata.png';
import enemyPila from '../assets/enemy_pila.png';
import bgImg from '../assets/bg_space.jpeg';

/*
  ECOspace - Space Invaders (React, canvas)
  - Mover: ← → / A D
  - Disparar: Space (solo)
  - Reiniciar: R
  - Pausa: P / Escape
  - Descripción y controles en pantalla inicial
  - Puntos por enemigo -> mostrados en HUD y pantalla Game Over
*/

const RES = [
  { id: 1, label: 'Botella', tipo: 'Reciclable', src: enemyBotella },
  { id: 2, label: 'Jeringa', tipo: 'Peligroso', src: enemyJeringa },
  { id: 3, label: 'Lata', tipo: 'Reciclable', src: enemyLata },
  { id: 4, label: 'Pila', tipo: 'Peligroso', src: enemyPila },
];

export default function Shooter() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  // UI state
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showMenu, setShowMenu] = useState(true);

  // Input
  const keys = useRef({});

  // Player (ref for performance)
  const player = useRef({
    x: 300,
    y: 540,
    w: 56,
    h: 32,
    speed: 360, // px/s
    cooldown: 0,
    shotCooldownMs: 240,
  });

  // Dynamic objects stored in refs (no state updates every frame)
  const bullets = useRef([]); // {x,y,vy,w,h}
  const enemies = useRef([]); // {x,y,w,h,alive,typeIdx}
  const explosions = useRef([]);

  // Enemy formation config (space invaders)
  const cfg = useRef({
    cols: 8,
    rows: 4,
    ew: 48,
    eh: 36,
    gapX: 14,
    gapY: 14,
    startX: 36,
    startY: 48,
    dir: 1, // 1 -> right, -1 -> left
    baseSpeed: 24, // px/s
    speedMult: 1,
    drop: 18,
  });

  const ENEMY_BOTTOM_LIMIT = 500; // if enemy.y + eh >= this -> game over
  const BULLET_SPEED = -520; // px/s
  const POINTS_PER_ENEMY = 50;

  // Preload images to draw in canvas
  const images = useRef({});
  useEffect(() => {
    const load = (src) => {
      const i = new Image();
      i.src = src;
      return i;
    };
    images.current.player = load(shipImg);
    images.current.bg = load(bgImg);
    images.current.res = [
      load(enemyBotella),
      load(enemyJeringa),
      load(enemyLata),
      load(enemyPila),
    ];
    // no dependency - run once
  }, []);

  // Helper: spawn formation of enemies
  function spawnEnemyFormation() {
    const arr = [];
    const c = cfg.current;
    for (let r = 0; r < c.rows; r++) {
      for (let col = 0; col < c.cols; col++) {
        const typeIdx = (r + col) % RES.length; // simple distribution
        const x = c.startX + col * (c.ew + c.gapX);
        const y = c.startY + r * (c.eh + c.gapY);
        arr.push({
          x,
          y,
          w: c.ew,
          h: c.eh,
          alive: true,
          typeIdx,
        });
      }
    }
    enemies.current = arr;
    c.dir = 1;
    c.speedMult = 1.0;
  }

  // Start game
  function startGame() {
    bullets.current = [];
    enemies.current = [];
    explosions.current = [];
    spawnEnemyFormation();
    player.current.x = 300;
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setRunning(true);
    setShowMenu(false);
    lastTimeRef.current = performance.now();
  }

  // Finish game
  function finishGame() {
    setGameOver(true);
    setRunning(false);
    setPaused(false);
  }

  // Restart (from gameover or menu)
  function restartGame() {
    startGame();
  }

  // Attempt to shoot (respect cooldown); returns true if shot created
  function attemptShoot(now) {
    const p = player.current;
    if (now - p.cooldown < p.shotCooldownMs) return false;
    p.cooldown = now;
    bullets.current.push({
      x: p.x,
      y: p.y - p.h / 2 - 6,
      w: 6,
      h: 12,
      vy: BULLET_SPEED,
    });
    return true;
  }

  // Rect intersection util
  function rectsIntersect(a, b) {
    return !(
      a.x + a.w < b.x ||
      a.x > b.x + b.w ||
      a.y + a.h < b.y ||
      a.y > b.y + b.h
    );
  }

  // Main update loop
  function update(dt) {
    if (!running || paused || gameOver) return;
    const now = performance.now();
    const p = player.current;
    // Movement input
    let move = 0;
    if (keys.current.ArrowLeft || keys.current.KeyA) move = -1;
    if (keys.current.ArrowRight || keys.current.KeyD) move = 1;
    p.x += move * p.speed * dt;

    // Clamp player to canvas width (we'll compute width in render via canvas logical size)
    const canvas = canvasRef.current;
    const W = canvas ? canvas.width / (window.devicePixelRatio || 1) : 600;
    const margin = p.w / 2 + 8;
    p.x = Math.max(Math.min(p.x, W - margin), margin);

    // Bullets move
    for (let i = bullets.current.length - 1; i >= 0; i--) {
      const b = bullets.current[i];
      b.y += b.vy * dt;
      // remove off-screen
      if (b.y + b.h < -20) bullets.current.splice(i, 1);
    }

    const c = cfg.current;

    // Enemies: compute alive set
    const alive = enemies.current.filter((e) => e.alive);
    if (alive.length === 0) {
      // Next wave: respawn and increase speed
      spawnEnemyFormation();
      c.speedMult = Math.min(c.speedMult + 0.18, 4.0);
      return;
    }

    // span
    let minX = Infinity;
    let maxX = -Infinity;
    for (const e of alive) {
      minX = Math.min(minX, e.x);
      maxX = Math.max(maxX, e.x + e.w);
    }

    // move horizontally
    const hspeed = c.baseSpeed * c.speedMult * c.dir * dt;
    for (const e of alive) e.x += hspeed;

    // if hits edges -> flip and drop
    const marginLeft = 8;
    const marginRight = W - 8;
    if (minX <= marginLeft && c.dir < 0) {
      c.dir = 1;
      for (const e of alive) e.y += c.drop;
    } else if (maxX >= marginRight && c.dir > 0) {
      c.dir = -1;
      for (const e of alive) e.y += c.drop;
    }

    // Collisions: bullets vs enemies
    for (let i = bullets.current.length - 1; i >= 0; i--) {
      const b = bullets.current[i];
      const brect = { x: b.x - b.w / 2, y: b.y - b.h / 2, w: b.w, h: b.h };
      for (let j = 0; j < enemies.current.length; j++) {
        const en = enemies.current[j];
        if (!en.alive) continue;
        const erect = { x: en.x, y: en.y, w: en.w, h: en.h };
        if (rectsIntersect(brect, erect)) {
          en.alive = false;
          bullets.current.splice(i, 1);
          // small explosion effect
          explosions.current.push({ x: en.x + en.w / 2, y: en.y + en.h / 2, t: 0 });
          // scoring (you can vary by type if you want)
          setScore((s) => s + POINTS_PER_ENEMY);
          // speed up slightly
          c.speedMult = Math.min(c.speedMult + 0.02, 4.0);
          break;
        }
      }
    }

    // Update explosions timers
    for (let i = explosions.current.length - 1; i >= 0; i--) {
      const ex = explosions.current[i];
      ex.t += dt;
      if (ex.t > 0.6) explosions.current.splice(i, 1);
    }

    // Check bottom (game over)
    for (const e of enemies.current) {
      if (e.alive && e.y + e.h >= ENEMY_BOTTOM_LIMIT) {
        finishGame();
        return;
      }
    }
  }

  // Render onto canvas
  function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    // clear
    ctx.clearRect(0, 0, W, H);

    // draw background (stretched)
    if (images.current.bg && images.current.bg.complete) {
      ctx.drawImage(images.current.bg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#071426';
      ctx.fillRect(0, 0, W, H);
    }

    // small star overlay (subtle)
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 73) % W;
      const sy = ((i * 37) % H);
      ctx.fillRect(sx, sy, 1, 1);
    }

    // HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(`Puntaje: ${score}`, 12, 22);
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(W / 2 - 120, H / 2 - 30, 240, 60);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSADO', W / 2, H / 2 + 6);
      ctx.textAlign = 'start';
    }

    // draw player
    const p = player.current;
    ctx.save();
    ctx.translate(p.x, p.y);
    if (images.current.player && images.current.player.complete) {
      ctx.drawImage(images.current.player, -p.w / 2, -p.h / 2, p.w, p.h);
    } else {
      ctx.fillStyle = '#7be495';
      ctx.beginPath();
      ctx.moveTo(-p.w / 2, p.h / 2);
      ctx.lineTo(0, -p.h / 2);
      ctx.lineTo(p.w / 2, p.h / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // draw bullets
    ctx.fillStyle = '#fff';
    for (const b of bullets.current) {
      ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    }

    // draw enemies
    for (const en of enemies.current) {
      if (!en.alive) continue;
      const img = images.current.res[en.typeIdx];
      if (img && img.complete) {
        ctx.drawImage(img, en.x, en.y, en.w, en.h);
      } else {
        ctx.fillStyle = '#f29b5b';
        ctx.fillRect(en.x, en.y, en.w, en.h);
      }
    }

    // draw explosions
    for (const ex of explosions.current) {
      const t = ex.t;
      const r = 8 + t * 20;
      const alpha = Math.max(0, 1 - t / 0.6);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,165,70,${alpha})`;
      ctx.arc(ex.x, ex.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // overlay menu or gameover if needed (canvas overlay)
    if (!running && showMenu) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(W / 2 - 220, H / 2 - 120, 440, 240);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '20px monospace';
      ctx.fillText('ECOspace', W / 2, H / 2 - 80);
      ctx.font = '14px monospace';
      ctx.fillText('Defiende la base: elimina a los contaminantes antes de que lleguen abajo', W / 2, H / 2 - 46);
      ctx.fillText('Controles: ← → / A D - mover  •  SPACE - disparar  •  P/Escape - pausar  •  R - reiniciar', W / 2, H / 2 - 20);
      ctx.fillText('Pulsa "Iniciar partida" en el menú (o tecla R) para comenzar', W / 2, H / 2 + 6);
      ctx.textAlign = 'start';
    }

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '28px monospace';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
      ctx.font = '18px monospace';
      ctx.fillText(`Puntaje final: ${score}`, W / 2, H / 2 + 14);
      ctx.textAlign = 'start';
    }
  }

  // RAF loop + devicePixelRatio handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const cssW = 600;
      const cssH = 600;
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function loop(now) {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;
      update(dt);
      render();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, paused, gameOver, score, showMenu]);

  // Input listeners (keyboard)
  useEffect(() => {
    function down(e) {
      const code = e.code;
      // movement keys by code
      if (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'KeyA' || code === 'KeyD') {
        keys.current[code] = true;
      } else if (code === 'Space') {
        e.preventDefault();
        if (running && !paused && !gameOver) attemptShoot(performance.now());
      } else if (code === 'KeyP' || code === 'Escape') {
        if (running && !gameOver) setPaused((p) => !p);
      } else if (code === 'KeyR') {
        restartGame();
      }
    }

    function up(e) {
      const code = e.code;
      if (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'KeyA' || code === 'KeyD') {
        keys.current[code] = false;
      }
    }

    window.addEventListener('keydown', down, { passive: false });
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, paused, gameOver]);

  // Optional: click on canvas to move player to that x (keeps UX from original)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const x = (e.clientX - rect.left) * (canvas.width / rect.width) / dpr;
      player.current.x = x;
    }
    canvas.addEventListener('click', onClick);
    return () => canvas.removeEventListener('click', onClick);
  }, []);

  // Component UI & controls (no on-screen Disparar button)
  return (
    <div style={{ textAlign: 'center', color: '#fff', fontFamily: 'Inter, Roboto, sans-serif', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>Score: <strong>{score}</strong></div>
        <div style={{ opacity: 0.9, fontSize: 13 }}>
          {running ? (paused ? 'PAUSADO' : 'En juego') : showMenu ? 'Menú' : gameOver ? 'Game Over' : ''}
        </div>
      </div>

      {/* Menu and controls are outside canvas for accessibility */}
      {!running && showMenu && (
        <div style={{ maxWidth: 760, margin: '0 auto 10px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 6 }}>
          <h2 style={{ margin: 6 }}>ECOspace</h2>
          <p style={{ margin: '6px 0' }}><strong>Descripción:</strong> Defiende tu base espacial eliminando contaminantes antes de que lleguen abajo. Enemigos bajan en formación al estilo Space Invaders. Gana puntos al destruirlos.</p>
          <p style={{ margin: '6px 0' }}>
            <strong>Controles:</strong><br />
            ← / → o A / D — mover<br />
            SPACE — disparar (ya no hay botón en pantalla)<br />
            P o ESC — pausar / reanudar<br />
            R — reiniciar
          </p>

          <div style={{ marginTop: 8 }}>
            <button onClick={startGame} style={{ padding: '8px 14px', cursor: 'pointer' }}>Iniciar partida</button>
            <button onClick={() => { setShowMenu(false); setRunning(false); }} style={{ marginLeft: 8, padding: '8px 14px' }}>Cerrar menú</button>
          </div>
        </div>
      )}

      {gameOver && (
        <div style={{ marginBottom: 12 }}>
          <h3>GAME OVER</h3>
          <p>Puntaje final: <strong>{score}</strong></p>
          <div>
            <button onClick={restartGame} style={{ padding: '8px 14px', marginRight: 8 }}>Reiniciar</button>
            <button onClick={() => { setShowMenu(true); setGameOver(false); setRunning(false); }} style={{ padding: '8px 14px' }}>Volver al menú</button>
          </div>
        </div>
      )}

      <div style={{ display: 'inline-block', borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.08)' }}>
        <canvas ref={canvasRef} style={{ width: 600, height: 600, background: 'black', display: 'block' }} />
      </div>

      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
        Mover: flechas / A D. Click en canvas para mover la nave. Disparar: <b>SPACE</b>. (Botón de disparo eliminado — sólo teclado.)
      </div>
    </div>
  );
}
