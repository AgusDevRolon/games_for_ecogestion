import React, { useEffect, useRef, useState } from "react";

// Assets — asegúrate de que las rutas existan
import iconBanana from "../assets/cascara-de-platano.png";
import iconGlass from "../assets/botella-de-vidrio.png";
import iconPlastic from "../assets/botella-de-plastico.png";
import iconCan from "../assets/lata-de-aluminio.png";
import iconBattery from "../assets/baterias.png";
import iconOil from "../assets/aceite-de-cocina.png";
import iconBox from "../assets/carton.png";
import iconSyringe from "../assets/jeringa.png";
import iconChip from "../assets/envoltorio-de-snacks.png";

import binOrg from "../assets/papelera-de-reciclaje-organico.png";
import binPlastic from "../assets/papelera-de-reciclaje-plastico-metal.png";
import binGlass from "../assets/papelera-de-reciclaje-vidrio.png";
import binPaper from "../assets/papelera-de-reciclaje-carton.png";
import binMetal from "../assets/papelera-de-reciclaje-plastico-metal.png";
import binHazard from "../assets/papelera-de-reciclaje-peligroso.png";
import binRest from "../assets/papelera-de-reciclaje-no-reciclable.png";

/*
  Mejora del ClasificadorArrastrable:
  - Drag & drop tradicional
  - Soporte táctil / click-to-select (tocar elemento y tocar tacho)
  - Feedback visual (clases .tacho-correct / .tacho-wrong)
  - Mensajes flotantes y resumen final
  - Evita re-colocar una tarjeta ya ubicada
  - Limpieza de timeouts
*/

const TODOS = [
  { id: 1, nombre: "Cáscara de banana", tipo: "Orgánico", descripcion: "Los restos orgánicos se descomponen y sirven para compost.", icon: iconBanana },
  { id: 2, nombre: "Botella de vidrio", tipo: "Vidrio", descripcion: "El vidrio se recicla y se deposita en el contenedor verde.", icon: iconGlass },
  { id: 3, nombre: "Botella plástica (PET)", tipo: "Plástico", descripcion: "Las botellas PET van al contenedor de envases.", icon: iconPlastic },
  { id: 4, nombre: "Lata de aluminio", tipo: "Metal", descripcion: "Las latas se reciclan y recuperan metales.", icon: iconCan },
  { id: 5, nombre: "Pila usada", tipo: "Peligroso", descripcion: "Las pilas contienen metales tóxicos y van al punto limpio.", icon: iconBattery },
  { id: 6, nombre: "Aceite de cocina usado", tipo: "Peligroso", descripcion: "El aceite contamina y debe entregarse en puntos limpios.", icon: iconOil },
  { id: 7, nombre: "Cartón limpio", tipo: "PapelCarton", descripcion: "El cartón limpio se recicla en el contenedor azul.", icon: iconBox },
  { id: 8, nombre: "Jeringa", tipo: "Peligroso", descripcion: "Residuos sanitarios requieren gestión especial.", icon: iconSyringe },
  { id: 9, nombre: "Envoltorio de snack", tipo: "Resto", descripcion: "Plásticos mezclados no reciclables van al contenedor de Resto.", icon: iconChip }
];

const TACHOS = [
  { key: "Orgánico", label: "Orgánico", hint: "Residuos biodegradables", icon: binOrg },
  { key: "Plástico", label: "Plástico", hint: "Envases de plástico", icon: binPlastic },
  { key: "Vidrio", label: "Vidrio", hint: "Botellas y frascos", icon: binGlass },
  { key: "PapelCarton", label: "Papel & Cartón", hint: "Papeles y cartones", icon: binPaper },
  { key: "Metal", label: "Metal", hint: "Latas y envases metálicos", icon: binMetal },
  { key: "Peligroso", label: "Peligrosos", hint: "Pilas, aceites, jeringas", icon: binHazard },
  { key: "Resto", label: "Resto", hint: "No reciclable / rechazo", icon: binRest }
];

