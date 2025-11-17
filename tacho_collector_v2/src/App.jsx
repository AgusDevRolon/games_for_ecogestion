import React from 'react';
import TachoGame from './components/TachoGame.jsx';
import './styles.css';

export default function App(){
  return (
    <div className="app">
      <header className="header">
        <div className="title">
          <div className="logo">TC</div>
          <div>
            <h2 style={{margin:0}}>Tacho Collector v2</h2>
            <div className="small-muted">Atrapa solo lo que tu tacho admite. 3 vidas.</div>
          </div>
        </div>

        <div className="controls">
          <div className="small-muted">Controles: ← → o A / D — Click/touch para mover</div>
        </div>
      </header>

      <main className="game-wrap">
        <section className="game-and-info">
          <TachoGame />

          <aside className="game-info">
            <h3>Cómo jugar</h3>
            <p>Tu tacho objetivo se muestra en la HUD. Mueve el tacho horizontalmente para atrapar objetos que caen. Si el objeto coincide con el tipo del tacho ganas puntos; si no, pierdes vidas y puntos. Si dejas caer un objeto que sí pertenecía al tacho también pierdes vida.</p>

            <h4>Controles</h4>
            <ul>
              <li><strong>Teclado:</strong> Flechas ← → o A / D</li>
              <li><strong>Mouse/touch:</strong> Clic o toque en el área del juego para mover el tacho</li>
            </ul>

            <h4>Puntuación</h4>
            <ul>
              <li>+10 puntos por objeto correcto atrapado</li>
              <li>-5 puntos por objeto incorrecto atrapado</li>
              <li>-1 vida y -5 puntos si se te cae un objeto que sí era del tacho</li>
            </ul>

            <p className="small-muted">Tips: Observá el ícono y el nombre del objeto (HUD) para identificar rápido. Podés cambiar el tacho objetivo al reiniciar.</p>
          </aside>
        </section>
      </main>
    </div>
  );
}
