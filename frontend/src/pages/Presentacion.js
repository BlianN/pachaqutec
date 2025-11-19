import React from "react";
import { useNavigate } from "react-router-dom";
import "./Presentacion.css";

function Presentacion() {
  const navigate = useNavigate();

  return (
    <div className="presentacion-container">
      {/* Header elegante */}
      <header className="presentacion-header">
        <div className="logo">
          <div className="mountain"></div>
          <div className="logo-text">
            <span className="black">Pacha</span>
            <span className="orange">Qutec</span>
          </div>
        </div>
        <button 
          className="btn-iniciar-sesion"
          onClick={() => navigate("/login")}
        >
          Iniciar Sesión
        </button>
      </header>

      {/* Hero section con imagen espectacular */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨ Descubre Arequipa como nunca antes</span>
          </div>
          
          <h1 className="hero-title">
            Vive la magia de la <span className="highlight">Ciudad Blanca</span>
          </h1>
          
          <p className="hero-description">
            Tu compañero inteligente para explorar los secretos mejor guardados de Arequipa. 
            Rutas personalizadas, experiencias únicas y recuerdos inolvidables.
          </p>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Lugares únicos</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Asistente virtual</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Personalizado</span>
            </div>
          </div>

          <div className="hero-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate("/login")}
            >
              🗺️ Comenzar mi aventura
            </button>
            <button 
              className="btn-secondary"
              onClick={() => document.getElementById('equipo').scrollIntoView({ behavior: 'smooth' })}
            >
              👥 Conocer al equipo
            </button>
          </div>

          <div className="scroll-indicator">
            <span>Desliza para descubrir</span>
            <div className="arrow-down"></div>
          </div>
        </div>
      </section>

      {/* Sección del equipo */}
      <section id="equipo" className="equipo-section">
        <div className="container">
          <div className="section-header">
            <h2>El corazón detrás de PachaQutec</h2>
            <p>Un equipo de estudiantes apasionados por transformar el turismo en Arequipa</p>
          </div>
          
          <div className="equipo-grid">
            <div className="integrante-card">
              <div className="integrante-header">
                <div className="avatar">DM</div>
                <div className="integrante-info">
                  <h3>Diego Miguel Calancho</h3>
                  <span className="role">Desarrollador Frontend</span>
                </div>
              </div>
              <p>Creando experiencias digitales que enamoran a primera vista</p>
            </div>
            
            <div className="integrante-card">
              <div className="integrante-header">
                <div className="avatar">MP</div>
                <div className="integrante-info">
                  <h3>Mijael Pol Escobar</h3>
                  <span className="role">Especialista en IA</span>
                </div>
              </div>
              <p>Dando inteligencia a cada recomendación y ruta personalizada</p>
            </div>
            
            <div className="integrante-card">
              <div className="integrante-header">
                <div className="avatar">RF</div>
                <div className="integrante-info">
                  <h3>Rodrigo Fredy Sulla</h3>
                  <span className="role">Diseñador UX/UI</span>
                </div>
              </div>
              <p>Diseñando interfaces que se sienten como en casa</p>
            </div>
            
            <div className="integrante-card">
              <div className="integrante-header">
                <div className="avatar">AR</div>
                <div className="integrante-info">
                  <h3>Alessandro Raul Paredes</h3>
                  <span className="role">Arquitecto de Software</span>
                </div>
              </div>
              <p>Construyendo los cimientos para una experiencia sin igual</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de características */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>¿Por qué elegir PachaQutec?</h2>
            <p>Más que una app, es tu compañero de viaje personal</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Recomendaciones inteligentes</h3>
              <p>IA que aprende de tus gustos para sugerirte experiencias que realmente te van a encantar</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>Asistente virtual 24/7</h3>
              <p>Resuelve tus dudas en tiempo real y te ayuda a planificar cada detalle de tu aventura</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏔️</div>
              <h3>Enfoque local auténtico</h3>
              <p>Descubre Arequipa a través de los ojos de quienes realmente la conocen</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🕒</div>
              <h3>Adaptado a tu tiempo</h3>
              <p>Ya sea un día o una semana, creamos rutas perfectas para tu disponibilidad</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>¿Listo para tu próxima aventura?</h2>
            <p>Únete a miles de viajeros que ya descubrieron Arequipa con nosotros</p>
            <button 
              className="btn-cta"
              onClick={() => navigate("/login")}
            >
              🚀 Empezar ahora
            </button>
            <div className="cta-stats">
              <span>✅ +2,000 viajeros satisfechos</span>
              <span>⭐ 4.8/5 rating</span>
              <span>🏆 Proyecto académico destacado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="presentacion-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <div className="mountain"></div>
                <div className="logo-text">
                  <span className="black">Pacha</span>
                  <span className="orange">Qutec</span>
                </div>
              </div>
              <p className="tagline">Tu guía personal para descubrir Arequipa</p>
            </div>
            
            <div className="footer-info">
              <div className="university-info">
                <h4>Universidad Católica San Pablo</h4>
                <p>Proyecto académico - Desarrollo Basado en Plataformas</p>
              </div>
              <div className="copyright">
                <p>© 2025 PachaQutec. Todos los derechos reservados.</p>
                <p>Hecho con ❤️ en Arequipa, Perú</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Presentacion;