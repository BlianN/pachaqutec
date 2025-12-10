import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  obtenerUsuarios, 
  obtenerFavoritos,
  obtenerResenas
} from "../services/api"; 
import Chatbot from "./Chatbot"; // ← CHATBOT DE DIEGO (CONECTA CON GEMINI)
import "./ForYouPage.css";

const POSTS_INICIALES = [
  {
    id: 1,
    userId: 101, 
    usuario: "Tasha de los Backyardigans",
    avatar: "https://fbi.cults3d.com/uploaders/40342033/illustration-file/277a17de-b4a8-4d39-85a9-89edcfdf3e7e/tasha.png",
    ubicacion: "Mirador de Yanahuara, Arequipa",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJjrQRzZ9J-Z-Bby9PaZ-WsCLzD6wxr99udA&s",
    descripcion: "Espero que la policia no me reconozca comiendo mi queso helado . 🏔️🍦",
    likes: 124,
    likedByMe: false,
    fecha: "Hace 2 horas",
    comentarios: [
      { user: "Pablo Escobar", text: "¡Qué hermosa vista! 😍" },
      { user: "TurismoPeru", text: "El mejor lugar para fotos." }
    ]
  },
  {
    id: 2,
    userId: 102,
    usuario: "Pablo el explorador",
    avatar: "https://fbi.cults3d.com/uploaders/40342033/illustration-file/40f7a3d4-3a88-427f-8b4b-70e6c5e02e21/pablo-detective.png",
    ubicacion: "Cañón del Colca",
    imagen: "https://www.peru.travel/Contenido/Atractivo/Imagen/es/8/1.2/Principal/Ca%C3%B1on%20del%20Colca.jpg",
    descripcion: "El vuelo del cóndor es algo que tienes que ver al menos una vez en la vida. Majestuoso. pdta:Casi me lleva, asi que tengan cuidado 🦅",
    likes: 89,
    likedByMe: false,
    fecha: "Hace 5 horas",
    comentarios: []
  },
  {
    id: 3,
    userId: 103,
    usuario: "Ricardo Palma",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-5xsn7BPM5X9Wyjfs_5cwWJ7-wUJqlbT9oQ&s",
    ubicacion: "Monasterio de Santa Catalina",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQT4ZTXV5btAqsuxEX69bAk4YXAKPEfp56h6g&s",
    descripcion: "Perdiéndome en los colores y las calles de esta ciudad dentro de una ciudad. ❤️💙",
    likes: 256,
    likedByMe: true,
    fecha: "Hace 1 día",
    comentarios: [
       { user: "Tasha de los Backyardigans", text: "Esos colores son únicos. me recuerdan a mi" }
    ]
  }
];

