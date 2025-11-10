import React, { useState, useEffect, useRef } from 'react';

// ====== PREGUNTAS ======
const preguntasFacil = [
  { texto: '¿Qué color de contenedor se usa para vidrio?', opciones:['Amarillo','Verde','Azul','Gris'], respuesta:'Verde', descripcion:'El contenedor verde es exclusivo para vidrio.' },
  { texto: '¿Qué color de contenedor es para papel y cartón?', opciones:['Amarillo','Verde','Azul','Gris'], respuesta:'Azul', descripcion:'El contenedor azul es para papel y cartón reciclables.' },
  { texto: '¿Dónde van las pilas usadas?', opciones:['Contenedor gris','Contenedor verde','Punto limpio','Amarillo'], respuesta:'Punto limpio', descripcion:'Las pilas son residuos peligrosos y deben ir al punto limpio.' },
  { texto: '¿Qué es un ejemplo de reutilización?', opciones:['Tirar un frasco','Usar un frasco como portalápices','Quemar residuos','Enterrar residuos'], respuesta:'Usar un frasco como portalápices', descripcion:'Reutilizar un objeto implica darle un nuevo uso.' },
  { texto: '¿Qué hacemos con una botella de plástico limpia?', opciones:['Tirar a la basura','Reciclarla','Quemarla','Enterrarla'], respuesta:'Reciclarla', descripcion:'El plástico limpio se deposita en el contenedor amarillo.' },
  { texto: '¿Qué residuos van al contenedor gris?', opciones:['Residuos orgánicos','Restos no reciclables','Plástico','Vidrio'], respuesta:'Restos no reciclables', descripcion:'El contenedor gris es para residuos que no se pueden reciclar.' },
  { texto: '¿Qué se puede reciclar en el contenedor amarillo?', opciones:['Latas','Botellas de vidrio','Papeles','Baterías'], respuesta:'Latas', descripcion:'El amarillo es para envases de plástico, latas y briks.' },
  { texto: '¿Qué se hace con el aceite de cocina usado?', opciones:['Tirar al fregadero','Entregar en punto limpio','Mezclar con agua','Quemar'], respuesta:'Entregar en punto limpio', descripcion:'El aceite usado es contaminante y se lleva al punto limpio.' },
  { texto: '¿Qué color de contenedor usamos para residuos orgánicos?', opciones:['Marrón','Verde','Azul','Amarillo'], respuesta:'Marrón', descripcion:'El marrón es para restos de comida y residuos biodegradables.' },
  { texto: '¿Se pueden reciclar los envases sucios?', opciones:['Sí','No','A veces','Solo plásticos'], respuesta:'No', descripcion:'Los envases deben estar limpios para reciclarse correctamente.' },
  // Agregar más para llegar a 30 preguntas
];

const preguntasMedio = [
  { texto: '¿Dónde se deposita un electrodoméstico roto?', opciones:['Contenedor gris','Punto limpio','Amarillo','Azul'], respuesta:'Punto limpio', descripcion:'Los electrodomésticos contienen materiales peligrosos, van al punto limpio.' },
  { texto: '¿Qué hacer con una botella de plástico grande?', opciones:['Reciclarla','Tirar a la basura','Quemarla','Enterrarla'], respuesta:'Reciclarla', descripcion:'Los plásticos deben ir al contenedor amarillo o reciclarse según tipo.' },
  { texto: '¿Qué tipo de residuo es un envase de yogur?', opciones:['Orgánico','Reciclable','Peligroso','Electrónico'], respuesta:'Reciclable', descripcion:'El envase de yogur es plástico y se puede reciclar.' },
  { texto: '¿Dónde se deposita un cartón con restos de comida?', opciones:['Azul','Marrón','Gris','Verde'], respuesta:'Marrón', descripcion:'El cartón sucio se considera residuo orgánico.' },
  { texto: '¿Se pueden mezclar plásticos y papel en reciclaje?', opciones:['Sí','No','Solo a veces','Solo plásticos'], respuesta:'No', descripcion:'Cada material debe ir en su contenedor correspondiente.' },
  // Agregar más para llegar a 30 preguntas
];

const preguntasDificil = [
  { texto: '¿Cuál de estos materiales NO se recicla en el contenedor amarillo?', opciones:['Plástico','Latas','Cartón','Vidrio'], respuesta:'Vidrio', descripcion:'El vidrio tiene su propio contenedor, el verde.' },
  { texto: '¿Qué se hace con las bombillas incandescentes?', opciones:['Contenedor gris','Reciclar en amarillo','Punto limpio','Quemar'], respuesta:'Punto limpio', descripcion:'Las bombillas contienen materiales que requieren tratamiento especial.' },
  { texto: '¿Cuál es la regla para residuos peligrosos?', opciones:['Tirar con restos','Entregar en punto limpio','Reciclar en amarillo','Mezclar con orgánicos'], respuesta:'Entregar en punto limpio', descripcion:'Los residuos peligrosos no deben mezclarse con otros residuos.' },
  { texto: '¿Qué hacer con la pintura sobrante?', opciones:['Tirar a la basura','Verter en el desagüe','Entregar en punto limpio','Quemar'], respuesta:'Entregar en punto limpio', descripcion:'La pintura es un residuo peligroso que requiere gestión especial.' },
  { texto: '¿Cómo reciclar baterías?', opciones:['Tirar en amarillo','Entregar en punto limpio','Contenedor gris','Quemar'], respuesta:'Entregar en punto limpio', descripcion:'Las baterías contienen metales pesados y van al punto limpio.' },
  // Agregar más para llegar a 30 preguntas
];

