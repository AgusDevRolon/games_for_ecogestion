import React, { useEffect, useRef, useState } from "react";

/* Assets: conserva tus rutas en src/assets/ */
import iconBanana from "./assets/cascara-de-platano.png";
import iconGlass from "./assets/botella-de-vidrio.png";
import iconPlastic from "./assets/botella-de-plastico.png";
import iconCarton from "./assets/carton.png";
import iconSnack from "./assets/envoltorio-de-snacks.png";
import iconOil from "./assets/aceite-de-cocina.png";
import iconBattery from "./assets/baterias.png";
import iconSyringe from "./assets/jeringa.png";
import iconCan from "./assets/lata-de-aluminio.png";

import binOrganico from "./assets/papelera-de-reciclaje-organico.png";
import binVidrio from "./assets/papelera-de-reciclaje-vidrio.png";
import binPlastMetal from "./assets/papelera-de-reciclaje-plastico-metal.png";
import binNoRec from "./assets/papelera-de-reciclaje-no-reciclable.png";
import binDanger from "./assets/papelera-de-reciclaje-peligroso.png";
import conveyorImg from "./assets/conveyor-belt.png";

const ITEM_TYPES = {
  ORGANICO: "organico",
  VIDRIO: "vidrio",
  PLASTICO_METAL: "plastico_metal",
  NO_RECICLABLE: "no_reciclable",
  PELIGROSO: "peligroso",
};

const ITEM_LIBRARY = [
  { id: "banana", img: iconBanana, type: ITEM_TYPES.ORGANICO, label: "Cáscara" },
  { id: "glass", img: iconGlass, type: ITEM_TYPES.VIDRIO, label: "Botella de vidrio" },
  { id: "plastic", img: iconPlastic, type: ITEM_TYPES.PLASTICO_METAL, label: "Botella plástico" },
  { id: "carton", img: iconCarton, type: ITEM_TYPES.PLASTICO_METAL, label: "Cartón" },
  { id: "snack", img: iconSnack, type: ITEM_TYPES.NO_RECICLABLE, label: "Envoltorio" },
  { id: "oil", img: iconOil, type: ITEM_TYPES.PELIGROSO, label: "Aceite" },
  { id: "battery", img: iconBattery, type: ITEM_TYPES.PELIGROSO, label: "Batería" },
  { id: "syringe", img: iconSyringe, type: ITEM_TYPES.PELIGROSO, label: "Jeringa" },
  { id: "can", img: iconCan, type: ITEM_TYPES.PLASTICO_METAL, label: "Lata" },
];

const BINS = [
  { key: ITEM_TYPES.ORGANICO, img: binOrganico, name: "Orgánico", keyLabel: "1 / Q" },
  { key: ITEM_TYPES.VIDRIO, img: binVidrio, name: "Vidrio", keyLabel: "2 / W" },
  { key: ITEM_TYPES.PLASTICO_METAL, img: binPlastMetal, name: "Plástico/Metal", keyLabel: "3 / E" },
  { key: ITEM_TYPES.NO_RECICLABLE, img: binNoRec, name: "No reciclable", keyLabel: "4 / R" },
  { key: ITEM_TYPES.PELIGROSO, img: binDanger, name: "Peligroso", keyLabel: "5 / T" },
];

function getRandomItem() {
  const idx = Math.floor(Math.random() * ITEM_LIBRARY.length);
  return ITEM_LIBRARY[idx];
}
function acceptedItemsFor(type) {
  return ITEM_LIBRARY.filter(i => i.type === type);
}

