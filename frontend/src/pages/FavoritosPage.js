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

  const handleEliminarFavorito = async (favoritoId, lugarId) => {
    try {

      await eliminarFavorito(favoritoId);
      setFavoritos(prev => prev.filter(f => f.favorito_id !== favoritoId));
    } catch (err) {
      console.error('Error al eliminar favorito:', err);
      alert('Error al eliminar favorito');
    }
  };

  const handleLugarClick = (lugar) => {

    console.log("Ver detalles del lugar:", lugar);
  };

  return (
    <div className="favorites-layout">
      {/* Header */}
      <header className="favorites-header">
        <div className="header-content">

          <div className="brand-logo">
            <div className="mountain-icon"></div>
            <h1>
              <span className="brand-pacha">Pacha</span>
              <span className="brand-qutec">Qutec</span>
            </h1>
          </div>

          <div className="header-center">
            <h2 className="page-title">Mi Lista de Deseos</h2>
          </div>
          <button onClick={handleVolver} className="btn-back">
            <span>←</span> Volver
          </button>
        </div>
      </header>

      <main className="favorites-main">
        {/* Estado: No logueado */}
        {!usuarioLogueado && (
          <div className="state-box">
            <div className="icon-large">🔒</div>
            <h3>Colección Privada</h3>
            <p>Inicia sesión para ver tus destinos guardados.</p>
          </div>
        )}
        
        {/* Estado: Cargando */}
        {usuarioLogueado && loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Cargando tu colección...</p>
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
            <p>Explora lugares y dale al corazón para guardarlos aquí.</p>
            <button onClick={handleVolver} className="btn-primary-small">Explorar Lugares</button>
          </div>
        )}
        
        {/* Grid de Favoritos Estilo Wishlist */}
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
                  
                  {/* Botón Eliminar Flotante Elegante */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarFavorito(favorito.favorito_id, favorito.id);
                    }}
                    className="btn-remove"
                    title="Eliminar de favoritos"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                  
                  <div className="fav-overlay">
                    <span className="category-badge">{favorito.categoria}</span>
                  </div>
                </div>
                
                <div className="fav-content">
                  <h3>{favorito.nombre}</h3>
                  <p className="fav-desc">
                    {favorito.descripcion 
                      ? (favorito.descripcion.length > 80 ? favorito.descripcion.substring(0, 80) + "..." : favorito.descripcion)
                      : "Un destino increíble esperando por ti."}
                  </p>
                  <div className="fav-footer">
                    <span className="action-link">Ver detalles &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="favorites-footer">
        <p>© 2025 PachaQutec | UCSP</p>
      </footer>
    </div>
  );
}

export default FavoritosPage;