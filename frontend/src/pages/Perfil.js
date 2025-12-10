import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerResenasUsuario, obtenerFavoritos, obtenerUsuarios } from "../services/api"; 
import "./Perfil.css";

function Perfil() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [miUsuario, setMiUsuario] = useState(null);
  const [esMiPerfil, setEsMiPerfil] = useState(false);

  // Estado de la relación de amistad
  const [estadoAmistad, setEstadoAmistad] = useState('none');

  // Datos
  const [resenas, setResenas] = useState([]); 
  const [favoritos, setFavoritos] = useState([]); 
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); 
  const [showEditModal, setShowEditModal] = useState(false);
  
  // --- LÓGICA DE AMIGOS ---
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendModalTab, setFriendModalTab] = useState('mis_amigos'); 
  const [todosLosUsuarios, setTodosLosUsuarios] = useState([]); 
  const [misAmigos, setMisAmigos] = useState([]); 
  const [busqueda, setBusqueda] = useState(""); 

  // Formulario Editar (Estado Inicial)
  const [editForm, setEditForm] = useState({
    nombre: '', 
    bio: '', 
    ubicacion: ''
  });

  useEffect(() => {
    cargarDatosDelPerfil();
  }, [id]);

  const cargarDatosDelPerfil = async () => {
    setLoading(true);
    const userStored = JSON.parse(localStorage.getItem("usuario"));
    if (!userStored) { navigate("/login"); return; }
    setMiUsuario(userStored);

    let usuarioTarget = null;
    let esMio = false;

    // 1. Obtener lista base de usuarios
    const dataUsers = await obtenerUsuarios();
    const usersDB = dataUsers.success ? dataUsers.usuarios : [];
    setTodosLosUsuarios(usersDB);

    // 2. Determinar a quién vemos
    if (id && parseInt(id) !== userStored.id) {
      // Viendo a otro
      usuarioTarget = usersDB.find(u => u.id === parseInt(id));
      if (!usuarioTarget) usuarioTarget = { id: 0, nombre: "Usuario Desconocido", email: "" }; 
      esMio = false;
    } else {
      // Viendo mi perfil
      usuarioTarget = userStored;
      esMio = true;
    }

    // 3. RECUPERAR DATOS PERSISTENTES (Simulación de BD Extendida)
    // Buscamos en localStorage si hay detalles guardados para este ID específico
    const detallesGuardados = JSON.parse(localStorage.getItem("pacha_usuarios_detalles")) || {};
    const detallesUsuario = detallesGuardados[usuarioTarget.id] || {
        bio: "🎒 Explorador de PachaQutec",
        ubicacion: "Arequipa, Perú"
    };

    // Fusionamos la info básica (nombre/email) con la info extra (bio/ubicación)
    const usuarioCompleto = {
        ...usuarioTarget,
        // Si el usuario editó su nombre localmente, usamos ese, sino el de la BD
        nombre: detallesUsuario.nombre || usuarioTarget.nombre,
        bio: detallesUsuario.bio,
        ubicacion: detallesUsuario.ubicacion
    };

    setPerfilUsuario(usuarioCompleto);
    setEsMiPerfil(esMio);

    // Pre-llenar formulario si es mi perfil
    if (esMio) {
        setEditForm({
            nombre: usuarioCompleto.nombre,
            bio: usuarioCompleto.bio,
            ubicacion: usuarioCompleto.ubicacion
        });
    }

    // 4. Lógica de Amistad y Datos
    verificarEstadoAmistad(userStored.id, usuarioTarget.id);
    cargarAmigosLocales(usuarioTarget.id, usersDB);

    await Promise.all([
      cargarResenas(usuarioTarget.id),
      cargarFavoritos(usuarioTarget.id)
    ]);
    
    setLoading(false);
  };

  // --- GUARDAR CAMBIOS (Persistencia Local) ---
  const handleGuardarCambios = () => {
      // 1. Obtener la "base de datos" local de detalles
      const detallesGuardados = JSON.parse(localStorage.getItem("pacha_usuarios_detalles")) || {};
      
      // 2. Actualizar los datos de ESTE usuario
      detallesGuardados[miUsuario.id] = {
          nombre: editForm.nombre,
          bio: editForm.bio,
          ubicacion: editForm.ubicacion
      };

      // 3. Guardar en localStorage
      localStorage.setItem("pacha_usuarios_detalles", JSON.stringify(detallesGuardados));

      // 4. Actualizar el objeto de sesión actual si cambió el nombre
      const usuarioActualizado = { ...miUsuario, nombre: editForm.nombre };
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      setMiUsuario(usuarioActualizado);

      // 5. Actualizar la vista
      setPerfilUsuario({ ...perfilUsuario, ...editForm });
      setShowEditModal(false);
      alert("¡Perfil actualizado correctamente!");
  };

  // --- LÓGICA DE AMIGOS ---
  const verificarEstadoAmistad = (miId, targetId) => {
    if (miId === targetId) return;
    const relaciones = JSON.parse(localStorage.getItem("pacha_relaciones")) || [];
    const relacion = relaciones.find(r => 
        (r.from === miId && r.to === targetId) || (r.from === targetId && r.to === miId)
    );

    if (!relacion) setEstadoAmistad('none');
    else if (relacion.status === 'accepted') setEstadoAmistad('friend');
    else if (relacion.status === 'pending') {
        if (relacion.from === miId) setEstadoAmistad('pending_sent');
        else setEstadoAmistad('pending_received');
    }
  };

  const cargarAmigosLocales = (targetId, allUsers) => {
    const relaciones = JSON.parse(localStorage.getItem("pacha_relaciones")) || [];
    const amistades = relaciones.filter(r => 
        r.status === 'accepted' && (r.from === targetId || r.to === targetId)
    );
    const listaAmigosReales = amistades.map(r => {
        const amigoId = r.from === targetId ? r.to : r.from;
        return allUsers.find(u => u.id === amigoId);
    }).filter(Boolean); 
    setMisAmigos(listaAmigosReales);
  };

  const cargarResenas = async (userId) => {
    try {
      const data = await obtenerResenasUsuario(userId);
      if (data.success) setResenas(data.resenas || []);
      else setResenas([]);
    } catch (e) { setResenas([]); }
  };

  const cargarFavoritos = async (userId) => {
    try {
      const data = await obtenerFavoritos(userId);
      if (data.success) setFavoritos(data.favoritos || []);
      else setFavoritos([]);
    } catch (e) { setFavoritos([]); }
  };

  const handleEnviarSolicitud = (destinatarioId) => {
    if (destinatarioId === miUsuario.id || estadoAmistad !== 'none') return;
    const relaciones = JSON.parse(localStorage.getItem("pacha_relaciones")) || [];
    relaciones.push({
        id: Date.now(), from: miUsuario.id, to: destinatarioId, status: 'pending', timestamp: new Date().toISOString()
    });
    localStorage.setItem("pacha_relaciones", JSON.stringify(relaciones));
    setEstadoAmistad('pending_sent');
  };

  const renderBotonAccion = () => {
      if (esMiPerfil) {
          return <button className="btn-edit-profile" onClick={() => setShowEditModal(true)}>Editar perfil</button>;
      }
      switch (estadoAmistad) {
          case 'friend': return <button className="btn-status amigoz">✓ Amigos</button>;
          case 'pending_sent': return <button className="btn-status pending">Solicitud enviada</button>;
          case 'pending_received': return <button className="btn-status pending">Solicitud pendiente</button>;
          default: return <button className="btn-follow" onClick={() => handleEnviarSolicitud(perfilUsuario.id)}>Agregar amigo</button>;
      }
  };

  const usuariosFiltrados = todosLosUsuarios.filter(u => {
    if (u.id === miUsuario?.id) return false; 
    const yaEsAmigo = misAmigos.some(amigo => amigo.id === u.id);
    if (yaEsAmigo) return false; 
    if (busqueda === "") return true;
    return u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.email.toLowerCase().includes(busqueda.toLowerCase());
  });

  if (loading) return <div className="loader-screen"><div className="spinner"></div></div>;
  if (!perfilUsuario) return <div>Usuario no encontrado</div>;

  return (
    <div className="perfil-layout">
      {/* Header Glass */}
      <header className="perfil-header-nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate('/foryou')}>
            <div className="mountain-icon-small"></div>
            <h1><span className="pacha-text">Pacha</span><span className="qutec-text">Qutec</span></h1>
          </div>
          <div className="nav-buttons">
             <button className="btn-nav" onClick={() => navigate('/foryou')}>Inicio</button>
             <button className="btn-nav logout" onClick={() => {localStorage.removeItem('usuario'); navigate('/login');}}>Salir</button>
          </div>
        </div>
      </header>

      <main className="perfil-container">
        {/* Info del Perfil */}
        <section className="profile-hero">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {perfilUsuario.nombre.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-top-row">
              <h2 className="profile-username">{perfilUsuario.nombre}</h2>
              {renderBotonAccion()}
            </div>

            <div className="profile-stats">
              <div className="stat-item"><span className="stat-num">{resenas.length}</span> publicaciones</div>
              <div className="stat-item clickable" onClick={() => setShowFriendsModal(true)}>
                <span className="stat-num">{misAmigos.length}</span> amigos
              </div>
              <div className="stat-item"><span className="stat-num">{favoritos.length}</span> favoritos</div>
            </div>

            <div className="profile-bio-section">
              <span className="real-name">{perfilUsuario.nombre}</span>
              <p className="location-text">📍 {perfilUsuario.ubicacion}</p>
              <p className="bio-text">{perfilUsuario.bio}</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="profile-tabs">
          <div className={`tab-item ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            <span>▦</span> PUBLICACIONES
          </div>
          <div className={`tab-item ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
            <span>🔖</span> FAVORITOS
          </div>
        </div>

        {/* Contenido Grid */}
        <div className="content-area">
            {activeTab === 'posts' && (
              <div className="photos-grid">
                {resenas.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">📷</div><h3>Sin publicaciones</h3></div>
                ) : (
                  resenas.map((resena) => (
                    <div key={resena.id} className="grid-item">
                      <img src={resena.lugar_imagen} alt={resena.lugar_nombre} />
                      <div className="grid-overlay">
                        <div className="overlay-info">
                          <span className="overlay-score">⭐ {resena.calificacion}/5</span>
                          <p>"{resena.texto}"</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="photos-grid">
                {favoritos.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">❤️</div><h3>Lista vacía</h3></div>
                ) : (
                  favoritos.map((fav) => (
                    <div key={fav.favorito_id} className="grid-item">
                      <img src={fav.imagen_url} alt={fav.nombre} />
                      <div className="grid-overlay saved-overlay">
                        <div className="overlay-info">
                          <span className="overlay-name">{fav.nombre}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
        </div>
      </main>

      {/* --- MODAL AMIGOS --- */}
      {showFriendsModal && (
        <div className="modal-backdrop" onClick={() => setShowFriendsModal(false)}>
          <div className="modal-card friends-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Comunidad</h3>
              <button onClick={() => setShowFriendsModal(false)}>✕</button>
            </div>
            
            <div className="modal-tabs">
                <button className={friendModalTab === 'mis_amigos' ? 'active' : ''} onClick={() => setFriendModalTab('mis_amigos')}>Mis Amigos ({misAmigos.length})</button>
                <button className={friendModalTab === 'buscar' ? 'active' : ''} onClick={() => setFriendModalTab('buscar')}>🔍 Buscar</button>
            </div>

            <div className="friends-list-container">
                {friendModalTab === 'buscar' && (
                    <div className="search-bar-container">
                        <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="friend-search-input"/>
                    </div>
                )}

                <div className="friends-list">
                  {friendModalTab === 'mis_amigos' ? (
                      misAmigos.length > 0 ? misAmigos.map(amigo => (
                        <div key={amigo.id} className="friend-item">
                            <div className="friend-avatar-small">{amigo.nombre.charAt(0).toUpperCase()}</div>
                            <span className="friend-name">{amigo.nombre}</span>
                            <button className="btn-visit" onClick={() => {setShowFriendsModal(false); navigate(`/perfil/${amigo.id}`)}}>Ver</button>
                        </div>
                      )) : <p className="empty-msg">Aún no tienes amigos.</p>
                  ) : (
                      usuariosFiltrados.map(user => (
                        <div key={user.id} className="friend-item">
                            <div className="friend-avatar-small search-avatar">{user.nombre.charAt(0).toUpperCase()}</div>
                            <span className="friend-name">{user.nombre}</span>
                            <div className="friend-actions">
                                <button className="btn-visit" onClick={() => {setShowFriendsModal(false); navigate(`/perfil/${user.id}`)}}>Ver</button>
                                <button className="btn-add-friend" onClick={() => handleEnviarSolicitud(user.id)}>+</button>
                            </div>
                        </div>
                      ))
                  )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDITAR PERFIL (ACTUALIZADO) --- */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-card edit-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Perfil</h3>
              <button onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Nombre Completo</label>
                <input 
                    type="text"
                    value={editForm.nombre} 
                    onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Ubicación</label>
                <input 
                    type="text"
                    placeholder="Ej: Arequipa, Perú"
                    value={editForm.ubicacion} 
                    onChange={e => setEditForm({...editForm, ubicacion: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Biografía</label>
                <textarea 
                    rows="3"
                    placeholder="Cuéntanos sobre ti..."
                    value={editForm.bio} 
                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                />
              </div>
              <button className="btn-save" onClick={handleGuardarCambios}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Perfil;