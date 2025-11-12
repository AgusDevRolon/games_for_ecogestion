import React, { useState } from 'react';
import ClasificadorArrastrable from './components/ClasificadorArrastrable.jsx';
import './styles.css';

export default function App(){
  const [player, setPlayer] = useState('Jugador');
  return (
    <div className="app-shell">
      <header className="header">
        <div className="title">
          <div className="logo">♻️</div>
          <div>
            <h2 style={{margin:0}}>Clasificador de Residuos</h2>
            <div className="subtitle">Arrastra los residuos a su tacho correspondiente</div>
          </div>
        </div>
        <div className="controls">
          <div className="me-2">Jugador: <strong>{player}</strong></div>
        </div>
      </header>

      <main className="board">
        <div className="panel">
          <h4 style={{marginTop:0}}>Residuos</h4>
          <ClasificadorArrastrable />
        </div>

        <aside className="side panel">
          <h5 style={{marginTop:0}}>Tachos</h5>
          <div className="tachos-grid" id="tachos-visual">
            {/* tachos rendered inside component */}
          </div>

          <div className="msg text-muted">Consejo: arrastra cada tarjeta al tacho que te parezca correcto. Si aciertas, el tacho se marcará en verde y aparecerá una explicación.</div>
        </aside>
      </main>
    </div>
  );
}
