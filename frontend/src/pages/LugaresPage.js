import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Importamos las funciones de tu api.js para conectar con el backend
import { 
  obtenerCategorias, 
  obtenerLugaresPorCategoria, 
  agregarFavorito, 
  eliminarFavorito, 
  obtenerFavoritos,
  crearResena
} from "../services/api"; 
import "./LugaresPage.css";

// ==========================================
// 1. BASE DE DATOS LOCAL (INFALIBLE)
// ==========================================
const HORARIOS_AREQUIPA = {
  "santa catalina": "Lun - Dom: 09:00 AM - 05:00 PM (Jue: hasta 8PM)",
  "monasterio de santa catalina": "Lun - Dom: 09:00 AM - 05:00 PM (Jue: hasta 8PM)",
  "yanahuara": "Abierto las 24 horas (Mirador)",
  "mirador de yanahuara": "Abierto las 24 horas (Recomendado: Atardecer)",
  "colca": "Acceso libre (Tours inician 03:00 AM)",
  "cañón del colca": "Acceso libre (Tours inician 03:00 AM)",
  "plaza de armas": "Abierto las 24 horas",
  "catedral": "Lun - Sab: 07:00-10:00 y 17:00-19:00",
  "catedral de arequipa": "Lun - Sab: 07:00-10:00 y 17:00-19:00",
  "ruta del sillar": "Lun - Dom: 08:00 AM - 05:00 PM",
  "canteras de sillar": "Lun - Dom: 08:00 AM - 05:00 PM",
  "añashuayco": "Lun - Dom: 08:00 AM - 05:00 PM",
  "mundo alpaca": "Lun - Dom: 08:30 AM - 05:30 PM",
  "sabandía": "Lun - Dom: 09:00 AM - 05:00 PM",
  "molino de sabandía": "Lun - Dom: 09:00 AM - 05:00 PM",
  "mansión del fundador": "Lun - Dom: 09:00 AM - 05:00 PM",
  "misti": "Ascensos previa coordinación (2 días)",
  "volcán misti": "Ascensos previa coordinación (2 días)",
  "san camilo": "Lun - Dom: 06:00 AM - 07:00 PM",
  "mercado san camilo": "Lun - Dom: 06:00 AM - 07:00 PM",
  "museo santuarios andinos": "Lun - Sab: 09:00 AM - 06:00 PM (Dom: 9-3)"
};

const DESCRIPCIONES_AREQUIPA = {
  "santa catalina": "Una ciudad dentro de la ciudad. Este monasterio de clausura del siglo XVI es una obra maestra de la arquitectura colonial.",
  "yanahuara": "El mirador más icónico de la ciudad con vistas a los tres volcanes.",
  "cañón del colca": "Uno de los cañones más profundos del mundo, hogar del majestuoso cóndor andino y paisajes espectaculares.",
  "plaza de armas": "El corazón histórico de Arequipa, rodeado de portales de granito y la imponente Catedral basílica.",
  "catedral": "Imponente estructura neorrenacentista construida en sillar, que ocupa todo el lado norte de la Plaza de Armas.",
  "ruta del sillar": "Un recorrido fascinante por las canteras donde se extrae la piedra volcánica blanca con la que se construyó Arequipa.",
  "mundo alpaca": "Centro eco-turístico donde puedes interactuar con llamas y alpacas, y aprender sobre el proceso textil andino.",
  "molino de sabandía": "Joya arquitectónica rural del siglo XVII, rodeada de campiña y árboles centenarios.",
  "mansión del fundador": "Casona colonial histórica que perteneció al fundador de la ciudad, Garcí Manuel de Carbajal.",
  "volcán misti": "El guardián de Arequipa. Un estratovolcán activo de 5,822 metros, símbolo de la identidad arequipeña.",
  "mercado san camilo": "Declarado Patrimonio Histórico, su techo fue diseñado por Gustave Eiffel. El mejor lugar para probar la gastronomía local.",
  "museo santuarios andinos": "Hogar de la Momia Juanita y otros artefactos incas congelados en el tiempo."
};

