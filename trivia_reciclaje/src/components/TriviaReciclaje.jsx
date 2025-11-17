import React, { useState, useEffect, useRef } from 'react';

// (Mantener las preguntas tal como las tienes)
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
  { texto: '¿Qué hacer con los tapones de botellas?', opciones:['Tirarlos al vidrio','Reciclarlos en plástico','Punto limpio','Contenedor gris'], respuesta:'Reciclarlos en plástico', descripcion:'Los tapones son de plástico y van al contenedor amarillo.' },
  { texto: '¿Qué contenedor es para envases metálicos?', opciones:['Amarillo','Verde','Azul','Marrón'], respuesta:'Amarillo', descripcion:'El contenedor amarillo acepta latas y envases metálicos.' },
  { texto: '¿Dónde se tira un pañuelo usado?', opciones:['Marrón','Gris','Azul','Amarillo'], respuesta:'Gris', descripcion:'Los residuos no reciclables como pañuelos van al contenedor gris.' },
  { texto: '¿Qué hacer con cartón limpio de pizza?', opciones:['Reciclarlo en azul','Tirarlo a gris','Llevarlo al punto limpio','Quemarlo'], respuesta:'Reciclarlo en azul', descripcion:'El cartón limpio se deposita en el contenedor azul.' },
  { texto: '¿Los restos de comida van al contenedor...', opciones:['Marrón','Azul','Amarillo','Verde'], respuesta:'Marrón', descripcion:'El marrón es para residuos orgánicos y restos de comida.' },
  { texto: '¿Qué contenedor se usa para periódicos?', opciones:['Azul','Amarillo','Verde','Marrón'], respuesta:'Azul', descripcion:'Los periódicos van al contenedor azul de papel.' },
  { texto: '¿Qué hacer con botellas de aceite vacías?', opciones:['Tirarlas al gris','Reciclarlas en amarillo','Punto limpio','Quemar'], respuesta:'Punto limpio', descripcion:'El aceite es contaminante y debe ir al punto limpio.' },
  { texto: '¿Se pueden reciclar bolsas de plástico sucias?', opciones:['Sí','No','A veces','Solo plásticas'], respuesta:'No', descripcion:'Deben estar limpias para reciclarse correctamente.' },
  { texto: '¿Qué se hace con restos de poda?', opciones:['Contenedor marrón','Compostaje','Contenedor gris','Contenedor amarillo'], respuesta:'Compostaje', descripcion:'Los restos vegetales se pueden compostar.' },
  { texto: '¿Qué se deposita en el contenedor verde?', opciones:['Vidrio','Papel','Plástico','Orgánico'], respuesta:'Vidrio', descripcion:'El verde es exclusivo para vidrio.' },
  { texto: '¿Se pueden reciclar cápsulas de café?', opciones:['Sí, en amarillo','No','Sí, en azul','Sí, en verde'], respuesta:'Sí, en amarillo', descripcion:'Las cápsulas de plástico o aluminio se depositan en amarillo.' },
  { texto: '¿Qué se hace con latas de conserva?', opciones:['Tirar a gris','Reciclar en amarillo','Punto limpio','Quemar'], respuesta:'Reciclar en amarillo', descripcion:'Las latas se reciclan en el contenedor amarillo.' },
  { texto: '¿Qué hacer con juguetes rotos de plástico?', opciones:['Contenedor amarillo','Contenedor gris','Punto limpio','Reciclar en azul'], respuesta:'Contenedor gris', descripcion:'Si no se pueden reciclar, van a gris.' },
  { texto: '¿Dónde van las pilas recargables?', opciones:['Contenedor amarillo','Punto limpio','Contenedor gris','Azul'], respuesta:'Punto limpio', descripcion:'Las pilas recargables también son residuos peligrosos.' },
  { texto: '¿Qué hacer con un frasco de vidrio sin tapa?', opciones:['Contenedor verde','Contenedor gris','Azul','Amarillo'], respuesta:'Contenedor verde', descripcion:'El vidrio se deposita en verde aunque falte la tapa.' },
  { texto: '¿Los envases de yogur van al...', opciones:['Contenedor amarillo','Azul','Verde','Gris'], respuesta:'Contenedor amarillo', descripcion:'El envase plástico limpio se deposita en amarillo.' },
  { texto: '¿Qué se hace con ropa vieja?', opciones:['Contenedor gris','Donación','Punto limpio','Azul'], respuesta:'Donación', descripcion:'La ropa puede donarse o reciclarse en puntos especiales.' },
  { texto: '¿Qué contenedor es para pilas y baterías?', opciones:['Punto limpio','Amarillo','Gris','Azul'], respuesta:'Punto limpio', descripcion:'Pilas y baterías siempre van al punto limpio.' },
  { texto: '¿Se pueden reciclar envases de comida sucia?', opciones:['No','Sí','A veces','Solo plásticos'], respuesta:'No', descripcion:'Deben limpiarse antes de reciclar.' },
  { texto: '¿Qué hacer con cajas de leche?', opciones:['Amarillo','Azul','Verde','Gris'], respuesta:'Amarillo', descripcion:'Los bricks de leche se reciclan en el contenedor amarillo.' },
];

