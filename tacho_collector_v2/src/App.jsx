import React from 'react';
import Game from './components/TachoGame.jsx';

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
          <div className="small-muted">Controles: ← → o A / D</div>
        </div>
      </header>

      <div className="game-wrap">
        <Game />
      </div>
    </div>
  );
}