const ENLACES_RECOMENDADOS = {
  "santa catalina": [
    { titulo: "Compra de entradas oficial", url: "https://santacatalina.org.pe/" },
    { titulo: "Historia del Monasterio (Video)", url: "https://youtu.be/5JNhJAeWw6k" },
    { titulo: "Visita nocturna", url: "https://storesantacatalina.org.pe/visits/5B1496E7-0932-457B-A176-FFD30E890A8A" }
  ],
  "yanahuara": [
    { titulo: "Mejores horas para visitar", url: "https://arequipaperu.info/lugares-turisticos/mirador-de-yanahuara" },
    { titulo: "Restaurantes cercanos", url: "https://www.tripadvisor.com.pe/RestaurantsNear-g294313-d554228-Yanahuara-Arequipa_Arequipa_Region.html" }
  ],
  "colca": [
    { titulo: "Ruta de trekking recomendada", url: "https://bananomeridiano.com/trekking-canon-del-colca-por-libre" },
    { titulo: "Boleto Turístico del Colca", url: "https://info.colcaperu.gob.pe/boleto-turistico" }
  ],
  "plaza de armas": [
    { titulo: "Restaurantes con vista a la plaza", url: "https://www.tripadvisor.com.pe/RestaurantsNear-g294313-d313683-Plaza_de_Armas-Arequipa_Arequipa_Region.html" },
    { titulo: "El Tuturutu: La historia", url: "https://rpp.pe/peru/actualidad/arequipa-el-tuturutu-un-sereno-permanente-de-la-plaza-de-armas-noticia-316433" },
    { titulo: "Guía de fotografía nocturna", url: "https://blog.incarail.com/es/plaza-de-armas-de-arequipa" }
  ],
  "catedral": [
    { titulo: "Museo de la Catedral", url: "https://www.museocatedralarequipa.org.pe/visitenos.html" },
    { titulo: "El órgano de Loret", url: "https://rpp.pe/peru/actualidad/el-organo-de-loret-la-joya-de-la-catedral-de-arequipa-noticia-645927" },
    { titulo: "Horarios de Misa", url: "https://www.arzobispadoarequipa.org.pe/horarios" }
  ],
  "ruta del sillar": [
    { titulo: "Cómo llegar por cuenta propia", url: "https://www.youtube.com/watch?v=HuR1q7i0yZU" },
    { titulo: "Artesanos tallando en vivo", url: "https://www.youtube.com/watch?v=RQ-CJ1FbhvM" },
    { titulo: "Culebrillas: El cañón virgen", url: "https://www.ytuqueplanes.com/destinos/arequipa/ruta-del-sillar/cantera-de-culebrillas" }
  ],
  "mundo alpaca": [
    { titulo: "Diferencia: Llama, Alpaca y Vicuña", url: "https://www.caminosalkantay.com/blog/llama-alpaca-vicuna-y-guanaco-parecidos-pero-completamente-diferentes" },
    { titulo: "Entrada libre: Sitio web", url: "https://mundoalpaca.com.pe/es/mundoalpaca-arequipa" },
    { titulo: "Tejido tradicional", url: "https://www.youtube.com/watch?v=j4QCehFOTME" }
  ],
  "molino de sabandía": [
    { titulo: "Paseos a caballo en la zona", url: "https://www.tripadvisor.com.pe/ShowUserReviews-g294313-d1061662-r417968579-Molino_de_Sabandia-Arequipa_Arequipa_Region.html" },
    { titulo: "Mapa de ubicación", url: "https://satellites.pro/mapa_de_Sabandia" }
  ],
  "mansión del fundador": [
    { titulo: "Datos históricos", url: "https://www.lamansiondelfundador.com/todos" },
    { titulo: "Quién fue Garcí Manuel de Carbajal", url: "https://diarioelpueblo.com.pe/2024/08/17/don-garci-manuel-de-carbajal-fundador-de-arequipa" }
  ],
  "misti": [
    { titulo: "Guía para el ascenso", url: "https://www.getyourguide.com" },
    { titulo: "Recomendaciones de seguridad", url: "https://www.huillcaexpedition.com/es/blog/aclimatacion-para-subir-al-misti" },
    { titulo: "Vista 360 desde la cima", url: "https://arequipa360.com/es" }
  ],
  "mercado san camilo": [
    { titulo: "Jugos y Gastronomía", url: "https://www.instagram.com/reel/DL6ER55tk71" },
    { titulo: "La conexión con Gustave Eiffel", url: "https://www.google.com" }
  ],
  "museo santuarios andinos": [
    { titulo: "Historia de la Momia Juanita", url: "https://historia.nationalgeographic.com.es/a/asi-era-rosto-juanita-momia-peru_20392" },
    { titulo: "Reservar visita guiada", url: "https://apps.ucsm.edu.pe/UCSMERP/Msa1090.php" }
  ]
};