const preguntasMedio = [
  { texto: '¿Dónde se deposita un electrodoméstico roto?', opciones:['Contenedor gris','Punto limpio','Amarillo','Azul'], respuesta:'Punto limpio', descripcion:'Los electrodomésticos contienen materiales peligrosos, van al punto limpio.' },
  { texto: '¿Qué hacer con una botella de plástico grande?', opciones:['Reciclarla','Tirar a la basura','Quemarla','Enterrarla'], respuesta:'Reciclarla', descripcion:'Los plásticos deben ir al contenedor amarillo o reciclarse según tipo.' },
  { texto: '¿Qué tipo de residuo es un envase de yogur?', opciones:['Orgánico','Reciclable','Peligroso','Electrónico'], respuesta:'Reciclable', descripcion:'El envase de yogur es plástico y se puede reciclar.' },
  { texto: '¿Dónde se deposita un cartón con restos de comida?', opciones:['Azul','Marrón','Gris','Verde'], respuesta:'Marrón', descripcion:'El cartón sucio se considera residuo orgánico.' },
  { texto: '¿Se pueden mezclar plásticos y papel en reciclaje?', opciones:['Sí','No','Solo a veces','Solo plásticos'], respuesta:'No', descripcion:'Cada material debe ir en su contenedor correspondiente.' },
  { texto: '¿Qué se hace con las cápsulas de café usadas?', opciones:['Contenedor gris','Amarillo','Punto limpio','Azul'], respuesta:'Amarillo', descripcion:'Las cápsulas de aluminio o plástico se reciclan en amarillo.' },
  { texto: '¿Dónde van los medicamentos vencidos?', opciones:['Contenedor gris','Punto limpio','Azul','Verde'], respuesta:'Punto limpio', descripcion:'Medicamentos y envases van al punto limpio.' },
  { texto: '¿Qué hacer con ropa usada?', opciones:['Tirar a gris','Donación','Quemar','Azul'], respuesta:'Donación', descripcion:'La ropa puede donarse o reciclarse en puntos especiales.' },
  { texto: '¿Se puede reciclar vidrio sucio?', opciones:['Sí','No','A veces','Solo botellas'], respuesta:'No', descripcion:'El vidrio debe estar limpio para reciclarse.' },
  { texto: '¿Qué hacer con restos de comida grandes?', opciones:['Marrón','Gris','Azul','Amarillo'], respuesta:'Marrón', descripcion:'Los restos orgánicos van al contenedor marrón.' },
  { texto: '¿Dónde se recicla un tetrabrik?', opciones:['Azul','Amarillo','Verde','Marrón'], respuesta:'Amarillo', descripcion:'Los tetrabriks se depositan en el amarillo.' },
  { texto: '¿Qué hacer con aceite de motor usado?', opciones:['Tirar al desagüe','Punto limpio','Contenedor gris','Azul'], respuesta:'Punto limpio', descripcion:'Es un residuo peligroso, no debe tirarse a la calle.' },
  { texto: '¿Dónde se depositan pilas recargables?', opciones:['Contenedor amarillo','Punto limpio','Gris','Verde'], respuesta:'Punto limpio', descripcion:'Las pilas siempre van al punto limpio.' },
  { texto: '¿Se pueden reciclar botellas de plástico de alimentos grasosos?', opciones:['Sí','No','A veces','Solo algunas'], respuesta:'No', descripcion:'Deben estar limpias antes de reciclar.' },
  { texto: '¿Qué hacer con cajas de jugo?', opciones:['Azul','Amarillo','Verde','Gris'], respuesta:'Amarillo', descripcion:'Los bricks se reciclan en amarillo.' },
  { texto: '¿Dónde se deposita un monitor viejo?', opciones:['Punto limpio','Amarillo','Azul','Gris'], respuesta:'Punto limpio', descripcion:'Los aparatos electrónicos van al punto limpio.' },
  { texto: '¿Se pueden mezclar plásticos de distinto tipo?', opciones:['Sí','No','A veces','Solo plásticos'], respuesta:'No', descripcion:'Cada tipo de plástico va en su contenedor correspondiente.' },
  { texto: '¿Qué hacer con restos de poda?', opciones:['Compostaje','Marrón','Gris','Azul'], respuesta:'Compostaje', descripcion:'Los restos vegetales se pueden compostar.' },
  { texto: '¿Dónde se deposita un teléfono móvil viejo?', opciones:['Punto limpio','Contenedor gris','Amarillo','Azul'], respuesta:'Punto limpio', descripcion:'Los teléfonos viejos son residuos electrónicos.' },
  { texto: '¿Qué hacer con envases de yogur con restos?', opciones:['Amarillo','Marrón','Gris','Verde'], respuesta:'Marrón', descripcion:'Si tienen restos de comida se consideran orgánicos.' },
  { texto: '¿Se puede reciclar plástico flexible como envoltorios?', opciones:['Sí','No','A veces','Solo bolsas'], respuesta:'Sí', descripcion:'Muchos plásticos flexibles van al amarillo.' },
  { texto: '¿Dónde se deposita un frigorífico viejo?', opciones:['Punto limpio','Gris','Amarillo','Azul'], respuesta:'Punto limpio', descripcion:'Electrodomésticos con componentes peligrosos deben ir al punto limpio.' },
  { texto: '¿Qué hacer con latas de conserva vacías?', opciones:['Amarillo','Gris','Azul','Verde'], respuesta:'Amarillo', descripcion:'Se depositan en el contenedor amarillo.' },
  { texto: '¿Dónde se depositan pinturas sobrantes?', opciones:['Punto limpio','Amarillo','Gris','Azul'], respuesta:'Punto limpio', descripcion:'La pintura es un residuo peligroso.' },
  { texto: '¿Se pueden reciclar envases con aceite?', opciones:['No','Sí','A veces','Solo plásticos'], respuesta:'No', descripcion:'Los envases con aceite contaminante no se reciclan.' },
  { texto: '¿Qué hacer con un envase de yogur limpio?', opciones:['Amarillo','Gris','Azul','Verde'], respuesta:'Amarillo', descripcion:'Envase limpio de plástico va al amarillo.' },
  { texto: '¿Dónde van los CDs viejos?', opciones:['Punto limpio','Contenedor gris','Azul','Amarillo'], respuesta:'Punto limpio', descripcion:'Contienen materiales que requieren tratamiento especial.' },
  { texto: '¿Qué hacer con cajas de pizza sucias?', opciones:['Marrón','Azul','Gris','Amarillo'], respuesta:'Marrón', descripcion:'Si están sucias, se consideran residuos orgánicos.' },
];

