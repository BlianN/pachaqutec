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

  // IDs de lugares favoritos (para marcar botones)
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
        // Cargar lugares de cada categoría
        const lugaresPromises = data.categorias.map(cat => 
          obtenerLugaresPorCategoria(cat.id)
        );
        const lugaresResults = await Promise.all(lugaresPromises);
        
        const lugaresMap = {};
        data.categorias.forEach((cat, index) => {
          if (lugaresResults[index].success) {
            lugaresMap[cat.id] = lugaresResults[index].lugares;
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
          <a href="#inicio" className="nav-link">Inicio</a>
          <a href="#lugares" className="nav-link">Lugares</a>
          <a href="#favoritos" className="nav-link">Favoritos</a>
          <a href="#contactanos" className="nav-link">Contáctanos</a>
          {usuarioLogueado && (
            <span style={{color: 'white', marginRight: '1rem'}}>
              👤 {usuarioLogueado.nombre}
            </span>
          )}
          <button 
            onClick={() => navigate("/rdf")} 
            className="nav-link nav-rdf"
            title="Ver datos en formato RDF"
          >
            🌐 Datos RDF
          </button>
          <button onClick={handleLogout} className="nav-link" style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit'}}>
            Cerrar sesión
          </button>
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="foryou-main">
        {/* Banner Cañon del Colca CON IMAGEN */}
        <section 
          className="banner-colca-con-imagen"
          style={{ 
            backgroundImage: `url(https://www.peru.travel/Contenido/Atractivo/Imagen/es/8/1.2/Principal/Ca%C3%B1on%20del%20Colca.jpg)`
          }}
        >
          <div className="banner-overlay">
            <div className="banner-content-con-imagen">
              <h1>Cañon del Colca</h1>
              <button className="ver-mas-btn-con-imagen">ver más</button>
            </div>
          </div>
        </section>

        {/* Línea divisoria */}
        <div className="divisor"></div>

        {/* Sección Lugares por Categorías */}
        <section className="lugares-section">
          <h2 className="section-title">🏛️ Descubre Arequipa</h2>
          
          {loadingCategorias && (
            <p style={{
              textAlign: 'center', 
              padding: '2rem',
              fontSize: '1.2rem',
              color: '#667eea'
            }}>
              ⏳ Cargando lugares turísticos...
            </p>
          )}
          
          {!loadingCategorias && categorias.length > 0 && (
            <div className="categorias-container">
              {categorias.map((categoria) => (
                <div key={categoria.id} className="categoria-section">
                  {/* Header de categoría */}
                  <div 
                    className="categoria-header"
                    onClick={() => setCategoriaExpandida(
                      categoriaExpandida === categoria.id ? null : categoria.id
                    )}
                    style={{
                      borderLeft: `4px solid ${categoria.color}`
                    }}
                  >
                    <div className="categoria-info">
                      <span className="categoria-icono" style={{fontSize: '2rem'}}>
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
                      <span className="toggle-icon">
                        {categoriaExpandida === categoria.id ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>

                  {/* Lugares de la categoría (expandible) */}
                  {categoriaExpandida === categoria.id && lugaresPorCategoria[categoria.id] && (
                    <div className="lugares-grid categoria-lugares-grid">
                      {lugaresPorCategoria[categoria.id].map((lugar) => (
                        <div key={lugar.id} className="lugar-card" style={{position: 'relative'}}>
                          {/* Botón de favorito */}
                          <button
                            onClick={() => handleToggleFavorito(lugar.id)}
                            style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              background: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              fontSize: '1.5rem',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                              transition: 'transform 0.2s',
                              zIndex: 10
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            title={favoritosIds.has(lugar.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                          >
                            {favoritosIds.has(lugar.id) ? '❤️' : '🤍'}
                          </button>
                          
                          <div className="lugar-image">
                            <img src={lugar.imagen_url} alt={lugar.nombre} />
                          </div>
                          <h3>{lugar.nombre}</h3>
                          <p style={{
                            color: '#666', 
                            fontSize: '0.9rem',
                            margin: '0.5rem 0',
                            lineHeight: '1.4',
                            padding: '0 1rem'
                          }}>
                            {lugar.descripcion}
                          </p>

                          {/* Botón Escribir reseña */}
                          <button
                            onClick={() => handleAbrirModalResena(lugar)}
                            style={{
                              width: 'calc(100% - 2rem)',
                              margin: '0.75rem 1rem 1rem',
                              padding: '0.5rem',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                          >
                            ✍️ Escribir reseña
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Línea divisoria */}
        <div className="divisor"></div>

        {/* Sección Tus favoritos */}
        <section className="favoritos-section">
          <h2 className="section-title">❤️ Tus Favoritos</h2>
          
          {!usuarioLogueado && (
            <p style={{
              textAlign: 'center', 
              padding: '2rem', 
              color: '#999',
              fontSize: '1.1rem'
            }}>
              🔒 Inicia sesión para ver tus favoritos
            </p>
          )}
          
          {usuarioLogueado && loadingFavoritos && (
            <p style={{
              textAlign: 'center', 
              padding: '2rem',
              fontSize: '1.2rem',
              color: '#667eea'
            }}>
              ⏳ Cargando tus favoritos...
            </p>
          )}
          
          {usuarioLogueado && errorFavoritos && (
            <div style={{
              background: '#fee',
              border: '2px solid #fcc',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1rem 0',
              color: '#c33'
            }}>
              ❌ {errorFavoritos}
            </div>
          )}
          
          {usuarioLogueado && !loadingFavoritos && !errorFavoritos && favoritosBackend.length === 0 && (
            <p style={{
              textAlign: 'center', 
              padding: '2rem', 
              color: '#999',
              fontSize: '1.1rem'
            }}>
              💔 No tienes favoritos aún. ¡Agrega algunos lugares!
            </p>
          )}
          
          {usuarioLogueado && !loadingFavoritos && !errorFavoritos && favoritosBackend.length > 0 && (
            <div className="favoritos-grid">
              {favoritosBackend.map((favorito) => (
                <div key={favorito.favorito_id} className="favorito-card" style={{position: 'relative'}}>
                  {/* Botón para quitar de favoritos */}
                  <button
                    onClick={() => handleToggleFavorito(favorito.id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      zIndex: 10
                    }}
                    title="Quitar de favoritos"
                  >
                    ❤️
                  </button>
                  
                  <div className="favorito-image">
                    <img src={favorito.imagen_url} alt={favorito.nombre} />
                  </div>
                  <h3>{favorito.nombre}</h3>
                  <p style={{
                    color: '#666', 
                    fontSize: '0.9rem',
                    margin: '0.5rem 0',
                    lineHeight: '1.4'
                  }}>
                    {favorito.descripcion}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem'
                  }}>
                    {favorito.categoria}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Línea divisoria */}
        <div className="divisor"></div>
        

        {/* Sección Tus reseñas */}
        <section className="resenas-section-simple">
          <h2 className="section-title">📝 Tus Reseñas</h2>
          
          {!usuarioLogueado && (
            <p style={{
              textAlign: 'center', 
              padding: '2rem', 
              color: '#999',
              fontSize: '1.1rem'
            }}>
              🔒 Inicia sesión para ver tus reseñas
            </p>
          )}
          
          {usuarioLogueado && loadingResenas && (
            <p style={{
              textAlign: 'center', 
              padding: '2rem',
              fontSize: '1.2rem',
              color: '#667eea'
            }}>
              ⏳ Cargando tus reseñas...
            </p>
          )}
          
          {usuarioLogueado && errorResenas && (
            <div style={{
              background: '#fee',
              border: '2px solid #fcc',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1rem 0',
              color: '#c33'
            }}>
              ❌ {errorResenas}
            </div>
          )}
          
          {usuarioLogueado && !loadingResenas && !errorResenas && resenasBackend.length === 0 && (
            <p style={{
              textAlign: 'center', 
              padding: '2rem', 
              color: '#999',
              fontSize: '1.1rem'
            }}>
              📭 No has escrito reseñas aún. ¡Escribe tu primera reseña!
            </p>
          )}
          
          {usuarioLogueado && !loadingResenas && !errorResenas && resenasBackend.length > 0 && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {resenasBackend.map((resena) => (
                <div key={resena.id} className="resena-card-simple">
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem'}}>
                    <img 
                      src={resena.lugar_imagen} 
                      alt={resena.lugar_nombre}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <h3 className="resena-lugar-title">{resena.lugar_nombre}</h3>
                      <div style={{color: '#FFD700', fontSize: '1.2rem'}}>
                        {'★'.repeat(resena.calificacion)}
                        {'☆'.repeat(5 - resena.calificacion)}
                      </div>
                      <p style={{color: '#999', fontSize: '0.85rem', margin: '0.25rem 0'}}>
                        {new Date(resena.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="resena-texto">{resena.texto}</p>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
      
      {/* Asistente Virtual - Posición fija */}
      <div className="asistente-virtual-fijo">
        <div className="asistente-tooltip">
          Hola, soy tu asistente virtual de viajes, ¿en qué te puedo ayudar el día de hoy?
        </div>
        <button className="asistente-btn">
          💬
        </button>
      </div>
      
      {/* Modal para crear reseña */}
      {mostrarModalResena && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{marginBottom: '1rem', color: '#333'}}>
              ✍️ Escribir reseña sobre {lugarSeleccionado?.nombre}
            </h2>
            
            <form onSubmit={handleCrearResena}>
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 'bold'}}>
                  Calificación:
                </label>
                <div style={{fontSize: '2rem', color: '#FFD700'}}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setNuevaResena({...nuevaResena, calificacion: star})}
                      style={{cursor: 'pointer', marginRight: '0.25rem'}}
                    >
                      {star <= nuevaResena.calificacion ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 'bold'}}>
                  Tu reseña:
                </label>
                <textarea
                  value={nuevaResena.texto}
                  onChange={(e) => setNuevaResena({...nuevaResena, texto: e.target.value})}
                  placeholder="Comparte tu experiencia..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>
              
              <div style={{display: 'flex', gap: '1rem'}}>
                <button
                  type="button"
                  onClick={handleCerrarModalResena}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
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
        <p>
          Proyecto académico - Desarrollo Basado en Plataformas Universidad Católica San Pablo<br />
          Copyright© 2025. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default ForYouPage;