const DATOS_PRINCIPALES = {
  "santa catalina": { web: "https://santacatalina.org.pe/", mapa: "https://maps.app.goo.gl/gHU8YFzT55RQRZMQ6" },
  "yanahuara": { web: "https://www.peru.travel/es/atractivos/mirador-de-yanahuara", mapa: "https://maps.app.goo.gl/meJi1447M5aqboix7" },
  "colca": { web: "https://www.colcaperu.gob.pe/destinos", mapa: "https://maps.app.goo.gl/wAnxKcQXq7ABhdFSA" },
  "plaza de armas": { web: "https://www.ytuqueplanes.com/destinos/junin/tarma/plaza-de-armas", mapa: "https://maps.app.goo.gl/t1VTeU7SX8ze2E7L6" },
  "catedral": { web: "https://www.facebook.com/CatedralArequipa/?locale=es_LA", mapa: "https://maps.app.goo.gl/rDJiSjSf8KgaLTEt6" },
  "ruta del sillar": { web: "https://www.hvillasillar.com/ruta-de-sillar", mapa: "https://maps.app.goo.gl/HupFRd3M9iAYDiM36" },
  "mundo alpaca": { web: "https://mundoalpaca.com.pe/es", mapa: "https://maps.app.goo.gl/Vr5C8jV9inhKcgnf9" },
  "molino de sabandia": { web: "https://www.facebook.com/elmolinodesabandia/?locale=es_LA", mapa: "https://maps.app.goo.gl/oj41cfykJJuatiw86" },
  "mansion del fundador": { web: "https://www.lamansiondelfundador.com", mapa: "https://maps.app.goo.gl/r37MmzKkmetU4Fzq5" },
  "misti": { web: "https://www.facebook.com/VolcanMisti/?locale=es_LA", mapa: "https://maps.app.goo.gl/5e9ueHzggWmiFhXg9" },
  "mercado san camino": { web: "https://www.facebook.com/mercadosancamiloarequipa/?locale=es_LA", mapa: "https://maps.app.goo.gl/fEjEwbp1y6GtSSdQA" },
  "museo santuarios andinos": { web: "https://ucsm.edu.pe", mapa: "https://maps.app.goo.gl/uSfRjYFSQcysQnp36" }
};