function ForYouPage() {
  const navigate = useNavigate();
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [posts, setPosts] = useState([]);
  
  const [comentarioInputs, setComentarioInputs] = useState({});
  const [mostrarComentarios, setMostrarComentarios] = useState({});
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [showInbox, setShowInbox] = useState(false);
  const [usuariosMap, setUsuariosMap] = useState({});

  // --- HELPER: FUSIONAR CON LOCALSTORAGE ---
  const mergeWithLocalData = (listaPosts) => {
      const savedData = JSON.parse(localStorage.getItem("pacha_feed_interactions")) || {};
      return listaPosts.map(p => {
          const saved = savedData[p.id];
          if (!saved) return p;
          return {
              ...p,
              likedByMe: saved.likedByMe !== undefined ? saved.likedByMe : p.likedByMe,
              likes: saved.likes !== undefined ? saved.likes : p.likes,
              comentarios: saved.newComments ? [...p.comentarios, ...saved.newComments] : p.comentarios
          };
      });
  };

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const userObj = JSON.parse(usuario);
      setUsuarioLogueado(userObj);
      cargarSolicitudes(userObj.id);

      const cargarFeed = async () => {
        let todosLosPosts = [...POSTS_INICIALES];

        try {
           const data = await obtenerResenas(userObj.id); 
           if (data && data.success && data.resenas) {
              const misPosts = data.resenas.map(r => ({
                  id: `review-${r.id}`, 
                  userId: userObj.id,
                  usuario: userObj.nombre,
                  avatar: `https://ui-avatars.com/api/?name=${userObj.nombre}&background=ff6b00&color=fff`,
                  ubicacion: r.lugar_nombre, 
                  imagen: r.lugar_imagen || "https://www.peru.travel/Contenido/Atractivo/Imagen/es/10/1.1/Principal/Yanahuara.jpg", 
                  descripcion: `⭐ ${r.calificacion}/5 — ${r.texto}`, 
                  likes: 0, 
                  likedByMe: false,
                  fecha: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Reciente",
                  comentarios: []
              }));
              todosLosPosts = [...misPosts, ...POSTS_INICIALES];
           }
        } catch (error) {
           console.error("Error al cargar reseñas:", error);
        }

        setPosts(mergeWithLocalData(todosLosPosts));
      };
      cargarFeed();
    } else {
        setPosts(mergeWithLocalData(POSTS_INICIALES));
    }
  }, []);

  const cargarSolicitudes = async (miId) => {
    try {
        const data = await obtenerUsuarios();
        if(data.success) {
            const map = {};
            data.usuarios.forEach(u => map[u.id] = u.nombre);
            setUsuariosMap(map);
        }
    } catch(e) {}
    const relaciones = JSON.parse(localStorage.getItem("pacha_relaciones")) || [];
    setSolicitudes(relaciones.filter(r => r.to === miId && r.status === 'pending'));
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("recordarSesion");
    navigate("/login");
  };

  // --- LIKES CON PERSISTENCIA ---
  const handleLike = (postId) => {
    setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
            if (post.id === postId) {
                const newLikedState = !post.likedByMe;
                const newLikes = newLikedState ? post.likes + 1 : post.likes - 1;
                
                // Guardar en LocalStorage
                const savedData = JSON.parse(localStorage.getItem("pacha_feed_interactions")) || {};
                savedData[postId] = { 
                    ...savedData[postId], 
                    likedByMe: newLikedState, 
                    likes: newLikes 
                };
                localStorage.setItem("pacha_feed_interactions", JSON.stringify(savedData));

                return { ...post, likedByMe: newLikedState, likes: newLikes };
            }
            return post;
        });
        return updatedPosts;
    });
  };

  const handleToggleComentarios = (postId) => {
    setMostrarComentarios(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handlePostComentario = (postId) => {
    const texto = comentarioInputs[postId];
    if (!texto || !texto.trim() || !usuarioLogueado) return;
    
    const nuevoComentario = { user: usuarioLogueado.nombre, text: texto.trim() };

    setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
            const nuevosComentarios = [...post.comentarios, nuevoComentario];
            
            // Guardar en LocalStorage
            const savedData = JSON.parse(localStorage.getItem("pacha_feed_interactions")) || {};
            const existingNew = savedData[postId]?.newComments || [];
            savedData[postId] = { 
                ...savedData[postId], 
                newComments: [...existingNew, nuevoComentario] 
            };
            localStorage.setItem("pacha_feed_interactions", JSON.stringify(savedData));
            
            return { ...post, comentarios: nuevosComentarios };
        }
        return post;
    }));
    
    setComentarioInputs({ ...comentarioInputs, [postId]: "" });
  };

  const toggleMenu = (postId) => {
    setMenuAbiertoId(menuAbiertoId === postId ? null : postId);
  };

  const responderSolicitud = (id, aceptar) => {
    const relaciones = JSON.parse(localStorage.getItem("pacha_relaciones")) || [];
    const nuevas = relaciones.map(r => r.id === id ? { ...r, status: aceptar ? 'accepted' : 'rejected' } : r);
    if (!aceptar) { 
        const filtradas = relaciones.filter(r => r.id !== id);
        localStorage.setItem("pacha_relaciones", JSON.stringify(filtradas));
    } else {
        localStorage.setItem("pacha_relaciones", JSON.stringify(nuevas));
        alert("¡Nuevo amigo agregado!");
    }
    setSolicitudes(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="foryou-container">
      <header className="foryou-header">
        <div className="header-content-wrapper">
            <div className="logo" onClick={() => window.scrollTo(0,0)}>
                <div className="mountain"></div>
                <h1><span className="black">Pacha</span><span className="orange">Qutec</span></h1>
            </div>
            <nav className="navigation">
                <button onClick={() => navigate("/foryou")} className="nav-link active">Inicio</button>
                <button onClick={() => navigate("/lugares")} className="nav-link">Lugares</button>
                <button onClick={() => navigate("/favoritos")} className="nav-link">Favoritos</button>
                <button onClick={() => navigate("/rutas")} className="nav-link">Rutas</button>
                <button onClick={() => navigate("/reseñas")} className="nav-link">Reseñas</button>
                <button onClick={() => navigate("/contactanos")} className="nav-link">Contáctanos</button>
                {usuarioLogueado && (
                    <span className="user-welcome" onClick={() => navigate('/perfil')} title="Ver Perfil">
                        <div className="user-avatar-placeholder">{usuarioLogueado.nombre.charAt(0)}</div>
                        <span className="user-name-text">{usuarioLogueado.nombre.split(' ')[0]}</span>
                    </span>
                )}
                <button onClick={() => navigate("/rdf")} className="nav-link nav-rdf">RDF</button>
                <button onClick={handleLogout} className="nav-link logout-btn">Salir</button>
            </nav>
        </div>
      </header>

      <main className="feed-layout">
        {posts.map(post => (
          <article key={post.id} className="elegant-card">
            <div className="card-header">
              <div className="user-meta">
                <img src={post.avatar} alt={post.usuario} className="avatar-small" />
                <div className="user-text">
                  <span className="username">{post.usuario}</span>
                  <span className="location">{post.ubicacion}</span>
                </div>
              </div>
              <div className="menu-trigger-container">
                  <button className="dots-btn" onClick={(e) => { e.stopPropagation(); toggleMenu(post.id); }}>•••</button>
                  {menuAbiertoId === post.id && (
                      <div className="dropdown-menu">
                          <button onClick={() => navigate(`/perfil/${post.userId}`)}>Ver Perfil</button>
                          <button className="btn-cancel" onClick={() => setMenuAbiertoId(null)}>Cancelar</button>
                      </div>
                  )}
              </div>
            </div>
            <div className="card-image" onDoubleClick={() => handleLike(post.id)}>
               <img src={post.imagen} alt={post.descripcion} />
               <div className={`heart-overlay ${post.likedByMe ? 'active' : ''}`}>❤️</div>
            </div>
            <div className="card-actions">
               <div className="action-row">
                   <button onClick={() => handleLike(post.id)} className={`icon-btn ${post.likedByMe ? 'liked' : ''}`}>
                       <svg width="24" height="24" viewBox="0 0 24 24" fill={post.likedByMe ? "#ff4757" : "none"} stroke={post.likedByMe ? "#ff4757" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                       </svg>
                   </button>
                   <button onClick={() => handleToggleComentarios(post.id)} className="icon-btn">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                       </svg>
                   </button>
               </div>
               <div className="likes-count">{post.likes} Me gusta</div>
            </div>
            <div className="card-caption">
                <span className="caption-username">{post.usuario}</span>
                <span className="caption-text"> {post.descripcion}</span>
                <div className="time-ago">{post.fecha}</div>
            </div>
            {mostrarComentarios[post.id] && (
                <div className="comments-section">
                    {post.comentarios.map((c, idx) => (
                        <div key={idx} className="comment-bubble"><strong>{c.user}</strong> {c.text}</div>
                    ))}
                    <div className="comment-input-area">
                        <input type="text" placeholder="Añade un comentario..." value={comentarioInputs[post.id] || ""} onChange={(e) => setComentarioInputs({...comentarioInputs, [post.id]: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && handlePostComentario(post.id)} />
                        <button onClick={() => handlePostComentario(post.id)} disabled={!comentarioInputs[post.id]}>Publicar</button>
                    </div>
                </div>
            )}
          </article>
        ))}
      </main>

      {/* BANDEJA DE NOTIFICACIONES */}
      <div className="inbox-wrapper">
         <button className={`inbox-btn ${solicitudes.length > 0 ? 'pulse' : ''}`} onClick={() => setShowInbox(!showInbox)} title="Notificaciones">
             <span style={{fontSize: '1.2rem'}}>🔔</span>
             {solicitudes.length > 0 && <span className="badge">{solicitudes.length}</span>}
         </button>
         {showInbox && (
             <div className="inbox-panel">
                 <div className="inbox-header">
                     <h4>Notificaciones</h4>
                     <button className="close-mini" onClick={() => setShowInbox(false)}>✕</button>
                 </div>
                 <div className="inbox-content">
                     {solicitudes.length === 0 ? (
                         <div className="empty-state">📭 <p>No tienes notificaciones.</p></div>
                     ) : (
                         solicitudes.map(sol => (
                             <div key={sol.id} className="request-card">
                                 <div className="req-info"><strong>{usuariosMap[sol.from]}</strong> quiere conectar</div>
                                 <div className="req-actions">
                                     <button className="btn-confirm" onClick={() => responderSolicitud(sol.id, true)}>Confirmar</button>
                                     <button className="btn-delete" onClick={() => responderSolicitud(sol.id, false)}>✕</button>
                                 </div>
                             </div>
                         ))
                     )}
                 </div>
             </div>
         )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CHATBOT DE DIEGO - CONECTADO CON MICROSERVICIO PYTHON/GEMINI
          ═══════════════════════════════════════════════════════════ */}
      <Chatbot />
    </div>
  );
}

export default ForYouPage;