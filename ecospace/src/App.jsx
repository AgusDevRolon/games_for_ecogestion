// src/App.jsx
import React from 'react';
import Shooter from './components/Shooter';
import './styles.css';

export default function App() {
  return (
    <div className="app-wrap">
      <header className="app-header">
        <div>
          <h1 className="app-title">ECOspace</h1>
          <p className="app-sub">Defiende la base — Space Invaders educativo</p>
        </div>
        <div className="meta">
          <small>Proyecto: ECOspace · Demo</small>
        </div>
      </header>

      <main className="app-main">
        <Shooter />
      </main>

      <footer className="app-footer">
        <span>Desarrollado con ♥ — Controles: ← → / A D • SPACE disparo • P/Esc pausa • R reiniciar</span>
      </footer>
    </div>
  );
}