export default function ClasificadorArrastrable() {
  const [items, setItems] = useState([]);
  const [placements, setPlacements] = useState({}); // { id: tachoKey }
  const [tachoFeedback, setTachoFeedback] = useState({}); // { tachoKey: 'correct'|'wrong' }
  const [mensaje, setMensaje] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [score, setScore] = useState(0);

  // Para soporte táctil: seleccionar elemento y luego tacho
  const [selectedId, setSelectedId] = useState(null);

  // timeouts ref para limpiar
  const feedbackTimeouts = useRef({});
  const messageTimeoutRef = useRef(null);

  // Inicializar juego
  const initializeGame = () => {
    const shuffled = [...TODOS].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setPlacements({});
    setTachoFeedback({});
    setMensaje(null);
    setDraggingId(null);
    setSelectedId(null);
    setScore(0);

    // limpiar timeouts previos
    Object.values(feedbackTimeouts.current).forEach((t) => clearTimeout(t));
    feedbackTimeouts.current = {};
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = null;
  };

  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler drag start (desktop)
  const handleDragStart = (e, id) => {
    try {
      e.dataTransfer.setData("text/plain", String(id));
      e.dataTransfer.effectAllowed = "move";
    } catch (err) {
      // algunos navegadores en móviles no permiten dataTransfer: fallback con state
    }
    setDraggingId(id);
    setSelectedId(id); // también marca seleccionado
  };
  const handleDragEnd = () => {
    setDraggingId(null);
  };
  const allowDrop = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Drop en tacho (desktop)
  const handleDrop = (e, tachoKey) => {
    e.preventDefault();
    // Leer id: si no está en dataTransfer (móvil), usar selectedId
    const idStr = e.dataTransfer?.getData("text/plain");
    const id = idStr ? Number(idStr) : selectedId;
    if (!id) return;
    processPlacement(id, tachoKey);
    setDraggingId(null);
    setSelectedId(null);
  };

  // Click / touch: seleccionar tarjeta
  const handleSelectItem = (id) => {
    // si ya está colocado, no puede seleccionarse
    if (placements[id]) return;
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // Click on bin for touch users: si hay selectedId, colocar
  const handleBinClick = (tachoKey) => {
    if (!selectedId) return;
    processPlacement(selectedId, tachoKey);
    setSelectedId(null);
  };

  // lógica de colocar y comprobar
  const processPlacement = (id, tachoKey) => {
    // evitar recolocar un id ya colocado (raro pero seguro)
    if (placements[id]) return;

    const item = items.find((it) => it.id === Number(id));
    if (!item) return;

    const correcto = item.tipo === tachoKey;

    // guardar colocación (inmutable)
    setPlacements((prev) => ({ ...prev, [id]: tachoKey }));

    // puntaje (solo sumar una vez)
    if (correcto) setScore((s) => s + 1);

    // feedback en tacho
    setTachoFeedback((prev) => ({ ...prev, [tachoKey]: correcto ? "correct" : "wrong" }));

    // mensaje explicativo
    const tLabel = TACHOS.find((t) => t.key === tachoKey)?.label ?? tachoKey;
    const titulo = correcto ? "✅ ¡Correcto!" : "❌ ¡Incorrecto!";
    const texto = correcto
      ? `${item.nombre} va en ${tLabel}. ${item.descripcion}`
      : `${item.nombre} NO va en ${tLabel}. Corresponde a ${item.tipo}.`;

    setMensaje({ titulo, texto, tipo: correcto ? "success" : "danger" });

    // limpiar mensaje en 3s
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => setMensaje(null), 3000);

    // limpiar feedback en 2.5s y evitar duplicados de timeout
    if (feedbackTimeouts.current[tachoKey]) {
      clearTimeout(feedbackTimeouts.current[tachoKey]);
    }
    feedbackTimeouts.current[tachoKey] = setTimeout(() => {
      setTachoFeedback((prev) => ({ ...prev, [tachoKey]: undefined }));
      delete feedbackTimeouts.current[tachoKey];
    }, 2500);
  };

  const reset = () => {
    initializeGame();
  };

  // Items pendientes (no colocados)
  const itemsPendientes = items.filter((it) => !placements[it.id]);

  // Cleanup timeouts al desmontar
  useEffect(() => {
    return () => {
      Object.values(feedbackTimeouts.current).forEach((t) => clearTimeout(t));
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  return (
    <div className="clasificador-root">
      <div className="topbar">
        <button className="btn btn-outline" onClick={reset} aria-label="Reiniciar juego">🔄 Reiniciar</button>
        <div className="instructions small-muted">Arrastrá o tocá un residuo y colócalo en el tacho correcto.</div>
        <div className="score-display">Puntaje: <strong>{score}</strong> / {items.length}</div>
      </div>

      <section className={`residuos-area ${itemsPendientes.length === 0 ? "done" : ""}`} aria-live="polite">
        <div className="residuos-list" role="list">
          {itemsPendientes.map((it) => {
            const isSelected = selectedId === it.id;
            return (
              <div
                key={it.id}
                role="listitem"
                tabIndex={0}
                aria-grabbed={isSelected}
                className={`residuo-card ${draggingId === it.id ? "dragging" : ""} ${isSelected ? "selected" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, it.id)}
                onDragEnd={handleDragEnd}
                onClick={() => handleSelectItem(it.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelectItem(it.id); }}
                title="Arrástrame o tócame y luego toca un tacho"
              >
                <img src={it.icon} alt={it.nombre} className="residuo-img" loading="lazy" />
                <div className="residuo-meta">
                  <div className="residuo-name">{it.nombre}</div>
                  <div className="residuo-type small-muted">{it.tipo}</div>
                </div>
              </div>
            );
          })}

          {itemsPendientes.length === 0 && (
            <div className="game-end-card">
              <h3>🎉 ¡Juego Terminado!</h3>
              <p>Tu puntaje final es: <strong>{score} / {items.length}</strong></p>
              <div>
                <button className="btn btn-primary" onClick={reset}>Jugar de nuevo</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {mensaje && (
        <div className={`alert-floating ${mensaje.tipo === "success" ? "alert-success" : "alert-danger"}`} role="status" aria-live="assertive">
          <strong>{mensaje.titulo}</strong> — <span>{mensaje.texto}</span>
        </div>
      )}

      <section className="tachos-grid" role="list">
        {TACHOS.map((t) => {
          const feedback = tachoFeedback[t.key];
          // residuos colocados en este tacho
          const residuosColocados = Object.entries(placements)
            .filter(([id, placed]) => placed === t.key)
            .map(([id]) => items.find((x) => x.id === Number(id)))
            .filter(Boolean);

          return (
            <div key={t.key} className="tacho-col" role="listitem">
              <div
                className={`tacho-card ${feedback === "correct" ? "tacho-correct" : feedback === "wrong" ? "tacho-wrong" : ""} ${selectedId ? "touch-target" : ""}`}
                onDrop={(e) => handleDrop(e, t.key)}
                onDragOver={allowDrop}
                onClick={() => handleBinClick(t.key)}
                role="button"
                tabIndex={0}
                aria-pressed={false}
                aria-label={`Tacho ${t.label}. ${t.hint}. Click para colocar si seleccionaste un residuo.`}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleBinClick(t.key); }}
              >
                <img src={t.icon} alt={t.label} className="tacho-icon" />
                <div className="tacho-info">
                  <div className="tacho-label">{t.label}</div>
                  <div className="tacho-hint small-muted">{t.hint}</div>
                </div>

                <div className="tacho-badges">
                  {residuosColocados.map((it) => (
                    <div key={it.id} className={`small-badge ${it.tipo === t.key ? "badge-correct" : "badge-wrong"}`}>
                      {it.nombre}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