export default function Conveyor() {
  const rafRef = useRef(null);
  const spawnIntervalRef = useRef(null);
  const removedUidsRef = useRef(new Set());

  // Estado visible
  const [items, setItems] = useState([]); // 0 o 1 item
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // Velocidad y temporizador (valores conservadores)
  const baseSpeed = 0.045;
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const speedMultiplierRef = useRef(speedMultiplier);
  const maxMultiplier = 1.3;
  const speedIncreaseEverySec = 15;
  const speedStep = 0.06;
  const spawnDelayMs = 700;

  // countdown visible
  const [countdown, setCountdown] = useState(speedIncreaseEverySec);
  const countdownRef = useRef(countdown);

  // refs para lectura estable
  const runningRef = useRef(running);
  const itemsRef = useRef(items);
  const gameOverRef = useRef(gameOver);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { speedMultiplierRef.current = speedMultiplier; }, [speedMultiplier]);
  useEffect(() => { countdownRef.current = countdown; }, [countdown]);

  // --- Spawn robusto: interval único que checa si hay que spawnear
  useEffect(() => {
    spawnIntervalRef.current = setInterval(() => {
      if (!runningRef.current || gameOverRef.current) return;
      // solo spawn si no hay items físicamente en pantalla
      if (itemsRef.current.length === 0) {
        // spawn con pequeño delay para evitar spawns instantáneos múltiples
        setTimeout(() => {
          if (!runningRef.current || gameOverRef.current) return;
          if (itemsRef.current.length === 0) {
            const base = getRandomItem();
            const entry = {
              uid: Math.random().toString(36).slice(2, 9),
              img: base.img,
              type: base.type,
              label: base.label,
              t: 0,
              scale: 0.72 + Math.random() * 0.45,
            };
            setItems(prev => [...prev, entry]);
          }
        }, spawnDelayMs);
      }
    }, 300);
    return () => clearInterval(spawnIntervalRef.current);
  }, []);

  // --- Countdown y aumento de velocidad (se asegura aplicar la nueva velocidad inmediatamente)
  useEffect(() => {
    const tick = () => {
      if (!runningRef.current || gameOverRef.current) return;
      setCountdown(sec => {
        if (sec <= 1) {
          // Aumentar multiplicador (y actualizar su ref para que el loop lo lea inmediatamente)
          setSpeedMultiplier(prev => {
            const next = Math.min(maxMultiplier, +(prev + speedStep).toFixed(3));
            speedMultiplierRef.current = next;
            return next;
          });
          return speedIncreaseEverySec;
        }
        return sec - 1;
      });
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Loop de animación: lee velocidad desde speedMultiplierRef para evitar des-sincronía
  useEffect(() => {
    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (runningRef.current && !gameOverRef.current) {
        setItems(prev => {
          let missed = 0;
          const speedPerSec = baseSpeed * speedMultiplierRef.current; // <- usa ref
          const moved = prev
            .map(it => ({ ...it, t: it.t + speedPerSec * dt }))
            .filter(it => {
              if (removedUidsRef.current.has(it.uid)) return false;
              if (it.t >= 1.02) {
                missed++;
                return false;
              }
              return true;
            });
          if (missed > 0) {
            // penaliza 1 vida por missed
            setLives(l => {
              const nl = Math.max(0, l - missed);
              if (nl === 0) {
                setGameOver(true);
                setRunning(false);
              }
              return nl;
            });
            setScore(s => Math.max(0, s - 5 * missed));
          }
          return moved;
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []); // se registra una sola vez

  // Toasters
  const [toasts, setToasts] = useState([]);
  function pushToast(text, kind = "info") {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts(prev => [...prev, { id, text, kind }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 900);
  }

  // --- Handle drop: ahora permite desechar en cualquier momento.
  // Si hay un residuo en pantalla, procesa ese residuo (único).
  function handleDrop(binKey) {
    const current = itemsRef.current.slice();
    if (current.length === 0) {
      // tecla al aire
      setScore(s => Math.max(0, s - 1));
      pushToast("-1", "bad");
      return;
    }

    // En esta versión solo hay 0 o 1 item, así que tomamos el primero.
    // Si por alguna razón hubieran más, usamos el más cercano al centro.
    let target = current[0];
    if (current.length > 1) {
      const CENTER = 0.77;
      target = current.reduce((best, it) => {
        const db = Math.abs(best.t - CENTER);
        const di = Math.abs(it.t - CENTER);
        return di < db ? it : best;
      }, current[0]);
    }

    // marcar como removido inmediatamente para evitar que el loop lo cuente como missed
    removedUidsRef.current.add(target.uid);

    // eliminar y aplicar efectos
    setItems(prev => prev.filter(it => it.uid !== target.uid));
    if (target.type === binKey) {
      setScore(s => s + 10);
      pushToast("+10", "ok");
    } else {
      setScore(s => Math.max(0, s - 5));
      setLives(l => {
        const nl = Math.max(0, l - 1);
        if (nl === 0) {
          setGameOver(true);
          setRunning(false);
        }
        return nl;
      });
      pushToast("-5", "bad");
    }

    // limpiar removed set tras delay para permitir animaciones si las agregás
    setTimeout(() => removedUidsRef.current.delete(target.uid), 700);
  }

  // Teclado: registrado 1 vez (capture:true para mayor robustez)
  useEffect(() => {
    function onKey(e) {
      if (gameOverRef.current && e.key === "Escape") { doReset(); return; }
      if (e.code === "Space") { e.preventDefault(); setRunning(r => { const nr = !r; runningRef.current = nr; return nr; }); return; }
      if (e.key === "Escape") { doReset(); return; }
      const digitMap = {
        Digit1: ITEM_TYPES.ORGANICO,
        Digit2: ITEM_TYPES.VIDRIO,
        Digit3: ITEM_TYPES.PLASTICO_METAL,
        Digit4: ITEM_TYPES.NO_RECICLABLE,
        Digit5: ITEM_TYPES.PELIGROSO,
      };
      if (digitMap[e.code]) { handleDrop(digitMap[e.code]); return; }
      const letterMap = { q: ITEM_TYPES.ORGANICO, w: ITEM_TYPES.VIDRIO, e: ITEM_TYPES.PLASTICO_METAL, r: ITEM_TYPES.NO_RECICLABLE, t: ITEM_TYPES.PELIGROSO };
      const lk = e.key.toLowerCase();
      if (letterMap[lk]) { handleDrop(letterMap[lk]); return; }
    }
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, []);

  function doReset() {
    removedUidsRef.current.clear();
    setItems([]);
    setScore(0);
    setLives(3);
    setSpeedMultiplier(1.0);
    speedMultiplierRef.current = 1.0;
    setCountdown(speedIncreaseEverySec);
    setCountdown(speedIncreaseEverySec);
    setGameOver(false);
    setRunning(true);
    setToasts([{ id: "reset", text: "Reiniciado", kind: "info" }]);
    setTimeout(() => setToasts([]), 900);
  }

  // vidas como corazones
  function renderLives() {
    const arr = [];
    for (let i = 0; i < 3; i++) arr.push(<span key={i} style={{ opacity: i < lives ? 1 : 0.24, marginRight: 6 }}>❤️</span>);
    return arr;
  }

  // UI
  return (
    <div className="game card">
      <div className="hud" style={{ alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="score">Puntaje: <strong>{score}</strong></div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Vidas: {renderLives()}</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>
            Velocidad: <strong>{speedMultiplier.toFixed(2)}x</strong>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Siguiente aumento: <strong>{countdown}s</strong></div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn small" onClick={() => { setRunning(r => { const nr = !r; runningRef.current = nr; return nr; }); }}>{running ? "Pausar" : "Reanudar"}</button>
          <button className="btn small muted" onClick={doReset}>Reiniciar (Esc)</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <div className="play-area" style={{ position: "relative" }}>
            <div className="conveyor-layer"><img src={conveyorImg} alt="cinta" className="conveyor-img" /></div>

            {items.map(it => {
              const left = 6 + it.t * 80;
              const bottom = 28 + Math.sin(it.t * Math.PI * 2) * 3;
              const transform = `translate(-50%, 0) scale(${it.scale})`;
              const inZone = it.t >= 0.62 && it.t <= 0.92;
              return (
                <div key={it.uid} className="item" title={it.label} style={{
                  left: `${left}%`,
                  bottom: `${bottom}%`,
                  transform,
                  opacity: it.t > 0.98 ? 0.85 : 1,
                  transition: "transform 100ms linear",
                  pointerEvents: "none",
                  filter: inZone ? "drop-shadow(0 10px 24px rgba(80,200,120,0.12))" : undefined,
                }}>
                  <img src={it.img} alt={it.label} onError={(e)=> e.currentTarget.style.display='none'} />
                </div>
              );
            })}

            <div style={{
              position: "absolute",
              left: "6% ",
              width: "80%",
              bottom: "8%",
              height: "36%",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{
                width: "48%",
                height: "92%",
                borderRadius: 10,
                border: "2px dashed rgba(100,116,139,0.06)",
                background: "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0))"
              }} />
            </div>
          </div>

          <div className="bins" style={{ marginTop: 10 }}>
            {BINS.map(bin => (
              <div key={bin.key} className="bin">
                <button className="bin-btn" onClick={() => handleDrop(bin.key)} title={`Depositar en ${bin.name} (${bin.keyLabel})`}>
                  <img src={bin.img} alt={bin.name} />
                </button>
                <div className="bin-label">
                  <strong>{bin.name}</strong>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{bin.keyLabel}</div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8 }}>
                    {acceptedItemsFor(bin.key).map(a => (
                      <img key={a.id} src={a.img} alt={a.label} title={a.label} style={{ width: 28, height: 28, objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.06))" }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside style={{ width: 300 }}>
          <div className="card" style={{ padding: 12, marginBottom: 10 }}>
            <h3 style={{ margin: "0 0 6px 0" }}>Cómo jugar</h3>
            <p style={{ margin: 0, color: "#475569", fontSize: 14 }}>
              Ahora podés desechar el residuo en cualquier momento con <strong>1-5</strong> o <strong>Q W E R T</strong>. Pausa: <strong>Space</strong>. Reinicia: <strong>Esc</strong>.
            </p>
            <hr style={{ margin: "10px 0" }} />
            <p style={{ margin: 0, color: "#475569", fontSize: 14 }}>
              +10 acierto, -5 error, -1 tecla al aire. 3 vidas. Se resta 1 vida si un residuo pasa sin clasificar.
            </p>
            <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
              Solo aparece 1 residuo a la vez. Velocidad aumenta cada {speedIncreaseEverySec}s. Próximo aumento en: <strong>{countdown}s</strong>.
            </div>
          </div>

          <div className="card" style={{ padding: 12 }}>
            <h4 style={{ margin: "0 0 6px 0" }}>Controles</h4>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#475569" }}>
              <li><strong>1 / Q</strong> — Orgánico</li>
              <li><strong>2 / W</strong> — Vidrio</li>
              <li><strong>3 / E</strong> — Plástico / Metal</li>
              <li><strong>4 / R</strong> — No reciclable</li>
              <li><strong>5 / T</strong> — Peligroso</li>
            </ul>
          </div>
        </aside>
      </div>

      {toasts.map((t, i) => (
        <div key={t.id} className={`toast ${t.kind}`} style={{ position: "fixed", right: 22, bottom: 22 + i * 56 }}>
          {t.text}
        </div>
      ))}

      {gameOver && (
        <div style={{
          position: "fixed", left: 0, right: 0, top: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(180deg, rgba(10,10,16,0.25), rgba(10,10,16,0.45))",
          zIndex: 60
        }}>
          <div className="card" style={{ padding: 24, textAlign: "center", width: 380 }}>
            <h2 style={{ margin: 0 }}>¡Game Over!</h2>
            <p style={{ marginTop: 8 }}>Tu puntaje: <strong>{score}</strong></p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
              <button className="btn" onClick={doReset}>Jugar de nuevo</button>
              <button className="btn muted" onClick={() => { setGameOver(false); setRunning(false); }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // function doReset placed after return for readability
  function doReset() {
    removedUidsRef.current.clear();
    setItems([]);
    setScore(0);
    setLives(3);
    setSpeedMultiplier(1.0);
    speedMultiplierRef.current = 1.0;
    setCountdown(speedIncreaseEverySec);
    setGameOver(false);
    setRunning(true);
    setToasts([{ id: "reset", text: "Reiniciado", kind: "info" }]);
    setTimeout(() => setToasts([]), 900);
  }
}
