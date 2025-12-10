import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerFavoritos, eliminarFavorito } from "../services/api";
import "./FavoritosPage.css";

function FavoritosPage() {
  const navigate = useNavigate();
  
  // Estados
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario y favoritos
  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const usuarioObj = JSON.parse(usuario);
      setUsuarioLogueado(usuarioObj);
      cargarFavoritos(usuarioObj.id);
    } else {
      setLoading(false);
    }
  }, []);

  const cargarFavoritos = async (usuarioId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerFavoritos(usuarioId);
      
      if (data.success) {
        setFavoritos(data.favoritos || []);
      } else {
        setError('Error al cargar favoritos');
      }
    } catch (err) {
      setError('No se pudo cargar favoritos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate("/foryou");
  };

  const handleEliminarFavorito = async (favoritoId) => {
    if(!window.confirm("¿Deseas eliminar este lugar de tu colección?")) return;

    try {
      await eliminarFavorito(favoritoId);
      setFavoritos(prev => prev.filter(f => f.favorito_id !== favoritoId));
    } catch (err) {
      console.error('Error al eliminar favorito:', err);
      // Fallback visual
      setFavoritos(prev => prev.filter(f => f.favorito_id !== favoritoId));
    }
  };

  const handleLugarClick = (lugar) => {
    console.log("Navegar a:", lugar.nombre);
  };

  return (
    <div className="favorites-layout">
      {/* FONDO SUTIL */}
      <div className="favorites-bg-layer"></div>

      {/* HEADER CORREGIDO */}
      <header className="favorites-header">
        <div className="header-content">
          <div className="brand-logo" onClick={handleVolver}>
            <div className="mountain-icon"></div>
            <h1>
              <span className="brand-pacha">Pacha</span>
              <span className="brand-qutec">Qutec</span>
            </h1>
          </div>

          <div className="header-center">
            <h2 className="page-title">Mi Colección</h2>
          </div>
          
          <button onClick={handleVolver} className="btn-back">
            <span>←</span> Volver
          </button>
        </div>
      </header>

      <main className="favorites-main">
        {/* TITULO DE LA SECCIÓN */}
        <div className="main-title-section">
            <h1>Tus Destinos Guardados</h1>
            <p>Lugares que te inspiran a viajar.</p>
        </div>

        {/* Estado: No logueado */}
        {!usuarioLogueado && (
          <div className="state-box">
            <div className="icon-large">🔒</div>
            <h3>Colección Privada</h3>
            <p>Inicia sesión para ver tus destinos guardados.</p>
            <button onClick={() => navigate("/login")} className="btn-primary-small">Iniciar Sesión</button>
          </div>
        )}
        
        {/* Estado: Cargando */}
        {usuarioLogueado && loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Recuperando tus tesoros...</p>
          </div>
        )}
        
        {/* Estado: Error */}
        {usuarioLogueado && error && (
          <div className="state-box error">
            <div className="icon-large">⚠️</div>
            <h3>Algo salió mal</h3>
            <p>{error}</p>
          </div>
        )}
        
        {/* Estado: Vacío */}
        {usuarioLogueado && !loading && !error && favoritos.length === 0 && (
          <div className="state-box empty">
            <div className="icon-large">💔</div>
            <h3>Tu lista está vacía</h3>
            <p>Explora lugares y guárdalos para planear tu próxima aventura.</p>
            <button onClick={() => navigate("/lugares")} className="btn-primary-small">Explorar Lugares</button>
          </div>
        )}
        
        {/* Grid de Favoritos */}
        {usuarioLogueado && !loading && !error && favoritos.length > 0 && (
          <div className="favorites-grid">
            {favoritos.map((favorito) => (
              <div 
                key={favorito.favorito_id} 
                className="fav-card"
                onClick={() => handleLugarClick(favorito)}
              >
                <div className="fav-image-container">
                  <img src={favorito.imagen_url} alt={favorito.nombre} loading="lazy" />
                  <div className="fav-gradient-overlay"></div>
                  
                  <div className="card-top-badges">
                     <span className="category-badge">{favorito.categoria}</span>
                  </div>

                  {/* Botón Eliminar Flotante */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarFavorito(favorito.favorito_id);
                    }}
                    className="btn-remove-fav"
                    title="Eliminar de favoritos"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="fav-content">
                  <h3>{favorito.nombre}</h3>
                  <p className="fav-desc">
                    {favorito.descripcion 
                      ? (favorito.descripcion.length > 70 ? favorito.descripcion.substring(0, 70) + "..." : favorito.descripcion)
                      : "Un destino increíble esperando por ti."}
                  </p>
                  <div className="fav-footer">
                    <span className="view-more">Ver detalles →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="favorites-footer">
        <p>© 2025 PachaQutec | Arequipa</p>
      </footer>
    </div>
  );
}

export default FavoritosPage;