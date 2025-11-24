import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerUsuarios, obtenerLugares, obtenerFavoritos, agregarFavorito, eliminarFavorito, obtenerResenas, crearResena, obtenerCategorias, obtenerLugaresPorCategoria } from "../services/api";
import "./ForYouPage.css";

function ForYouPage() {
  const navigate = useNavigate();

  // Obtener usuario logueado
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  
  // Estado para almacenar lugares del backend
  const [lugaresBackend, setLugaresBackend] = useState([]);
  const [loadingLugares, setLoadingLugares] = useState(true);
  const [errorLugares, setErrorLugares] = useState(null);

  // Estado para almacenar favoritos del backend
  const [favoritosBackend, setFavoritosBackend] = useState([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);
  const [errorFavoritos, setErrorFavoritos] = useState(null);

  // IDs de lugares favoritos
  const [favoritosIds, setFavoritosIds] = useState(new Set());

  // Estado para almacenar reseñas del backend
  const [resenasBackend, setResenasBackend] = useState([]);
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [errorResenas, setErrorResenas] = useState(null);
  
  // Estado para modal de reseña
  const [mostrarModalResena, setMostrarModalResena] = useState(false);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [nuevaResena, setNuevaResena] = useState({
    texto: '',
    calificacion: 5
  });

  // Estado para categorías
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [categoriaExpandida, setCategoriaExpandida] = useState(null);
  const [lugaresPorCategoria, setLugaresPorCategoria] = useState({});

  const cargarFavoritos = useCallback(async () => {
    if (!usuarioLogueado) return;
    
    try {
      setLoadingFavoritos(true);
      setErrorFavoritos(null);
      const data = await obtenerFavoritos(usuarioLogueado.id);
      
      if (data.success) {
        const favoritos = data.favoritos || [];
        setFavoritosBackend(favoritos);
        const ids = new Set(favoritos.map(f => f.id));
        setFavoritosIds(ids);
      } else {
        setErrorFavoritos('Error al cargar favoritos');
      }
    } catch (err) {
      setErrorFavoritos('No se pudo cargar favoritos');
      console.error('Error:', err);
    } finally {
      setLoadingFavoritos(false);
    }
  }, [usuarioLogueado]);


  const cargarResenas = useCallback(async () => {
    if (!usuarioLogueado) return;
    
    try {
      setLoadingResenas(true);
      setErrorResenas(null);
      const data = await obtenerResenas(usuarioLogueado.id);
      
      if (data.success) {
        const resenas = data.resenas || [];
        setResenasBackend(resenas);

      } else {
        setErrorResenas('Error al cargar reseñas');
      }
    } catch (err) {
      setErrorResenas('No se pudo cargar reseñas');
      console.error('Error:', err);
    } finally {
      setLoadingResenas(false);
    }
  }, [usuarioLogueado]);

  const cargarCategorias = useCallback(async () => {
    try {
      setLoadingCategorias(true);
      const data = await obtenerCategorias();
      
      if (data.success) {
        setCategorias(data.categorias);
        const lugaresPromises = data.categorias.map(cat => 
          obtenerLugaresPorCategoria(cat.id)
        );
        const lugaresResults = await Promise.all(lugaresPromises);
        
        const lugaresMap = {};
        data.categorias.forEach((cat, index) => {
          if (lugaresResults[index].success) {
            const lugaresBrutos = lugaresResults[index].lugares;

            // FILTRO ANTI-DUPLICADOS
            const lugaresUnicos = lugaresBrutos.filter((lugar, indice, self) => 
              indice === self.findIndex((t) => (
                t.nombre.trim().toLowerCase() === lugar.nombre.trim().toLowerCase()
              ))
            );

            lugaresMap[cat.id] = lugaresUnicos;
          }
        });
        setLugaresPorCategoria(lugaresMap);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoadingCategorias(false);
    }
  }, []);

  // Cargar usuario logueado
  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      setUsuarioLogueado(JSON.parse(usuario));
    }
  }, []);

  // Obtener lugares del backend al cargar la página
  useEffect(() => {
    const cargarLugares = async () => {
      try {
        setLoadingLugares(true);
        setErrorLugares(null);
        const data = await obtenerLugares();
        
        if (data.success) {
          setLugaresBackend(data.lugares);
        } else {
          setErrorLugares('Error al cargar lugares del servidor');
        }
      } catch (err) {
        setErrorLugares('No se pudo conectar con el servidor');
        console.error('Error:', err);
      } finally {
        setLoadingLugares(false);
      }
    };

    cargarLugares();
  }, []);

  // Obtener favoritos cuando hay usuario logueado
  useEffect(() => {
    if (usuarioLogueado && usuarioLogueado.id) {
      cargarFavoritos();
    }
  }, [usuarioLogueado, cargarFavoritos]);

  // Obtener reseñas cuando hay usuario logueado
  useEffect(() => {
    if (usuarioLogueado && usuarioLogueado.id) {
      cargarResenas();
    }
  }, [usuarioLogueado, cargarResenas]);

  // Cargar categorías al montar
  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("recordarSesion"); // Limpiar preferencia
    navigate("/login");
  };

  const handleToggleFavorito = async (lugarId) => {
    if (!usuarioLogueado) {
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    try {
      if (favoritosIds.has(lugarId)) {
        // Eliminar de favoritos
        const favorito = favoritosBackend.find(f => f.id === lugarId);
        if (favorito) {
          await eliminarFavorito(favorito.favorito_id);
          // Actualizar estado local
          setFavoritosIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(lugarId);
            return newSet;
          });
          setFavoritosBackend(prev => prev.filter(f => f.id !== lugarId));
        }
      } else {
        // Agregar a favoritos
        const data = await agregarFavorito(usuarioLogueado.id, lugarId);
        if (data.success) {
          // Recargar favoritos
          await cargarFavoritos();
        }
      }
    } catch (err) {
      console.error('Error al toggle favorito:', err);
      alert('Error al actualizar favorito');
    }
  };

  const handleAbrirModalResena = (lugar) => {
    if (!usuarioLogueado) {
      alert('Debes iniciar sesión para escribir reseñas');
      return;
    }
    setLugarSeleccionado(lugar);
    setMostrarModalResena(true);
    setNuevaResena({ texto: '', calificacion: 5 });
  };

  const handleCerrarModalResena = () => {
    setMostrarModalResena(false);
    setLugarSeleccionado(null);
    setNuevaResena({ texto: '', calificacion: 5 });
  };

  const handleCrearResena = async (e) => {
    e.preventDefault();
    
    if (!nuevaResena.texto.trim()) {
      alert('Por favor escribe tu reseña');
      return;
    }

    try {
      const data = await crearResena(
        usuarioLogueado.id,
        lugarSeleccionado.id,
        nuevaResena.texto,
        nuevaResena.calificacion
      );
      
      if (data.success) {
        alert('¡Reseña creada exitosamente!');
        handleCerrarModalResena();
        await cargarResenas();
      }
    } catch (err) {
      console.error('Error al crear reseña:', err);
      alert('Error al crear reseña');
    }
  };

  return (
    <div className="foryou-container">
      {/* Header con navegación */}
      <header className="foryou-header">
        <div className="logo">
          <div className="mountain"></div>
          <h1>
            <span className="black">Pacha</span>
            <span className="orange">Qutec</span>
          </h1>
        </div>

        <nav className="navigation">
          <button onClick={() => navigate("/foryou")} className="nav-link">Inicio</button>
          <button onClick={() => navigate("/lugares")} className="nav-link">Lugares</button>
          <button onClick={() => navigate("/favoritos")} className="nav-link">Favoritos</button>
          <button 
            onClick={() => navigate("/rutas")} 
            className="nav-link"
            title="Ver mapa de rutas"
          >
          Rutas
          </button>
          <button onClick={() => navigate("/reseñas")} className="nav-link">Reseñas</button>
          <button onClick={() => navigate("/contactanos")} className="nav-link">Contáctanos</button>
          {usuarioLogueado && (
            <span className="user-welcome">
              Hola, <strong>{usuarioLogueado.nombre}</strong>
            </span>
          )}
          <button 
            onClick={() => navigate("/rdf")} 
            className="nav-link nav-rdf"
            title="Ver datos en formato RDF"
          >
            🌐 RDF
          </button>
          <button onClick={handleLogout} className="nav-link logout-btn">
            Salir
          </button>
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="foryou-main">
        {/* Banner Cañon del Colca */}
        <section 
          className="banner-colca-con-imagen"
          style={{ 
            backgroundImage: `url(https://www.peru.travel/Contenido/Atractivo/Imagen/es/8/1.2/Principal/Ca%C3%B1on%20del%20Colca.jpg)`
          }}
        >
          <div className="banner-overlay">
            <div className="banner-content-con-imagen">
              <span className="banner-subtitle">Destino Destacado</span>
              <h1>Cañón del Colca</h1>
              <button className="ver-mas-btn-con-imagen">Explorar ahora</button>
            </div>
          </div>
        </section>

        {/* Sección Lugares por Categorías */}
        <section className="lugares-section">
          <div className="section-header-container">
             <h2 className="section-title">🏛️ Descubre Arequipa</h2>
             <p className="section-subtitle">Explora los tesoros escondidos de la ciudad blanca</p>
          </div>
          
          {loadingCategorias && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando experiencias...</p>
            </div>
          )}
          
          {!loadingCategorias && categorias.length > 0 && (
            <div className="categorias-container">
              {categorias.map((categoria) => (
                <div key={categoria.id} className={`categoria-section ${categoriaExpandida === categoria.id ? 'expanded' : ''}`}>

                  <div 
                    className="categoria-header"
                    onClick={() => setCategoriaExpandida(
                      categoriaExpandida === categoria.id ? null : categoria.id
                    )}
                    style={{
                      borderLeft: `4px solid ${categoria.color || '#ff6b00'}`
                    }}
                  >
                    <div className="categoria-info">
                      <span className="categoria-icono">
                        {categoria.icono}
                      </span>
                      <div>
                        <h3 className="categoria-nombre">{categoria.nombre}</h3>
                        <p className="categoria-descripcion">{categoria.descripcion}</p>
                      </div>
                    </div>
                    <div className="categoria-toggle">
                      <span className="lugares-count">
                        {lugaresPorCategoria[categoria.id]?.length || 0} lugares
                      </span>
                      <span className={`toggle-icon ${categoriaExpandida === categoria.id ? 'rotated' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Lugares de la categoría (expandible) */}
                  <div className={`categoria-lugares-wrapper ${categoriaExpandida === categoria.id ? 'open' : ''}`}>
                    {lugaresPorCategoria[categoria.id] && (
                        <div className="lugares-grid categoria-lugares-grid">
                        {lugaresPorCategoria[categoria.id].map((lugar) => (
                            <div key={lugar.id} className="lugar-card">
                            {/* Botón de favorito */}
                            <button
                                className={`favorito-btn ${favoritosIds.has(lugar.id) ? 'is-favorito' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorito(lugar.id);
                                }}
                                title={favoritosIds.has(lugar.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                            >
                                {favoritosIds.has(lugar.id) ? '❤️' : '🤍'}
                            </button>
                            
                            <div className="lugar-image">
                                <img src={lugar.imagen_url} alt={lugar.nombre} loading="lazy" />
                                <div className="lugar-overlay-gradient"></div>
                            </div>
                            
                            <div className="lugar-content">
                                <h3>{lugar.nombre}</h3>
                                <p className="lugar-desc">
                                {lugar.descripcion}
                                </p>
                                <button
                                className="review-btn"
                                onClick={() => handleAbrirModalResena(lugar)}
                                >
                                ✍️ Escribir reseña
                                </button>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
      
      {/* Asistente Virtual */}
      <div className="asistente-virtual-fijo">
        <div className="asistente-tooltip">
          ¿Necesitas ayuda con tu viaje?
        </div>
        <button className="asistente-btn">
          💬
        </button>
      </div>
      
      {/* Modal para crear reseña */}
      {mostrarModalResena && (
        <div className="modal-overlay" onClick={handleCerrarModalResena}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <h2>✍️ Nueva Reseña</h2>
                <button className="modal-close" onClick={handleCerrarModalResena}>&times;</button>
            </div>
            
            <p className="modal-subtitle">Cuéntanos tu experiencia en <strong>{lugarSeleccionado?.nombre}</strong></p>
            
            <form onSubmit={handleCrearResena}>
              <div className="form-group">
                <label>Calificación</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setNuevaResena({...nuevaResena, calificacion: star})}
                      className={star <= nuevaResena.calificacion ? 'star filled' : 'star'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Tu opinión</label>
                <textarea
                  value={nuevaResena.texto}
                  onChange={(e) => setNuevaResena({...nuevaResena, texto: e.target.value})}
                  placeholder="¿Qué fue lo que más te gustó? ¿Qué se podría mejorar?"
                  rows={5}
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCerrarModalResena}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                >
                  Publicar reseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="foryou-footer">
        <div className="footer-content">
            <div className="footer-logo">
                <span className="black">Pacha</span><span className="orange">Qutec</span>
            </div>
            <p>
            Desarrollo Basado en Plataformas - Universidad Católica San Pablo
            </p>
            <p className="copyright">
            © 2025 Todos los derechos reservados.
            </p>
        </div>
      </footer>
    </div>
  );
}

export default ForYouPage;