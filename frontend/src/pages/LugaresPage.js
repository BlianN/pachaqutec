import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerCategorias, obtenerLugaresPorCategoria } from "../services/api"; 
import "./LugaresPage.css";

// ==========================================
// BASE DE DATOS LOCAL: HORARIOS (AREQUIPA)
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

// ==========================================
// BASE DE DATOS LOCAL: DESCRIPCIONES
const DESCRIPCIONES_AREQUIPA = {
  "santa catalina": "Una ciudad dentro de la ciudad. Este monasterio de clausura del siglo XVI es una obra maestra de la arquitectura colonial.",
  "yanahuara": "El mirador más icónico de la ciudad con vistas a los tres volcanes.",
  // ... (Tus descripciones actuales se mantienen, las acorté aquí visualmente pero tú tienes las completas)
};

// ==========================================
// BASE DE DATOS LOCAL: ENLACES RECOMENDADOS (NUEVO)
const ENLACES_RECOMENDADOS = {
  "santa catalina": [
    { titulo: "Compra de entradas oficial", url: "https://santacatalina.org.pe/" },
    { titulo: "Historia del Monasterio (Video)", url: "https://youtu.be/5JNhJAeWw6k" },
    { titulo: "Visita nocurtna", url: "https://storesantacatalina.org.pe/visits/5B1496E7-0932-457B-A176-FFD30E890A8A" }
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
    { titulo: "El Tuturutu: La historia del personaje", url: "https://rpp.pe/peru/actualidad/arequipa-el-tuturutu-un-sereno-permanente-de-la-plaza-de-armas-noticia-316433" },
    { titulo: "Guía de fotografía nocturna", url: "https://blog.incarail.com/es/plaza-de-armas-de-arequipa" }
  ],

  "catedral": [
    { titulo: "Museo de la Catedral y Campanario", url: "https://www.museocatedralarequipa.org.pe/visitenos.html" },
    { titulo: "El órgano de Loret (Historia)", url: "https://rpp.pe/peru/actualidad/el-organo-de-loret-la-joya-de-la-catedral-de-arequipa-noticia-645927" },
    { titulo: "Horarios de Misa", url: "https://www.arzobispadoarequipa.org.pe/horarios" }
  ],

  "ruta del sillar": [
    { titulo: "Cómo llegar por cuenta propia", url: "https://www.youtube.com/watch?v=HuR1q7i0yZU" },
    { titulo: "Artesanos tallando en vivo (Video)", url: "https://www.youtube.com/watch?v=RQ-CJ1FbhvM" },
    { titulo: "Culebrillas: El cañón virgen", url: "https://www.ytuqueplanes.com/destinos/arequipa/ruta-del-sillar/cantera-de-culebrillas" }
  ],

  "mundo alpaca": [
    { titulo: "Diferencia: Llama, Alpaca y Vicuña", url: "https://www.caminosalkantay.com/blog/llama-alpaca-vicuna-y-guanaco-parecidos-pero-completamente-diferentes" },
    { titulo: "Entrada libre: Sitio web oficial", url: "https://mundoalpaca.com.pe/es/mundoalpaca-arequipa" },
    { titulo: "Tejido tradicional", url: "https://www.youtube.com/watch?v=j4QCehFOTME" }
  ],

  "molino de sabandía": [
    { titulo: "Paseos a caballo en la zona", url: "https://www.tripadvisor.com.pe/ShowUserReviews-g294313-d1061662-r417968579-Molino_de_Sabandia-Arequipa_Arequipa_Region.html" },
    { titulo: "Historia de la arquitectura (1621) ", url: "https://www.google.com/search?client=opera-gx&sca_esv=fcbfcae5e87b23b9&udm=7&fbs=AIIjpHx4nJjfGojPVHhEACUHPiMQht6_BFq6vBIoFFRK7qchKEOG9SkJ7ODu_B1g8gyvi7OsPNjpDI3V0JjLtQKJuuQUB7wZYrBPArnMnIVzGzhG7EJGnmhkmTLARgSSm6Irso9QiIxK-mOfNqoZbWdeGCvdTeCbL2x0EAC-IpXZX83_Fm4Qmm7ZdEwjtlluF2PkSQ0HphmfnMl7GUfgUMth-WKurgW5vg&q=historia+de+la+arquitectura+museo+de+sabandia&sa=X&ved=2ahUKEwi416e6u4mRAxVbCLkGHYiCLkAQtKgLegQIEBAB&biw=2515&bih=1285&dpr=0.9#fpstate=ive&vld=cid:33b8021e,vid:0oJUyM4__PM,st:0" },
    { titulo: "Mapa de ubicación", url: "https://satellites.pro/mapa_de_Sabandia" }
  ],

  "mansión del fundador": [
    { titulo: "Datos històricos", url: "https://www.lamansiondelfundador.com/todos" },
    { titulo: "Quién fue Garcí Manuel de Carbajal", url: "https://diarioelpueblo.com.pe/2024/08/17/don-garci-manuel-de-carbajal-fundador-de-arequipa" }
  ],

  "misti": [
    { titulo: "Guía para el ascenso (Trekking)", url: "https://www.getyourguide.com/es-mx/-l200254/?cmp=ga&campaign_id=22903593978&adgroup_id=190858979264&target_id=kwd-939789583087&loc_physical_ms=9186201&match_type=b&ad_id=770255218471&keyword=volcán%20misti&ad_position=&feed_item_id=&placement=&device=c&assetgroup_id=&partner_id=CD951&gad_source=1&gad_campaignid=22903593978&gclid=CjwKCAiA_orJBhBNEiwABkdmjITin5Bt7nX_GC7hSN_WLgHCfPbjK-KR95-MgGEeAc9j1OpMwlapphoC2IYQAvD_BwE" },
    { titulo: "Recomendaciones de seguridad", url: "https://www.huillcaexpedition.com/es/blog/aclimatacion-para-subir-al-misti" },
    { titulo: "Vista 360 desde la cima", url: "https://elcomercio.pe/resizer/jRy6DTc19zMYJd5iJVLmhHM3rvA=/1200x672/smart/filters:format(jpeg):quality(75)/arc-anglerfish-arc2-prod-elcomercio.s3.amazonaws.com/public/AGOFZONLAFGJFPPAXHP3XDAZYI.jpg" },
    { titulo: "Vistia virtual de Arequipa", url: "https://arequipa360.com/es" }
  ],

  "mercado san camilo": [
    { titulo: "Jugos y Gastronomía imperdible", url: "https://www.instagram.com/reel/DL6ER55tk71" },
    { titulo: "La conexión con Gustave Eiffel", url: "https://www.google.com/search?q=La+conexión+con+Gustave+Eiffel+mercado+san+camilo&client=opera-gx&sca_esv=fcbfcae5e87b23b9&biw=2794&bih=1427&ei=PJ8jadmhLOSV5OUP2aaWoAs&ved=0ahUKEwjZr5HkvImRAxXkCrkGHVmTBbQQ4dUDCBE&uact=5&oq=La+conexión+con+Gustave+Eiffel+mercado+san+camilo&gs_lp=Egxnd3Mtd2l6LXNlcnAiMkxhIGNvbmV4acOzbiBjb24gR3VzdGF2ZSBFaWZmZWwgbWVyY2FkbyBzYW4gY2FtaWxvMgUQIRigATIFECEYoAFI_RhQAFifF3AAeACQAQCYAZsBoAGwEqoBBDAuMjC4AQPIAQD4AQL4AQGYAhSgAtQSwgIEECEYFcICBRAhGJ8FmAMAkgcEMC4yMKAHykyyBwQwLjIwuAfUEsIHBDEzLjfIBxE&sclient=gws-wiz-serp#fpstate=ive&vld=cid:f2c0154a,vid:PzPgphcevzw,st:0" }, 
    { titulo: "Comida riquita papu", url: "https://www.google.com/search?q=comprando+queso+y+pan+de+3+puntas+mercado+san+camilo&client=opera-gx&sca_esv=fcbfcae5e87b23b9&biw=2794&bih=1427&ei=VJ8jaargKJDC5OUPxJOZsQo&oq=comprando+queso+y+pand+e+3+puntas+mercado+&gs_lp=Egxnd3Mtd2l6LXNlcnAiKmNvbXByYW5kbyBxdWVzbyB5IHBhbmQgZSAzIHB1bnRhcyBtZXJjYWRvICoCCAAyBxAhGKABGApItEBQ_QVY1jlwAXgBkAEBmAHdAqABiyiqAQgxLjQwLjAuMbgBA8gBAPgBAZgCKqACgiaoAgrCAhAQABgDGLQCGOoCGI8B2AEBwgIQEC4YAxi0AhjqAhiPAdgBAcICChAAGIAEGEMYigXCAg0QABiABBixAxhDGIoFwgIREC4YgAQYsQMY0QMYgwEYxwHCAgsQABiABBixAxiDAcICBRAAGIAEwgIIEAAYgAQYsQPCAg4QLhiABBixAxjRAxjHAcICEBAuGIAEGEMYxwEYigUYrwHCAhAQABiABBixAxhDGMkDGIoFwgILEAAYgAQYsQMYkgPCAgsQABiABBiSAxiKBcICDhAAGIAEGLEDGIMBGIoFwgIOEC4YgAQYsQMYgwEYigXCAgYQABgWGB7CAgUQABjvBcICCBAAGKIEGIkFwgIIEAAYgAQYogTCAgUQIRigAcICBRAhGJ8FwgIEECEYFcICBhAhGBUYCpgDAvEFs6M-_4QxGGK6BgQIARgKkgcEMi40MKAH2vkBsgcEMS40MLgH_yXCBwUxOC4yNMgHMA&sclient=gws-wiz-serp#fpstate=ive&vld=cid:1a8a886f,vid:ZHw_rIiIKIY,st:0" }
  ],

  "museo santuarios andinos": [
    { titulo: "Historia de la Momia Juanita", url: "https://historia.nationalgeographic.com.es/a/asi-era-rosto-juanita-momia-peru_20392" },
    { titulo: "Reservar visita guiada", url: "https://apps.ucsm.edu.pe/UCSMERP/Msa1090.php" }
  ]
};