const preguntasDificil = [
  { texto: '¿Cuál de estos materiales NO se recicla en el contenedor amarillo?', opciones:['Plástico','Latas','Cartón','Vidrio'], respuesta:'Vidrio', descripcion:'El vidrio tiene su propio contenedor, el verde.' },
  { texto: '¿Qué se hace con las bombillas incandescentes?', opciones:['Contenedor gris','Reciclar en amarillo','Punto limpio','Quemar'], respuesta:'Punto limpio', descripcion:'Las bombillas contienen materiales que requieren tratamiento especial.' },
  { texto: '¿Cuál es la regla para residuos peligrosos?', opciones:['Tirar con restos','Entregar en punto limpio','Reciclar en amarillo','Mezclar con orgánicos'], respuesta:'Entregar en punto limpio', descripcion:'Los residuos peligrosos no deben mezclarse con otros residuos.' },
  { texto: '¿Qué hacer con la pintura sobrante?', opciones:['Tirar a la basura','Verter en el desagüe','Entregar en punto limpio','Quemar'], respuesta:'Entregar en punto limpio', descripcion:'La pintura es un residuo peligroso que requiere gestión especial.' },
  { texto: '¿Cómo reciclar baterías?', opciones:['Tirar en amarillo','Entregar en punto limpio','Contenedor gris','Quemar'], respuesta:'Entregar en punto limpio', descripcion:'Las baterías contienen metales pesados y van al punto limpio.' },
  { texto: '¿Qué hacer con neumáticos usados?', opciones:['Tirar a la calle','Punto limpio','Contenedor gris','Quemar'], respuesta:'Punto limpio', descripcion:'Neumáticos requieren tratamiento especial.' },
  { texto: '¿Dónde se recicla un frigorífico viejo?', opciones:['Punto limpio','Contenedor gris','Amarillo','Azul'], respuesta:'Punto limpio', descripcion:'Electrodomésticos con componentes peligrosos deben ir al punto limpio.' },
  { texto: '¿Qué hacer con aceite de motor?', opciones:['Punto limpio','Tirar al desagüe','Contenedor gris','Quemar'], respuesta:'Punto limpio', descripcion:'Aceite contaminante requiere gestión especial.' },
  { texto: '¿Dónde van los medicamentos caducados?', opciones:['Punto limpio','Contenedor gris','Amarillo','Azul'], respuesta:'Punto limpio', descripcion:'Medicamentos siempre al punto limpio.' },
  { texto: '¿Se puede reciclar vidrio roto?', opciones:['Sí, en verde','No','A veces','Sólo botellas'], respuesta:'Sí, en verde', descripcion:'Vidrio roto también va al verde.' },
  { texto: '¿Qué hacer con pilas recargables?', opciones:['Contenedor gris','Punto limpio','Amarillo','Verde'], respuesta:'Punto limpio', descripcion:'Pilas recargables son residuos peligrosos.' },
  { texto: '¿Qué hacer con fluorescentes usados?', opciones:['Punto limpio','Contenedor gris','Azul','Amarillo'], respuesta:'Punto limpio', descripcion:'Los fluorescentes contienen mercurio y van al punto limpio.' },
  { texto: '¿Cómo reciclar envases de aerosoles?', opciones:['Punto limpio','Amarillo','Gris','Azul'], respuesta:'Punto limpio', descripcion:'Aerosoles son residuos peligrosos.' },
  { texto: '¿Qué hacer con restos de medicamentos?', opciones:['Punto limpio','Gris','Amarillo','Azul'], respuesta:'Punto limpio', descripcion:'Siempre van al punto limpio.' },
  { texto: '¿Dónde se deposita un ordenador viejo?', opciones:['Punto limpio','Contenedor gris','Amarillo','Azul'], respuesta:'Punto limpio', descripcion:'Componentes electrónicos requieren gestión especial.' },
  { texto: '¿Qué hacer con un televisor CRT antiguo?', opciones:['Punto limpio','Gris','Amarillo','Azul'], respuesta:'Punto limpio', descripcion:'Electrónicos con componentes peligrosos van al punto limpio.' },
  { texto: '¿Dónde se recicla un smartphone viejo?', opciones:['Punto limpio','Contenedor gris','Amarillo','Azul'], respuesta:'Punto limpio', descripcion:'Celulares requieren tratamiento especial.' },
  { texto: '¿Qué hacer con baterías de litio?', opciones:['Punto limpio','Contenedor gris','Amarillo','Verde'], respuesta:'Punto limpio', descripcion:'Baterías de litio son peligrosas y van al punto limpio.' },
  { texto: '¿Dónde se depositan pinturas tóxicas?', opciones:['Punto limpio','Gris','Azul','Amarillo'], respuesta:'Punto limpio'},
];

