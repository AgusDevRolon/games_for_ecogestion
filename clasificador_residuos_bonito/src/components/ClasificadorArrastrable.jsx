import React, { useEffect, useState } from 'react';
import '../styles.css';

import iconBanana from '../assets/banana.svg';
import iconGlass from '../assets/glass.svg';
import iconPlastic from '../assets/plastic.svg';
import iconCan from '../assets/can.svg';
import iconBattery from '../assets/battery.svg';
import iconOil from '../assets/oil.svg';
import iconBox from '../assets/box.svg';
import iconSyringe from '../assets/syringe.svg';

import binOrg from '../assets/bin_org.svg';
import binPlastic from '../assets/bin_plastic.svg';
import binGlass from '../assets/bin_glass.svg';
import binPaper from '../assets/bin_paper.svg';
import binMetal from '../assets/bin_metal.svg';
import binHazard from '../assets/bin_hazard.svg';
import binRest from '../assets/bin_rest.svg';

const TODOS = [
  { id: 1, nombre: 'Cáscara de banana', tipo: 'Orgánico', descripcion: 'Los restos orgánicos se descomponen y sirven para compost.', icon: iconBanana },
  { id: 2, nombre: 'Botella de vidrio', tipo: 'Vidrio', descripcion: 'El vidrio se recicla y se deposita en el contenedor verde.', icon: iconGlass },
  { id: 3, nombre: 'Botella plástica (PET)', tipo: 'Plástico', descripcion: 'Las botellas PET van al contenedor de envases.', icon: iconPlastic },
  { id: 4, nombre: 'Lata de aluminio', tipo: 'Metal', descripcion: 'Las latas se reciclan y recuperan metales.', icon: iconCan },
  { id: 5, nombre: 'Pila usada', tipo: 'Peligroso', descripcion: 'Las pilas contienen metales tóxicos y van al punto limpio.', icon: iconBattery },
  { id: 6, nombre: 'Aceite de cocina usado', tipo: 'Peligroso', descripcion: 'El aceite contamina y debe entregarse en puntos limpios.', icon: iconOil },
  { id: 7, nombre: 'Cartón limpio', tipo: 'PapelCarton', descripcion: 'El cartón limpio se recicla en el contenedor azul.', icon: iconBox },
  { id: 8, nombre: 'Jeringa', tipo: 'Peligroso', descripcion: 'Residuos sanitarios requieren gestión especial.', icon: iconSyringe }
];

const TACHOS = [
  { key: 'Orgánico', label: 'Orgánico', hint: 'Residuos biodegradables', icon: binOrg },
  { key: 'Plástico', label: 'Plástico', hint: 'Envases de plástico', icon: binPlastic },
  { key: 'Vidrio', label: 'Vidrio', hint: 'Botellas y frascos', icon: binGlass },
  { key: 'PapelCarton', label: 'Papel & Cartón', hint: 'Papeles y cartones', icon: binPaper },
  { key: 'Metal', label: 'Metal', hint: 'Latas y envases metálicos', icon: binMetal },
  { key: 'Peligroso', label: 'Peligrosos', hint: 'Pilas, aceites, bombillas', icon: binHazard },
  { key: 'NoReciclable', label: 'No reciclable', hint: 'Resto / No reciclable', icon: binRest }
];

export default function ClasificadorArrastrable(){
  const [items, setItems] = useState([]);
  const [placements, setPlacements] = useState({});
  const [tachoFeedback, setTachoFeedback] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  useEffect(()=>{
    const shuffled = [...TODOS].sort(()=>Math.random()-0.5);
    setItems(shuffled);
    setPlacements({});
    setTachoFeedback({});
    setMensaje(null);
    setDraggingId(null);
  },[]);

  const handleDragStart = (e,id)=>{
    e.dataTransfer.setData('text/plain',String(id));
    e.dataTransfer.effectAllowed='move';
    setDraggingId(id);
  };
  const handleDragEnd = ()=> setDraggingId(null);

  const allowDrop = (e)=>{ e.preventDefault(); e.dataTransfer.dropEffect='move'; };

  const handleDrop = (e,tachoKey)=>{
    e.preventDefault();
    const idStr = e.dataTransfer.getData('text/plain');
    if(!idStr) return;
    const id = Number(idStr);
    const item = items.find(it=>it.id===id);
    if(!item) return;
    if(placements[id]) return;

    const correcto = item.tipo === tachoKey;
    setPlacements(prev=>({...prev,[id]:tachoKey}));
    setTachoFeedback(prev=>({...prev,[tachoKey]: correcto? 'correct':'wrong'}));

    const titulo = correcto? '✅ Correcto':'❌ Incorrecto';
    const explicacion = correcto? `${item.nombre} → ${tachoKey}. ${item.descripcion}` : `${item.nombre} no corresponde a ${tachoKey}. ${item.descripcion}`;
    setMensaje({titulo,texto:explicacion,tipo: correcto? 'success':'danger'});

    setTimeout(()=>{ setTachoFeedback(prev=>({...prev,[tachoKey]:undefined})); },3000);
    setDraggingId(null);
  };

  const reset = ()=>{
    const shuffled = [...TODOS].sort(()=>Math.random()-0.5);
    setItems(shuffled);
    setPlacements({});
    setTachoFeedback({});
    setMensaje(null);
    setDraggingId(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={reset}>Reiniciar</button>
          <span className="text-muted">Arrastrá cada residuo al tacho correcto.</span>
        </div>
        <div><strong>Puntaje:</strong> {Object.keys(placements).length} / {items.length}</div>
      </div>

      <div className="residuos-grid residuos-area mb-4">
        {items.map(it=>{
          const colocado = !!placements[it.id];
          return (
            <div key={it.id}
                 className={`residuo-card ${colocado? 'colocado':''} ${draggingId===it.id? 'dragging':''}`}
                 draggable={!colocado}
                 onDragStart={(e)=>handleDragStart(e,it.id)}
                 onDragEnd={handleDragEnd}
                 title={colocado? 'Ya colocado':'Arrástrame'}>
              <img src={it.icon} alt="" className="residuo-img" />
              <div className="residuo-name">{it.nombre}</div>
              {colocado && <div className="residuo-desc small mt-2">{it.descripcion}</div>}
            </div>
          );
        })}
      </div>

      <div className="tachos-row row g-3">
        {TACHOS.map(t=>{
          const feedback = tachoFeedback[t.key];
          return (
            <div key={t.key} className="col-12 col-md-6 col-lg-4">
              <div className={`tacho-card ${feedback==='correct'? 'tacho-correct' : feedback==='wrong'? 'tacho-wrong':''}`} onDrop={(e)=>handleDrop(e,t.key)} onDragOver={allowDrop}>
                <img src={t.icon} alt="" className="tacho-icon" />
                <div className="tacho-label h6 mb-0">{t.label}</div>
                <div className="tacho-hint small text-muted">{t.hint}</div>
                <div className="badges">
                  {Object.entries(placements).filter(([id,placed])=>placed===t.key).map(([id])=>{
                    const it = items.find(x=>x.id===Number(id));
                    if(!it) return null;
                    return <div key={id} className="badge bg-secondary">{it.nombre}</div>
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mensaje && <div className={`alert alert-${mensaje.tipo} alert-custom mt-4`} role="alert"><strong>{mensaje.titulo}</strong> — {mensaje.texto}</div>}
    </div>
  );
}