// ==========================================
// BASE DE DATOS LOCAL: WEBS Y MAPAS 
const DATOS_PRINCIPALES = {
  "santa catalina": {
    web: "https://santacatalina.org.pe/",
    mapa: "https://maps.app.goo.gl/gHU8YFzT55RQRZMQ6"
  },
  "yanahuara": {
    web: "https://www.peru.travel/es/atractivos/mirador-de-yanahuara", 
    mapa: "https://maps.app.goo.gl/meJi1447M5aqboix7" 
  },
  "colca": {
    web: "https://www.colcaperu.gob.pe/destinos",
    mapa: "https://maps.app.goo.gl/wAnxKcQXq7ABhdFSA"
  },
  "plaza de armas": {
    web: "https://www.ytuqueplanes.com/destinos/junin/tarma/plaza-de-armas",
    mapa: "https://maps.app.goo.gl/t1VTeU7SX8ze2E7L6"
  },
  "catedral": {
    web: "https://www.facebook.com/CatedralArequipa/?locale=es_LA",
    mapa: "https://maps.app.goo.gl/rDJiSjSf8KgaLTEt6"
  },
  "ruta del sillar": {
    web: "https://www.hvillasillar.com/ruta-de-sillar",
    mapa: "https://maps.app.goo.gl/HupFRd3M9iAYDiM36"
  },
  "mundo alpaca ": {
    web: "https://mundoalpaca.com.pe/es",
    mapa: "https://maps.app.goo.gl/Vr5C8jV9inhKcgnf9"
  },
  "molino de sabandia": {
    web: "https://www.facebook.com/elmolinodesabandia/?locale=es_LA",
    mapa: "https://maps.app.goo.gl/oj41cfykJJuatiw86"
  },
  "mansion del fundador": {
    web: "https://www.lamansiondelfundador.com",
    mapa: "https://maps.app.goo.gl/r37MmzKkmetU4Fzq5"
  },
  "misti": {
    web: "https://www.facebook.com/VolcanMisti/?locale=es_LA",
    mapa: "https://maps.app.goo.gl/5e9ueHzggWmiFhXg9"
  },
  "mercado san camino": {
    web: "https://www.facebook.com/mercadosancamiloarequipa/?locale=es_LA",
    mapa: "https://maps.app.goo.gl/fEjEwbp1y6GtSSdQA"
  },
  "museo santuarios andinos": {
    web: "https://ucsm.edu.pe/museo-santuarios-andinos-de-la-ucsm-dedicado-la-dama-del-ampato-abrio-sus-puertas-poblacion-arequipena-y-los-turistas",
    mapa: "https://maps.app.goo.gl/uSfRjYFSQcysQnp36"
  }
};

