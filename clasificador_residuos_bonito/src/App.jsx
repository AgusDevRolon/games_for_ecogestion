import React, { useState } from 'react';
import ClasificadorArrastrable from './components/ClasificadorArrastrable';
import './styles.css';

export default function App(){
  const [player] = useState('Jugador');

  return (
    <div className="app-shell">
      <header className="header">
        <div className="title">
          <div className="logo" aria-hidden>♻️</div>
          <div>
            <h2 style={{margin:0}}>Clasificador de Residuos</h2>
            <div className="subtitle">Arrastra o toca los residuos y colócalos en el tacho correspondiente</div>
          </div>
        </div>
        <div className="controls">
          <div className="me-2">Jugador: <strong>{player}</strong></div>
        </div>
      </header>

      <main className="board">
        <div className="panel main-panel">
          <h4 style={{marginTop:0}}>Juego</h4>
          <ClasificadorArrastrable />
        </div>

        <aside className="side panel">
          <h5 style={{marginTop:0}}>Instrucciones</h5>
          <p className="msg text-muted">
            Arrastra una tarjeta al tacho correcto, o tócalas (móvil) y luego toca el tacho donde quieras colocarla.
            Si aciertas, el tacho se iluminará en verde y obtendrás un punto. Al finalizar verás tu puntaje.
          </p>
          <div style={{marginTop:12}}>
            <strong>Consejos:</strong>
            <ul style={{marginTop:6}}>
              <li>Si no puedes arrastrar en tu dispositivo, toca la tarjeta y luego el tacho.</li>
              <li>Usa teclado: Tab para navegar y Enter para seleccionar/colocar.</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="footer small-muted">
        Proyecto educativo — Clasificación de residuos. Hecho con React.
      </footer>
    </div>
  );
}
