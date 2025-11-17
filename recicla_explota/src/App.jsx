import React from "react";
import Conveyor from "./Conveyor.jsx";

export default function App() {
  return (
    <div className="app-wrap">
      <header className="header card">
        <div className="title">
          <h1>Recicla / ¡Explota!</h1>
          <p className="subtitle">Clasifica los residuos correctamente antes de que exploten</p>
        </div>
        <div className="meta">
          <small>Proyecto de mejora · React + Vite</small>
        </div>
      </header>

      <main>
        <Conveyor />
      </main>

      <footer className="footer muted">
        <small>Hecho con 💚 — Reemplaza assets en src/assets si quieres otras imágenes.</small>
      </footer>
    </div>
  );
}
