import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerResenas } from "../services/api";
import "./ReseñasPage.css";

function ReseñasPage() {
  const navigate = useNavigate();
  
  // Estados
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [reseñas, setReseñas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario y reseñas
  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const usuarioObj = JSON.parse(usuario);
      setUsuarioLogueado(usuarioObj);
      cargarReseñas(usuarioObj.id);
    } else {
      setLoading(false);
    }
  }, []);

  const cargarReseñas = async (usuarioId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerResenas(usuarioId);
      
      if (data.success) {
        setReseñas(data.resenas || []);
      } else {
        setError('Error al cargar reseñas');
      }
    } catch (err) {
      setError('No se pudo cargar reseñas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate("/foryou");
  };

  return (
    <div className="reviews-layout">
      {/* Fondo Ambiental */}
      <div className="reviews-bg-layer"></div>

      {/* Header Glass Dark */}
      <header className="reviews-header">
        <div className="header-content">
          <div className="brand-logo" onClick={handleVolver}>
            <div className="mountain-icon"></div>
            <h1>
              <span className="brand-pacha">Pacha</span>
              <span className="brand-qutec">Qutec</span>
            </h1>
          </div>

          <div className="header-title-wrapper">
             <span className="header-subtitle">Diario de Viajes</span>
             <h2 className="page-title">Mis Reseñas</h2>
          </div>
          
          <button onClick={handleVolver} className="btn-back">
            <span>←</span> Volver
          </button>
        </div>
      </header>

      <main className="reviews-main">
        {/* TITULO DE SECCIÓN */}
        <div className="reviews-intro">
            <h1>Tu Historial de Aventuras</h1>
            <p>Revive tus experiencias y comparte tus memorias.</p>
        </div>

        {/* Estado: No logueado */}
        {!usuarioLogueado && (
          <div className="state-container">
            <div className="icon-large">🔒</div>
            <h3>Acceso Restringido</h3>
            <p>Inicia sesión para acceder a tu historial de reseñas.</p>
            <button onClick={() => navigate("/login")} className="btn-primary-small">Iniciar Sesión</button>
          </div>
        )}
        
        {/* Estado: Cargando */}
        {usuarioLogueado && loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Recuperando tus experiencias...</p>
          </div>
        )}
        
        {/* Estado: Error */}
        {usuarioLogueado && error && (
          <div className="state-container error">
            <div className="icon-large">⚠️</div>
            <h3>Hubo un problema</h3>
            <p>{error}</p>
          </div>
        )}
        
        {/* Estado: Sin reseñas */}
        {usuarioLogueado && !loading && !error && reseñas.length === 0 && (
          <div className="state-container empty">
            <div className="icon-large">📭</div>
            <h3>Aún no hay historias</h3>
            <p>¡Explora lugares y comparte tu experiencia con la comunidad!</p>
            <button onClick={() => navigate("/lugares")} className="btn-primary-small">Explorar Lugares</button>
          </div>
        )}
        
        {/* Lista de Reseñas - Diseño Dark Card */}
        {usuarioLogueado && !loading && !error && reseñas.length > 0 && (
          <div className="reviews-feed">
            {reseñas.map((reseña) => (
              <article key={reseña.id} className="review-card">
                
                {/* Columna Izquierda: Imagen del Lugar */}
                <div className="review-image-container">
                  <img 
                    src={reseña.lugar_imagen} 
                    alt={reseña.lugar_nombre}
                    className="review-place-img"
                    loading="lazy"
                  />
                  <div className="place-badge">Visitado</div>
                  <div className="overlay-gradient"></div>
                </div>

                {/* Columna Derecha: Contenido */}
                <div className="review-content">
                  <div className="review-header-card">
                    <h3 className="place-name">{reseña.lugar_nombre}</h3>
                    <span className="review-date">
                      {new Date(reseña.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="rating-display">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < reseña.calificacion ? "star filled" : "star empty"}>
                        ★
                      </span>
                    ))}
                    <span className="rating-pill">{reseña.calificacion}/5</span>
                  </div>

                  <div className="review-body">
                    <span className="quote-mark">“</span>
                    <p>{reseña.texto}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="reviews-footer">
        <p>© 2025 PachaQutec | Arequipa</p>
      </footer>
    </div>
  );
}

export default ReseñasPage;