function LugaresPage() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // --- USUARIO LOGUEADO ---
  const [usuario, setUsuario] = useState(null);

  // --- DATOS BACKEND ---
  const [categorias, setCategorias] = useState([]);
  const [lugaresPorCategoria, setLugaresPorCategoria] = useState({});
  const [loading, setLoading] = useState(true);
  
  // --- FAVORITOS (Mapa: lugarId -> favoritoId) ---
  // Si existe en el mapa, es favorito. El valor es el ID de la relación en BD para poder borrarlo.
  const [mapaFavoritos, setMapaFavoritos] = useState({}); 

  // --- UI ---
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [animating, setAnimating] = useState(false);

  // --- MODALES Y POPOVERS ---
  const [misEnlaces, setMisEnlaces] = useState({});
  const [nuevoEnlaceInput, setNuevoEnlaceInput] = useState("");
  const [nuevaNotaInput, setNuevaNotaInput] = useState("");
  
  const [mostrarPopoverEnlaces, setMostrarPopoverEnlaces] = useState(false);
  const [mostrarPopoverRecomendados, setMostrarPopoverRecomendados] = useState(false);

  // --- RESEÑAS ---
  const [mostrarModalResena, setMostrarModalResena] = useState(false);
  const [textoResena, setTextoResena] = useState("");
  const [calificacion, setCalificacion] = useState(5);

  // 1. CARGA INICIAL
  useEffect(() => {
    // A) Cargar Usuario
    const userStored = JSON.parse(localStorage.getItem("usuario"));
    if (userStored) setUsuario(userStored);

    // B) Cargar Mis Enlaces (Local)
    const enlacesGuardados = localStorage.getItem("mis_enlaces_lugares");
    if (enlacesGuardados) {
      try { setMisEnlaces(JSON.parse(enlacesGuardados)); } catch (e) {}
    }

    // C) Cargar Datos Backend
    const cargarTodo = async () => {
      try {
        setLoading(true);
        // 1. Categorías y Lugares
        const dataCat = await obtenerCategorias();
        if (dataCat && dataCat.success) {
          setCategorias(dataCat.categorias);
          const promises = dataCat.categorias.map(c => obtenerLugaresPorCategoria(c.id));
          const results = await Promise.all(promises);
          
          const mapaLugares = {};
          dataCat.categorias.forEach((cat, i) => {
             if(results[i] && results[i].success) {
                // Filtro duplicados
                const unicos = (results[i].lugares || []).filter((l, idx, self) => 
                  idx === self.findIndex(t => t.nombre.trim().toLowerCase() === l.nombre.trim().toLowerCase())
                );
                mapaLugares[cat.id] = unicos;
             } else {
                mapaLugares[cat.id] = [];
             }
          });
          setLugaresPorCategoria(mapaLugares);
        }

        // 2. Cargar Favoritos del Usuario (si está logueado)
        if (userStored) {
           try {
             const dataFav = await obtenerFavoritos(userStored.id);
             if (dataFav && dataFav.success && dataFav.favoritos) {
                const nuevoMapa = {};
                // Mapeamos: ID del Lugar -> ID del Favorito (para borrar luego)
                dataFav.favoritos.forEach(fav => {
                   nuevoMapa[fav.id] = fav.favorito_id; 
                });
                setMapaFavoritos(nuevoMapa);
             }
           } catch (errFav) {
             console.warn("No se pudieron cargar favoritos", errFav);
           }
        }

      } catch (err) {
        console.error("Error cargando datos", err);
      } finally {
        setLoading(false);
      }
    };
    cargarTodo();
  }, []);

  // --- HELPERS ---
  const normalizeName = (name) => name ? name.toLowerCase().trim() : "";
  const getHorarioReal = (name) => {
    if(!name) return "09:00 AM - 05:00 PM";
    const key = Object.keys(HORARIOS_AREQUIPA).find(k => normalizeName(name).includes(k));
    return key ? HORARIOS_AREQUIPA[key] : "Lun - Dom: 09:00 AM - 05:00 PM";
  };
  const getDescripcionReal = (lugar) => {
    if(!lugar) return "";
    const key = Object.keys(DESCRIPCIONES_AREQUIPA).find(k => normalizeName(lugar.nombre).includes(k));
    return key ? DESCRIPCIONES_AREQUIPA[key] : (lugar.descripcion || "Descubre este destino.");
  };
  const getRecomendaciones = (name) => {
    if(!name) return [];
    const key = Object.keys(ENLACES_RECOMENDADOS).find(k => normalizeName(name).includes(k));
    return key ? ENLACES_RECOMENDADOS[key] : [];
  };
  const getDatosPrincipales = (name) => {
    if(!name) return { web: null, mapa: null };
    const key = Object.keys(DATOS_PRINCIPALES).find(k => normalizeName(name).includes(k));
    return key ? DATOS_PRINCIPALES[key] : { web: null, mapa: null };
  };

  // --- ACCIONES UI ---
  const changeCategory = (dir) => {
    if (animating || categorias.length === 0) return;
    setAnimating(true);
    setLugarSeleccionado(null);
    setCurrentCatIndex(prev => {
       if(dir === 'next') return (prev + 1) % categorias.length;
       return (prev - 1 + categorias.length) % categorias.length;
    });
    setTimeout(()=>setAnimating(false), 500);
  };

  const handleSeleccionarLugar = (lugar) => {
    if (lugarSeleccionado?.id === lugar.id) return;
    setAnimating(true);
    setLugarSeleccionado(lugar);
    // Resetear popups
    setMostrarPopoverEnlaces(false);
    setMostrarPopoverRecomendados(false);
    setTimeout(()=>setAnimating(false), 500);
  };

  const scrollCarousel = (dir) => {
     if(scrollContainerRef.current) {
        const amount = 300;
        scrollContainerRef.current.scrollBy({ left: dir==='left'? -amount : amount, behavior:'smooth'});
     }
  };

  // --- LOGICA FAVORITOS (BACKEND) ---
  const handleToggleFavorito = async () => {
    if (!usuario) { alert("Debes iniciar sesión para guardar favoritos."); return; }
    if (!lugarSeleccionado) return;

    const lugarId = lugarSeleccionado.id;
    const favoritoId = mapaFavoritos[lugarId]; // Si existe, es que ya es favorito

    try {
       if (favoritoId) {
          // ELIMINAR
          const resp = await eliminarFavorito(favoritoId);
          if (resp && resp.success) {
             const nuevoMapa = { ...mapaFavoritos };
             delete nuevoMapa[lugarId];
             setMapaFavoritos(nuevoMapa);
          }
       } else {
          // AGREGAR
          const resp = await agregarFavorito(usuario.id, lugarId);
          if (resp && resp.success) {
             setMapaFavoritos({ ...mapaFavoritos, [lugarId]: resp.favorito_id });
          } else {
             alert(resp.error || "No se pudo agregar.");
          }
       }
    } catch (error) {
       console.error("Error favoritos:", error);
       alert("Error de conexión al gestionar favorito.");
    }
  };

  // --- LOGICA RESEÑAS (BACKEND) ---
  const handleEnviarResena = async () => {
     if (!usuario) { alert("Inicia sesión para opinar."); return; }
     if (!textoResena.trim()) return;

     try {
        const resp = await crearResena(usuario.id, lugarSeleccionado.id, textoResena, calificacion);
        if (resp && resp.success) {
           alert("¡Reseña publicada con éxito!");
           setMostrarModalResena(false);
           setTextoResena("");
           setCalificacion(5);
           // Aquí la reseña ya está en BD. ForYouPage la leerá al cargar.
        } else {
           alert(resp.error || "Error al publicar.");
        }
     } catch (error) {
        console.error("Error reseña:", error);
        alert("Error de conexión.");
     }
  };

  // --- LOGICA MIS ENLACES (LOCAL) ---
  const handleAgregarEnlace = () => {
     if(!nuevoEnlaceInput.trim() || !lugarSeleccionado) return;
     const lid = lugarSeleccionado.id;
     const actual = misEnlaces[lid] || [];
     const nuevo = { id: Date.now(), url: nuevoEnlaceInput, nota: nuevaNotaInput || "Nota" };
     const updated = { ...misEnlaces, [lid]: [...actual, nuevo] };
     setMisEnlaces(updated);
     localStorage.setItem("mis_enlaces_lugares", JSON.stringify(updated));
     setNuevoEnlaceInput(""); setNuevaNotaInput("");
  };
  const handleEliminarEnlace = (eid) => {
     if(!lugarSeleccionado) return;
     const lid = lugarSeleccionado.id;
     const updated = { ...misEnlaces, [lid]: misEnlaces[lid].filter(e=>e.id !== eid) };
     setMisEnlaces(updated);
     localStorage.setItem("mis_enlaces_lugares", JSON.stringify(updated));
  };

  // --- RENDER ---
  const categoriaActual = categorias.length > 0 ? categorias[currentCatIndex] : null;
  const lugaresActuales = (categoriaActual && lugaresPorCategoria[categoriaActual.id]) || [];

  let backgroundActual = "https://www.peru.travel/Contenido/Atractivo/Imagen/es/10/1.1/Principal/Yanahuara.jpg";
  if (lugarSeleccionado?.imagen_url) backgroundActual = lugarSeleccionado.imagen_url;
  else if (lugaresActuales.length > 0) backgroundActual = lugaresActuales[0].imagen_url;

  // Verificamos si el seleccionado es favorito
  const esFavoritoSeleccionado = lugarSeleccionado && mapaFavoritos[lugarSeleccionado.id];

  return (
    <div className="travel-wrapper">
      <div className="background-layer">
         <div className={`bg-image ${animating ? 'fade-anim' : ''}`} key={backgroundActual}>
            <img src={backgroundActual} alt="BG" />
            <div className="bg-overlay"></div> 
         </div>
      </div>

      <header className="top-nav">
         <div className="brand">
            <div className="brand-icon"></div>
            <span>Pacha<span className="brand-highlight">Qutec</span></span>
         </div>
         <button className="btn-home" onClick={()=>navigate("/foryou")}>← Inicio</button>
      </header>

      <main className="main-content">
         {loading ? (
             <div className="loading-container">
                 <div className="spinner"></div>
                 <p style={{color:'white'}}>Cargando experiencias...</p>
             </div>
         ) : (
           <>
             {categorias.length > 0 && (
                <>
                  <button className="nav-arrow left" onClick={()=>changeCategory('prev')}>❮</button>
                  <button className="nav-arrow right" onClick={()=>changeCategory('next')}>❯</button>
                </>
             )}

             <div className={`text-content ${animating ? 'slide-up' : ''}`} key={lugarSeleccionado ? lugarSeleccionado.id : (categoriaActual?.id || 'init')}>
                {categoriaActual && (
                   <div className="breadcrumb"><span className="cat-dot"></span>{categoriaActual.nombre}</div>
                )}

                <div className="title-row">
                   <h1 className="main-title">
                      {lugarSeleccionado ? lugarSeleccionado.nombre : (categoriaActual?.nombre || "Explorar")}
                   </h1>
                   
                   {/* BOTÓN FAVORITOS */}
                   {lugarSeleccionado && (
                      <button 
                        className={`btn-fav-icon ${esFavoritoSeleccionado ? 'active' : ''}`} 
                        onClick={handleToggleFavorito}
                        title={esFavoritoSeleccionado ? "Quitar de favoritos" : "Guardar en favoritos"}
                      >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill={esFavoritoSeleccionado ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                         </svg>
                      </button>
                   )}
                </div>

                <p className="main-desc">
                   {lugarSeleccionado ? getDescripcionReal(lugarSeleccionado) : (categoriaActual?.descripcion || "")}
                </p>

                {lugarSeleccionado && (
                   <div className="place-details-panel">
                      <div className="info-row">
                         <div className="info-item"><span className="icon">🕒</span> {getHorarioReal(lugarSeleccionado.nombre)}</div>
                         <div className="info-item"><span className="icon">📍</span> {lugarSeleccionado.coordenadas || "Arequipa"}</div>
                      </div>

                      <div className="action-buttons">
                         {(() => {
                            const d = getDatosPrincipales(lugarSeleccionado.nombre);
                            const web = d.web || lugarSeleccionado.enlace;
                            const mapa = d.mapa || `http://googleusercontent.com/maps.google.com/search?q=${encodeURIComponent(lugarSeleccionado.nombre + " Arequipa")}`;
                            return (
                               <>
                                 {web && <a href={web} target="_blank" rel="noreferrer" className="btn-action primary">Web</a>}
                                 <a href={mapa} target="_blank" rel="noreferrer" className="btn-action outline">Mapa</a>
                               </>
                            );
                         })()}
                         
                         {/* BOTÓN RESEÑAR */}
                         <button onClick={() => setMostrarModalResena(true)} className="btn-action glass">
                            ✍️ Reseñar
                         </button>

                         <button onClick={()=>{setMostrarPopoverEnlaces(true); setMostrarPopoverRecomendados(false)}} className="btn-action glass">🔗 Notas</button>
                         <button onClick={()=>{setMostrarPopoverRecomendados(true); setMostrarPopoverEnlaces(false)}} className="btn-action glass">⭐ Tips</button>
                      </div>
                   </div>
                )}
             </div>

             <div className="carousel-wrapper">
                 <button className="carousel-nav prev" onClick={()=>scrollCarousel('left')}>‹</button>
                 <div className="carousel-track" ref={scrollContainerRef}>
                     {lugaresActuales.map(l => (
                        <div 
                           key={l.id} 
                           className={`carousel-card ${lugarSeleccionado?.id === l.id ? 'active-card' : ''}`}
                           onClick={()=>handleSeleccionarLugar(l)}
                        >
                           <img src={l.imagen_url} alt={l.nombre} loading="lazy"/>
                           <div className="card-gradient"></div>
                           <div className="card-title">{l.nombre}</div>
                        </div>
                     ))}
                 </div>
                 <button className="carousel-nav next" onClick={()=>scrollCarousel('right')}>›</button>
             </div>

             {/* POPOVERS */}
             {mostrarPopoverEnlaces && lugarSeleccionado && (
                <div className="popup-box">
                   <div className="popup-header"><h4>Mis Notas</h4><button onClick={()=>setMostrarPopoverEnlaces(false)}>×</button></div>
                   <div className="popup-body">
                      <ul className="popup-list">
                         {misEnlaces[lugarSeleccionado.id]?.map(l=>(
                            <li key={l.id}><a href={l.url} target="_blank" rel="noreferrer">{l.nota}</a><button className="delete-btn" onClick={()=>handleEliminarEnlace(l.id)}>🗑️</button></li>
                         ))}
                      </ul>
                      <div className="popup-form">
                         <input value={nuevaNotaInput} onChange={e=>setNuevaNotaInput(e.target.value)} placeholder="Título/Nota"/>
                         <input value={nuevoEnlaceInput} onChange={e=>setNuevoEnlaceInput(e.target.value)} placeholder="URL (opcional)"/>
                         <button onClick={handleAgregarEnlace}>Guardar</button>
                      </div>
                   </div>
                </div>
             )}

             {mostrarPopoverRecomendados && lugarSeleccionado && (
                <div className="popup-box recommended">
                   <div className="popup-header"><h4>Recomendados</h4><button onClick={()=>setMostrarPopoverRecomendados(false)}>×</button></div>
                   <ul className="popup-list">
                      {getRecomendaciones(lugarSeleccionado.nombre).map((r,i)=>(
                         <li key={i}><a href={r.url} target="_blank" rel="noreferrer">⭐ {r.titulo}</a></li>
                      ))}
                   </ul>
                </div>
             )}

             {/* MODAL RESEÑA */}
             {mostrarModalResena && (
                <div className="review-modal-overlay">
                   <div className="review-modal">
                      <div className="review-header"><h3>Tu Opinión</h3><button onClick={()=>setMostrarModalResena(false)}>×</button></div>
                      <div className="review-body">
                         <div className="star-rating">
                            {[1,2,3,4,5].map(s => (
                               <span key={s} className={`star ${s<=calificacion?'filled':''}`} onClick={()=>setCalificacion(s)}>★</span>
                            ))}
                         </div>
                         <textarea placeholder="Cuéntanos tu experiencia..." value={textoResena} onChange={e=>setTextoResena(e.target.value)}/>
                         <button className="btn-submit-review" onClick={handleEnviarResena}>Publicar</button>
                      </div>
                   </div>
                </div>
             )}
           </>
         )}
      </main>
    </div>
  );
}

export default LugaresPage;