// ====== TRIVIA COMPONENT ======
const dificultadTiempos = { facil:25, medio:15, dificil:10 };

export default function TriviaReciclaje(){
  const [dificultad,setDificultad] = useState('facil');
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual,setPreguntaActual] = useState(0);
  const [puntaje,setPuntaje] = useState(0);
  const [terminado,setTerminado] = useState(false);
  const [empezado,setEmpezado] = useState(false);
  const [tiempo,setTiempo] = useState(dificultadTiempos[dificultad]);
  const [seleccion,setSeleccion] = useState(null);
  const [descripcion,setDescripcion] = useState('');
  const timerRef = useRef(null);

  const mezclar = (array) => array.sort(() => Math.random() - 0.5);

  const empezarJuego = () => {
    let filtradas = [];
    if(dificultad==='facil') filtradas = mezclar(preguntasFacil).slice(0,10);
    if(dificultad==='medio') filtradas = mezclar(preguntasMedio).slice(0,10);
    if(dificultad==='dificil') filtradas = mezclar(preguntasDificil).slice(0,10);
    setPreguntas(filtradas);
    setPreguntaActual(0);
    setTiempo(dificultadTiempos[dificultad]);
    setPuntaje(0);
    setTerminado(false);
    setEmpezado(true);
    setSeleccion(null);
    setDescripcion('');
  }

  useEffect(()=>{
    if(empezado && !terminado){
      timerRef.current = setInterval(()=>setTiempo(t => t-1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [empezado, terminado]);

  const seleccionar = (opcion) => {
    if(seleccion) return;
    clearInterval(timerRef.current); // detener temporizador
    setSeleccion(opcion);
    const correcta = preguntas[preguntaActual].respuesta;
    setDescripcion(preguntas[preguntaActual].descripcion);
    if(opcion === correcta) setPuntaje(p => p+1);
  }

  const siguientePregunta = () => {
    const sig = preguntaActual + 1;
    if(sig >= preguntas.length){
      setTerminado(true);
      setEmpezado(false);
    } else {
      setPreguntaActual(sig);
      setSeleccion(null);
      setTiempo(dificultadTiempos[dificultad]);
      setDescripcion('');
      timerRef.current = setInterval(()=>setTiempo(t => t-1), 1000);
    }
  }

  if(!empezado && !terminado) return (
    <div className="card p-4 text-center">
      <h1 className="card-title mb-3 text-success">Trivia Reciclaje</h1>
      <p>Selecciona nivel y comienza:</p>
      <div className="mt-3 mb-3 d-flex justify-content-center gap-2">
        <button onClick={()=>setDificultad('facil')} className={`btn ${dificultad==='facil'?'btn-success':'btn-outline-success'}`}>Fácil</button>
        <button onClick={()=>setDificultad('medio')} className={`btn ${dificultad==='medio'?'btn-warning':'btn-outline-warning'}`}>Medio</button>
        <button onClick={()=>setDificultad('dificil')} className={`btn ${dificultad==='dificil'?'btn-danger':'btn-outline-danger'}`}>Difícil</button>
      </div>
      <button onClick={empezarJuego} className="btn btn-success mt-2">Comenzar</button>
    </div>
  );

  if(terminado) return (
    <div className="card p-4 text-center">
      <h1 className="card-title mb-3 text-success">¡Juego terminado!</h1>
      <p>Puntaje: {puntaje} / {preguntas.length}</p>
      <button onClick={empezarJuego} className="btn btn-success mt-2">Jugar de nuevo</button>
    </div>
  );

  return (
    <div className="card p-4">
      <div className="d-flex justify-content-between mb-3">
        <div>Pregunta {preguntaActual+1}/{preguntas.length}</div>
        <div>Tiempo: {tiempo}s</div>
      </div>
      <h2 className="mb-3">{preguntas[preguntaActual].texto}</h2>
      <div className="d-grid gap-2">
        {preguntas[preguntaActual].opciones.map((opt,i)=>(
          <button key={i} 
                  onClick={()=>seleccionar(opt)} 
                  className={`btn ${seleccion ? (opt===preguntas[preguntaActual].respuesta?'btn-success':'btn-danger') : 'btn-outline-secondary'}`}>
            {opt}
          </button>
        ))}
      </div>
      {descripcion && <div className="mt-3 alert alert-info">{descripcion}</div>}
      {seleccion && <button onClick={siguientePregunta} className="btn btn-primary mt-2">Siguiente</button>}
    </div>
  );
}
