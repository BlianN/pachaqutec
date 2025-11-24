import React from "react";
import { useNavigate } from "react-router-dom";
import "./Presentacion.css";

function Presentacion() {
  const navigate = useNavigate();

  return (
    <div className="presentacion-container">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap');`}
      </style>

      <header className="presentacion-header">
        <div className="header-content">
          <div className="logo">
            <div className="mountain-icon"></div>
            <div className="logo-text">
              <span className="text-dark">Pacha</span>
              <span className="text-orange">Qutec</span>
            </div>
          </div>
          <button 
            className="btn-iniciar-sesion"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <div className="hero-badge animate-float">
            <span>✨ Descubre Arequipa nivel legendario</span>
          </div>
          
          <h1 className="hero-title">
            Vive la magia de la <br />
            <span className="highlight-text">Ciudad Blanca</span>
          </h1>
          
          <p className="hero-description">
            Tu compañero inteligente para explorar los secretos de Arequipa. 
            Rutas con IA, experiencias únicas y recuerdos que duran para siempre.
          </p>

          <div className="hero-stats animate-fade-up">
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Destinos</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">AI</span>
              <span className="stat-label">Powered</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Arequipeño</span>
            </div>
          </div>

          <div className="hero-actions">
            <button 
              className="btn-primary-glow"
              onClick={() => navigate("/login")}
            >
              🚀 Comenzar mi aventura
            </button>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="gradient-title">¿Por qué PachaQutec?</h2>
            <p>No es solo una app, es tu "pata" digital en Arequipa.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="icon-wrapper color-1">🎯</div>
              <h3>Rutas IA</h3>
              <p>Nuestro algoritmo aprende qué te gusta y te arma el plan perfecto. Sin rodeos.</p>
            </div>

            <div className="feature-card">
              <div className="icon-wrapper color-2">🤖</div>
              <h3>Asistente 24/7</h3>
              <p>¿Te perdiste? ¿Hambre a las 2 AM? El asistente virtual te salva al toque.</p>
            </div>

            <div className="feature-card">
              <div className="icon-wrapper color-3">🏔️</div>
              <h3>Local Vibe</h3>
              <p>Aléjate de las trampas para turistas. Te llevamos donde comen los arequipeños.</p>
            </div>

            <div className="feature-card">
              <div className="icon-wrapper color-4">⚡</div>
              <h3>A tu ritmo</h3>
              <p>¿Tienes 2 horas o 2 semanas? Optimizamos tu tiempo al máximo.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-glass-panel">
            <div className="cta-content">
              <h2>¿Listo para tu próxima aventura?</h2>
              <p>Únete a los viajeros que ya están descubriendo el verdadero Arequipa.</p>
              <button 
                className="btn-white-glow"
                onClick={() => navigate("/login")}
              >
                Crear cuenta gratis
              </button>
            </div>
            <div className="cta-decoration">
              <div className="circle c1"></div>
              <div className="circle c2"></div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="presentacion-footer">
        <div className="container footer-flex">
          <div className="footer-brand">
            <span className="footer-logo">PachaQutec</span>
            <p>© 2025. Hecho con ❤️ y un buen Adobo.</p>
          </div>
          <div className="footer-links">
            <span>UCSP</span>
            <span>Proyecto DBP</span>
            <span>Arequipa, Perú</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Presentacion;