const dificultadTiempos = { facil:30, medio:30, dificil:19 };

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
    clearInterval(timerRef.current);
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

  const PreguntaCard = () => (
    <div className="card p-4 shadow-lg mx-auto" style={{ maxWidth: '700px', minHeight:'400px' }}>
      <div className="d-flex justify-content-between mb-3">
        <div><strong>Pregunta {preguntaActual+1}/{preguntas.length}</strong></div>
        <div><strong>Tiempo:</strong> {tiempo}s</div>
      </div>
      <div className="mb-4 p-3 bg-light border rounded">
        <h4 className="mb-0">{preguntas[preguntaActual].texto}</h4>
      </div>
      <div className="d-grid gap-3">
        {preguntas[preguntaActual].opciones.map((opt,i)=>(
          <button key={i} 
                  onClick={()=>seleccionar(opt)} 
                  className={`btn btn-lg ${seleccion ? 
                    (opt===preguntas[preguntaActual].respuesta ? 'btn-success' : (opt===seleccion ? 'btn-danger' : 'btn-outline-secondary')) 
                    : 'btn-outline-primary'}`}
                  style={{ textAlign:'left' }}
          >
            {opt}
          </button>
        ))}
      </div>
      <div style={{ minHeight:'60px', marginTop:'15px' }}>
        {descripcion && <div className="alert alert-info mb-0">{descripcion}</div>}
      </div>
      {seleccion && <button onClick={siguientePregunta} className="btn btn-primary mt-3">Siguiente</button>}
    </div>
  );

  if(!empezado && !terminado) return (
    <div className="d-flex flex-column align-items-center justify-content-center mt-5">
      <h1 className="mb-3 text-success">Trivia Reciclaje</h1>
      <p>Selecciona nivel y comienza:</p>
      <div className="mt-3 mb-3 d-flex justify-content-center gap-2 flex-wrap">
        <button onClick={()=>setDificultad('facil')} className={`btn ${dificultad==='facil'?'btn-success':'btn-outline-success'}`}>Fácil</button>
        <button onClick={()=>setDificultad('medio')} className={`btn ${dificultad==='medio'?'btn-warning':'btn-outline-warning'}`}>Medio</button>
        <button onClick={()=>setDificultad('dificil')} className={`btn ${dificultad==='dificil'?'btn-danger':'btn-outline-danger'}`}>Difícil</button>
      </div>
      <button onClick={empezarJuego} className="btn btn-success mt-2">Comenzar</button>
    </div>
  );

  if(terminado) return (
    <div className="d-flex flex-column align-items-center justify-content-center mt-5">
      <h1 className="mb-3 text-success">¡Juego terminado!</h1>
      <p>Puntaje: {puntaje} / {preguntas.length}</p>
      <button onClick={empezarJuego} className="btn btn-success mt-2">Jugar de nuevo</button>
    </div>
  );

  return <PreguntaCard />;
}