function LugaresPage() {
  const navigate = useNavigate();
  
  // Estados Principales
  const [categorias, setCategorias] = useState([]);
  const [lugaresPorCategoria, setLugaresPorCategoria] = useState({});
  const [loading, setLoading] = useState(true);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);

  // Estados para "Mis Enlaces" (Usuario)
  const [mostrarModalEnlaces, setMostrarModalEnlaces] = useState(false);
  const [misEnlaces, setMisEnlaces] = useState({}); 
  const [nuevoEnlaceInput, setNuevoEnlaceInput] = useState("");
  const [nuevaNotaInput, setNuevaNotaInput] = useState("");

  // ESTADO PARA RECOMENDACIONES
  const [mostrarModalRecomendados, setMostrarModalRecomendados] = useState(false);

  // Cargar enlaces del localStorage al iniciar
  useEffect(() => {
    const enlacesGuardados = localStorage.getItem("mis_enlaces_lugares");
    if (enlacesGuardados) {
      setMisEnlaces(JSON.parse(enlacesGuardados));
    }
  }, []);

  // Helpers
  const getHorarioReal = (nombreLugar) => {
    if (!nombreLugar) return "09:00 AM - 05:00 PM";
    const nombreNormalizado = nombreLugar.toLowerCase().trim();
    const keyEncontrada = Object.keys(HORARIOS_AREQUIPA).find(key => 
      nombreNormalizado.includes(key) || key.includes(nombreNormalizado)
    );
    return keyEncontrada ? HORARIOS_AREQUIPA[keyEncontrada] : "Lun - Dom: 09:00 AM - 05:00 PM";
  };

  const getDescripcionReal = (lugar) => {
    if (!lugar || !lugar.nombre) return "Descripción no disponible.";
    const nombreNormalizado = lugar.nombre.toLowerCase().trim();
    const keyEncontrada = Object.keys(DESCRIPCIONES_AREQUIPA).find(key => 
      nombreNormalizado.includes(key) || key.includes(nombreNormalizado)
    );
    if (keyEncontrada) return DESCRIPCIONES_AREQUIPA[keyEncontrada];
    return lugar.descripcion && lugar.descripcion.length > 10 
      ? lugar.descripcion 
      : "Descubre este maravilloso destino turístico en Arequipa, lleno de historia y belleza natural.";
  };

  // Helper para buscar tus recomendaciones
  const getRecomendaciones = (nombreLugar) => {
    if (!nombreLugar) return [];
    const nombreNormalizado = nombreLugar.toLowerCase().trim();
    const keyEncontrada = Object.keys(ENLACES_RECOMENDADOS).find(key => 
      nombreNormalizado.includes(key) || key.includes(nombreNormalizado)
    );
    return keyEncontrada ? ENLACES_RECOMENDADOS[keyEncontrada] : [];
  };

  // Cargar info
  useEffect(() => {
    const cargarCategoriasYLugares = async () => {
      try {
        setLoading(true);
        const data = await obtenerCategorias();
        if (data.success) {
          setCategorias(data.categorias);
          const lugaresPromises = data.categorias.map(cat => obtenerLugaresPorCategoria(cat.id));
          const lugaresResults = await Promise.all(lugaresPromises);
          
          const lugaresMap = {};
          
          data.categorias.forEach((cat, index) => {
            if (lugaresResults[index].success) {
              const lugaresBrutos = lugaresResults[index].lugares;

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
        console.error('Error al cargar categorías y lugares:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarCategoriasYLugares();
  }, []);

  const handleVolver = () => navigate("/foryou");
  const handleLugarClick = (lugar) => setLugarSeleccionado(lugar);
  
  const handleCerrarDetalle = () => {
    setLugarSeleccionado(null);
    setMostrarModalEnlaces(false); 
    setMostrarModalRecomendados(false);
  };

  // Funciones Mis Enlaces
  const handleAbrirEnlaces = (e) => {
    e.stopPropagation();
    setMostrarModalEnlaces(true);
    setMostrarModalRecomendados(false);
  };
  const handleCerrarEnlaces = () => {
    setMostrarModalEnlaces(false);
    setNuevoEnlaceInput("");
    setNuevaNotaInput("");
  };
  const handleAgregarEnlace = () => {
    if (!nuevoEnlaceInput.trim()) return;
    const lugarId = lugarSeleccionado.id;
    const enlacesActuales = misEnlaces[lugarId] || [];
    const nuevo = { id: Date.now(), url: nuevoEnlaceInput, nota: nuevaNotaInput || "Enlace interesante" };
    const nuevosEnlaces = { ...misEnlaces, [lugarId]: [...enlacesActuales, nuevo] };
    setMisEnlaces(nuevosEnlaces);
    localStorage.setItem("mis_enlaces_lugares", JSON.stringify(nuevosEnlaces));
    setNuevoEnlaceInput("");
    setNuevaNotaInput("");
  };
  const handleEliminarEnlace = (enlaceId) => {
    const lugarId = lugarSeleccionado.id;
    const enlacesActuales = misEnlaces[lugarId] || [];
    const enlacesFiltrados = enlacesActuales.filter(e => e.id !== enlaceId);
    const nuevosEnlaces = { ...misEnlaces, [lugarId]: enlacesFiltrados };
    setMisEnlaces(nuevosEnlaces);
    localStorage.setItem("mis_enlaces_lugares", JSON.stringify(nuevosEnlaces));
  };

  // Funciones Recomendados
  const handleAbrirRecomendados = (e) => {
    e.stopPropagation();
    setMostrarModalRecomendados(true);
    setMostrarModalEnlaces(false);
  };
  const handleCerrarRecomendados = () => setMostrarModalRecomendados(false);

  return (
    <div className="travel-layout">
      <header className="travel-header">
        <div className="header-content">
          <div className="brand-logo">
            <div className="mountain-icon"></div>
            <h1>
              <span className="brand-pacha">Pacha</span>
              <span className="brand-qutec">Qutec</span>
            </h1>
          </div>
          <button onClick={handleVolver} className="btn-secondary">
            <span>←</span> Inicio
          </button>
        </div>
      </header>

      <main className="travel-main">
        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Descubriendo destinos...</p>
          </div>
        )}

        {!loading && !lugarSeleccionado && (
          <div className="feed-container">
            {categorias.map((categoria) => (
              <section key={categoria.id} className="category-section">
                <div className="category-header">
                  <div className="category-title-group">
                    <span className="category-emoji">{categoria.icono}</span>
                    <div>
                      <h2>{categoria.nombre}</h2>
                      <p className="category-subtitle">{categoria.descripcion}</p>
                    </div>
                  </div>
                  <span className="badge-count">
                    {lugaresPorCategoria[categoria.id]?.length || 0} destinos
                  </span>
                </div>

                <div className="places-grid">
                  {lugaresPorCategoria[categoria.id] && lugaresPorCategoria[categoria.id].map((lugar) => (
                    <article key={lugar.id} className="place-card" onClick={() => handleLugarClick(lugar)}>
                      <div className="card-image-wrapper">
                        <img src={lugar.imagen_url} alt={lugar.nombre} loading="lazy" />
                        <div className="card-overlay">
                          <h3>{lugar.nombre}</h3>
                          <span className="view-details-text">Ver detalles</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {lugarSeleccionado && (
        <div className="modal-backdrop" onClick={handleCerrarDetalle}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCerrarDetalle}>×</button>
            
            <div className="modal-hero-image">
              <img src={lugarSeleccionado.imagen_url} alt={lugarSeleccionado.nombre} />
              <div className="modal-hero-overlay">
                <h1>{lugarSeleccionado.nombre}</h1>
              </div>
            </div>
            
            <div className="modal-content">
              <p className="modal-description">{getDescripcionReal(lugarSeleccionado)}</p>
              
              <div className="details-grid">
                <div className="detail-box">
                  <span className="detail-icon">🕒</span>
                  <div>
                    <h4>Horarios</h4>
                    <p>{getHorarioReal(lugarSeleccionado.nombre)}</p>
                  </div>
                </div>
                <div className="detail-box">
                  <span className="detail-icon">📍</span>
                  <div>
                    <h4>Ubicación</h4>
                    <p>{lugarSeleccionado.coordenadas || "Arequipa, Perú"}</p>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {(() => {
                  const nombreNorm = lugarSeleccionado.nombre.toLowerCase().trim();
                  // Busca si existe en tu lista manual (busca por partes del nombre para asegurar)
                  const keyEncontrada = Object.keys(DATOS_PRINCIPALES).find(key => 
                    nombreNorm.includes(key) || key.includes(nombreNorm)
                  );
                  const datosManuales = keyEncontrada ? DATOS_PRINCIPALES[keyEncontrada] : null;

                  // Define las URLs finales (Usa la manual si existe, sino intenta usar la de la BD o un default)
                  const finalWeb = datosManuales ? datosManuales.web : (lugarSeleccionado.enlace || "#");
                  
                  // Para el mapa: Si tienes el manual úsalo, sino genera una búsqueda automática en Google Maps
                  const finalMapa = datosManuales ? datosManuales.mapa : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugarSeleccionado.nombre + " Arequipa")}`;

                  return (
                    <>
                      <a href={finalWeb} target="_blank" rel="noopener noreferrer" className="btn-primary">
                        Visitar Web
                      </a>
                      <a href={finalMapa} target="_blank" rel="noopener noreferrer" className="btn-outline">
                        Ver Mapa
                      </a>
                    </>
                  );
                })()}
                
                <button onClick={handleAbrirEnlaces} className="btn-links">
                  🔗 Mis Enlaces
                </button>
                <button onClick={handleAbrirRecomendados} className="btn-recommended">
                  ⭐ Recomendados
                </button>
              </div>
            </div>

            {mostrarModalEnlaces && (
              <div className="links-popover-overlay">
                <div className="links-popover">
                  <div className="links-header">
                    <h3>Mis enlaces personales</h3>
                    <button onClick={handleCerrarEnlaces} className="close-links">×</button>
                  </div>
                  <div className="links-body">
                    {(!misEnlaces[lugarSeleccionado.id] || misEnlaces[lugarSeleccionado.id].length === 0) && (
                      <p className="empty-links">No has guardado enlaces aquí.</p>
                    )}
                    <ul className="links-list">
                      {misEnlaces[lugarSeleccionado.id]?.map((link) => (
                        <li key={link.id} className="link-item">
                          <a href={link.url} target="_blank" rel="noopener noreferrer">{link.nota}</a>
                          <button onClick={() => handleEliminarEnlace(link.id)} className="delete-link">🗑️</button>
                        </li>
                      ))}
                    </ul>
                    <div className="add-link-form">
                      <input type="text" placeholder="Nota" value={nuevaNotaInput} onChange={(e) => setNuevaNotaInput(e.target.value)} className="link-input-small"/>
                      <input type="text" placeholder="URL..." value={nuevoEnlaceInput} onChange={(e) => setNuevoEnlaceInput(e.target.value)} className="link-input"/>
                      <button onClick={handleAgregarEnlace} className="btn-add-link">Agregar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VENTANITA: RECOMENDADOS */}
            {mostrarModalRecomendados && (
              <div className="links-popover-overlay">
                <div className="links-popover recommended-popover">
                  <div className="links-header">
                    <h3>Recomendaciones PachaQutec</h3>
                    <button onClick={handleCerrarRecomendados} className="close-links">×</button>
                  </div>
                  <div className="links-body">
                    {getRecomendaciones(lugarSeleccionado.nombre).length === 0 ? (
                      <p className="empty-links">Pronto añadiremos recomendaciones para este lugar.</p>
                    ) : (
                      <ul className="links-list">
                        {getRecomendaciones(lugarSeleccionado.nombre).map((link, index) => (
                          <li key={index} className="link-item recommended-item">
                            <span className="icon-star">⭐</span>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.titulo}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <footer className="travel-footer">
        <p>© 2025 PachaQutec | UCSP</p>
      </footer>
    </div>
  );
}

export default LugaresPage;