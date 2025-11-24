import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerCategorias, obtenerLugaresPorCategoria, agregarFavorito } from "../services/api";
import "./Intereses.css";

function Intereses() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  // Estado del modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [lugaresCategoria, setLugaresCategoria] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [lugaresSeleccionados, setLugaresSeleccionados] = useState(new Set());

  // Cargar categorías al montar
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await obtenerCategorias();
      
      if (data.success) {
        setCategorias(data.categorias);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirCategoria = async (categoria) => {
    try {
      setCategoriaSeleccionada(categoria);
      setMostrarModal(true);
      setIndiceActual(0);
      
      const data = await obtenerLugaresPorCategoria(categoria.id);
      
      if (data.success) {
        setLugaresCategoria(data.lugares);
      }
    } catch (err) {
      console.error('Error al cargar lugares de categoría:', err);
    }
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setCategoriaSeleccionada(null);
    setLugaresCategoria([]);
    setIndiceActual(0);
  };

  const handleSiguiente = () => {
    if (indiceActual < lugaresCategoria.length - 1) {
      setIndiceActual(indiceActual + 1);
    }
  };

  const handleAnterior = () => {
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
    }
  };

  const handleToggleSeleccion = (lugarId) => {
    const nuevaSeleccion = new Set(lugaresSeleccionados);
    if (nuevaSeleccion.has(lugarId)) {
      nuevaSeleccion.delete(lugarId);
    } else {
      nuevaSeleccion.add(lugarId);
    }
    setLugaresSeleccionados(nuevaSeleccion);
  };

  const handleContinuar = async () => {
    const usuario = localStorage.getItem("usuario");
    
    if (!usuario) {
      alert("Debes iniciar sesión");
      navigate("/login");
      return;
    }

    const usuarioObj = JSON.parse(usuario);
    setGuardando(true);

    try {
      if (lugaresSeleccionados.size > 0) {
        const promises = Array.from(lugaresSeleccionados).map(lugarId => {
          return agregarFavorito(usuarioObj.id, lugarId);
        });

        await Promise.all(promises);
        console.log('✅ Favoritos guardados exitosamente');
      }
      navigate("/foryou");
    } catch (err) {
      console.error('Error al guardar intereses:', err);
      alert('❌ Hubo un error al guardar tus intereses. Por favor intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const lugarActual = lugaresCategoria[indiceActual];

  return (
    <div className="intereses-container">
      <div className="background-gradient"></div>
      
      {/* Header */}
      <header className="intereses-header">
        <div className="logo">
          <div className="mountain"></div>
          <div className="logo-text">
            <span className="black">Pacha</span>
            <span className="orange">Qutec</span>
          </div>
        </div>
        <div className="progress-indicator">
          <div className="progress-bar">
            <div className="progress-fill" style={{width: '50%'}}></div>
          </div>
          <span>Personalización</span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="intereses-main">
        <div className="container">
          <div className="titulo-section">
            <div className="badge">🎯 Personaliza tu experiencia</div>
            <h1>Explora por categorías</h1>
            <p>Selecciona categorías para descubrir lugares que te interesen</p>
            {lugaresSeleccionados.size > 0 && (
              <div className="selection-counter">
                ✅ {lugaresSeleccionados.size} lugar{lugaresSeleccionados.size !== 1 ? 'es' : ''} seleccionado{lugaresSeleccionados.size !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Grid de categorías */}
          {loading ? (
            <p style={{textAlign: 'center', color: 'white', fontSize: '1.2rem'}}>⏳ Cargando categorías...</p>
          ) : (
            <div className="opciones-grid">
              {categorias.map((categoria, index) => (
                <div 
                  key={categoria.id}
                  className="opcion-card"
                  onClick={() => handleAbrirCategoria(categoria)}
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="card-image-container" style={{
                    background: `linear-gradient(135deg, ${categoria.color}dd, ${categoria.color}aa)`
                  }}>
                    <div className="categoria-icon-grande">
                      {categoria.icono}
                    </div>
                    {/* Overlay visual */}
                    <div className="image-overlay"></div>
                  </div>

                  <div className="card-content">
                    <div className="card-border"></div>
                    <h3>{categoria.nombre}</h3>
                    <p>{categoria.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info card */}
          <div className="info-card">
            <div className="info-icon">💡</div>
            <div className="info-content">
              <h4>Explora y selecciona tus favoritos</h4>
              <p>Haz clic en cualquier categoría para explorar lugares. Los que selecciones se agregarán a tus favoritos automáticamente.</p>
            </div>
          </div>

          {/* Botón continuar */}
          <div className="continuar-section">
            <button 
              className={`btn-continuar ${guardando ? 'loading' : ''}`}
              onClick={handleContinuar}
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <div className="spinner"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="btn-text">🚀 Continuar a ForYou</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
            
            <button 
              className="btn-skip"
              onClick={() => navigate("/foryou")}
              disabled={guardando}
            >
              Saltar por ahora
            </button>
          </div>
        </div>
      </main>

      {/* Modal para explorar lugares */}
      {mostrarModal && lugarActual && (
        <div className="intereses-modal-overlay" onClick={handleCerrarModal}>
          <div className="intereses-modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Header del modal */}
            <div className="intereses-modal-header">
              <h2>{categoriaSeleccionada?.nombre}</h2>
              <button className="btn-cerrar-modal" onClick={handleCerrarModal}>✕</button>
            </div>

            {/* Contenido del lugar */}
            <div className="intereses-modal-body">
              <div className="lugar-modal-image">
                <img src={lugarActual.imagen_url} alt={lugarActual.nombre} />
                <div className="lugar-contador">
                  {indiceActual + 1} / {lugaresCategoria.length}
                </div>
                {/* Degradado sobre la imagen para mejor lectura */}
                <div className="lugar-overlay-gradient"></div>
              </div>

              <div className="lugar-modal-info">
                <h3>{lugarActual.nombre}</h3>
                <p>{lugarActual.descripcion}</p>
                
                <button
                  className={`btn-seleccionar ${lugaresSeleccionados.has(lugarActual.id) ? 'seleccionado' : ''}`}
                  onClick={() => handleToggleSeleccion(lugarActual.id)}
                >
                  {lugaresSeleccionados.has(lugarActual.id) ? '❤️ Agregado a Favoritos' : '🤍 Agregar a Favoritos'}
                </button>
              </div>
            </div>

            {/* Navegación */}
            <div className="intereses-modal-navigation">
              <button
                className="btn-nav anterior"
                onClick={handleAnterior}
                disabled={indiceActual === 0}
              >
                ← Anterior
              </button>
              <button
                className="btn-nav siguiente"
                onClick={handleSiguiente}
                disabled={indiceActual === lugaresCategoria.length - 1}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="intereses-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-small">
                <div className="mountain-small"></div>
                <div className="logo-text">
                  <span className="black">Pacha</span>
                  <span className="orange">Qutec</span>
                </div>
              </div>
              <p>Tu guía personal de Arequipa</p>
            </div>
            <div className="footer-info">
              <p>
                Proyecto académico - DBP 2025<br />
                Copyright© Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Intereses;