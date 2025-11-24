import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from "@react-google-maps/api";
import { obtenerLugares, obtenerCategorias } from "../services/api";
import { AREQUIPA_CENTER, defaultMapOptions } from "../services/ggmaps";
import "./Rutas.css";

function Rutas() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  // Estados
  const [lugares, setLugares] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState(null);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [lugaresRuta, setLugaresRuta] = useState([]);
  const [panelVisible, setPanelVisible] = useState(true);
  const [direcciones, setDirecciones] = useState(null);
  const [infoRuta, setInfoRuta] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [lugaresData, categoriasData] = await Promise.all([
        obtenerLugares(),
        obtenerCategorias()
      ]);

      if (lugaresData.success) {
        // Coordenadas reales de lugares turísticos de Arequipa
        const coordenadasReales = {
          'Plaza de Armas': { lat: -16.398866, lng: -71.536961 },
          'Monasterio de Santa Catalina': { lat: -16.396067622029932, lng: -71.5366005218032 },
          'Museo Casa Moral': { lat: -16.396802987371952, lng: -71.53775110786229 },
          'Casa del Moral': { lat: -16.396802987371952, lng: -71.53775110786229 },
          'Museo Santuarios Andinos': { lat: -16.399934882268333, lng: -71.53775211658956 },
          'Palacio Goyeneche': { lat: -16.400074006757187, lng: -71.53846799680905 },
          'Barrio de San Lázaro': { lat: -16.393323093967364, lng: -71.53388338678013 },
          'Complejo Jesuítico La Compañía': { lat: -16.39375117166113, lng: -71.53317136451146 },
          'Casa de Tristán del Pozo': { lat: -16.398085943416014, lng: -71.53598932977951 },
          'Casa Tristán del Pozo': { lat: -16.398085943416014, lng: -71.53598932977951 },
          'Volcán Misti': { lat: -16.295696, lng: -71.409072 },
          'Cañón del Colca': { lat: -15.610850, lng: -71.906478 },
          'Valle de los Volcanes': { lat: -15.537611488397234, lng: -72.3015335608065 },
          'Reserva Nacional Salinas': { lat: -16.366797979227773, lng: -71.20314955052105 },
          'Reserva Nacional de Salinas y Aguada Blanca': { lat: -16.366797979227773, lng: -71.20314955052105 },
          'Aguas Termales La Calera': { lat: -15.614179853941142, lng: -71.58674614531635 },
          'Mirador de los Volcanes': { lat: -15.759021, lng: -71.599145 },
          'Museo Histórico Municipal': { lat: -16.394655672567666, lng: -71.53550555201421 },
          'Museo Histórico Municipal Guillermo Zegarra': { lat: -16.394655672567666, lng: -71.53550555201421 },
          'Fundo El Fierro': { lat: -16.39406484223187, lng: -71.53529830135453 },
          'Teatro Municipal': { lat: -16.39903698669278, lng: -71.53416624090683 },
          'Teatro Municipal de Arequipa': { lat: -16.39903698669278, lng: -71.53416624090683 },
          'Casa de la Cultura': { lat: -16.399684760655227, lng: -71.53757199168287 },
          'Biblioteca Municipal': { lat: -16.402355687182176, lng: -71.5376309968206 },
          'Centro Cultural Chaves de la Rosa': { lat: -16.39780707547848, lng: -71.53748872802517 },
          'Centro Cultural Unsa': { lat: -16.39780707547848, lng: -71.53748872802517 },
          'Picantería Sol de Mayo': { lat: -16.389778933101468, lng: -71.54447795895904 },
          'Mercado San Camilo': { lat: -16.4028529200307, lng: -71.53497337606052 },
          'La Nueva Palomino': { lat: -16.386899986687226, lng: -71.53949285797295 },
          'Picantería La Nueva Palomino': { lat: -16.386899986687226, lng: -71.53949285797295 },
          'Zig Zag Restaurant': { lat: -16.39523643659754, lng: -71.53546205971878 },
          'Chicha por Gastón Acurio': { lat: -16.39605496368041, lng: -71.53646635663536 },
          'Tradición Arequipeña': { lat: -16.41811549298699, lng: -71.52618120957807 },
          // Coordenadas adicionales previas
          'Basílica Catedral de Arequipa': { lat: -16.398732, lng: -71.536891 },
          'Convento de la Recoleta': { lat: -16.393804634613513, lng: -71.54148217235459 },
          'Monasterio y Museo de la Recoleta': { lat: -16.393804634613513, lng: -71.54148217235459 },
          'Mirador de Yanahuara': { lat: -16.387572825511228, lng: -71.5419740129884 },
          'Molino de Sabandía': { lat: -16.456642175132036, lng: -71.49956907249177 },
          'Mansión del Fundador': { lat: -16.464060157347294, lng: -71.55740504663815 },
          'Campiña de Arequipa': { lat: -16.45826042984957, lng: -71.5190021313519 },
          'La Campiña Arequipeña': { lat: -16.45826042984957, lng: -71.5190021313519 },
          'Calle Mercaderes': { lat: -16.399167, lng: -71.537222 },
          'Puente Bolognesi': { lat: -16.397504158707417, lng: -71.54177705008851 },
          'Mundo Alpaca': { lat: -16.392918820090696, lng: -71.53543965435914 }
        };

        const lugaresConCoordenadas = lugaresData.lugares.map(lugar => {
          // Buscar coordenadas por nombre exacto o similar
          let coords = coordenadasReales[lugar.nombre];
          
          // Si no encuentra por nombre exacto, buscar por coincidencia parcial
          if (!coords) {
            const nombreLugar = lugar.nombre.toLowerCase();
            for (const [key, value] of Object.entries(coordenadasReales)) {
              if (nombreLugar.includes(key.toLowerCase()) || key.toLowerCase().includes(nombreLugar)) {
                coords = value;
                break;
              }
            }
          }
          
          // Si aún no hay coordenadas, usar las que vienen de BD o generar cerca del centro
          return {
            ...lugar,
            lat: lugar.lat || coords?.lat || (AREQUIPA_CENTER.lat + (Math.random() - 0.5) * 0.02),
            lng: lugar.lng || coords?.lng || (AREQUIPA_CENTER.lng + (Math.random() - 0.5) * 0.02)
          };
        });
        setLugares(lugaresConCoordenadas);
      }

      if (categoriasData.success) {
        setCategorias(categoriasData.categorias);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generar coordenadas aleatorias cerca de Arequipa (temporal - ya no se usa)
  const generarCoordenadasAleatorias = () => {
    const offsetLat = (Math.random() - 0.5) * 0.02; // Reducido el rango
    const offsetLng = (Math.random() - 0.5) * 0.02;
    return {
      lat: AREQUIPA_CENTER.lat + offsetLat,
      lng: AREQUIPA_CENTER.lng + offsetLng
    };
  };

  // Filtrar lugares
  const lugaresFiltrados = lugares.filter(lugar => {
    const matchBusqueda = lugar.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = !filtroCategoria || lugar.categoria_id === filtroCategoria;
    return matchBusqueda && matchCategoria;
  });

  // Manejar click en lugar
  const handleLugarClick = (lugar) => {
    setLugarSeleccionado(lugar);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: lugar.lat, lng: lugar.lng });
      mapRef.current.setZoom(15);
    }
  };

  // Agregar lugar a la ruta
  const handleAgregarRuta = (lugar) => {
    if (lugaresRuta.find(l => l.id === lugar.id)) {
      setLugaresRuta(lugaresRuta.filter(l => l.id !== lugar.id));
    } else {
      setLugaresRuta([...lugaresRuta, lugar]);
    }
  };

  // Generar ruta
  const handleGenerarRuta = useCallback(() => {
    if (lugaresRuta.length < 2) {
      alert('Selecciona al menos 2 lugares para generar una ruta');
      return;
    }

    const origen = { lat: lugaresRuta[0].lat, lng: lugaresRuta[0].lng };
    const destino = { lat: lugaresRuta[lugaresRuta.length - 1].lat, lng: lugaresRuta[lugaresRuta.length - 1].lng };
    const waypoints = lugaresRuta.slice(1, -1).map(lugar => ({
      location: { lat: lugar.lat, lng: lugar.lng },
      stopover: true
    }));

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: origen,
        destination: destino,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirecciones(result);
          
          // Calcular info de la ruta
          let distanciaTotal = 0;
          let duracionTotal = 0;
          
          result.routes[0].legs.forEach(leg => {
            distanciaTotal += leg.distance.value;
            duracionTotal += leg.duration.value;
          });
          
          setInfoRuta({
            distancia: (distanciaTotal / 1000).toFixed(1),
            duracion: Math.ceil(duracionTotal / 60),
            paradas: lugaresRuta.length
          });
        } else {
          console.error('Error al calcular ruta:', status);
          alert('No se pudo calcular la ruta');
        }
      }
    );
  }, [lugaresRuta]);

  // Limpiar ruta
  const handleLimpiarRuta = () => {
    setLugaresRuta([]);
    setDirecciones(null);
    setInfoRuta(null);
  };

  // Obtener icono de marcador según categoría
  const getMarkerIcon = (categoriaId) => {
    if (!window.google || !window.google.maps) {
      return null;
    }
  
    const categoria = categorias.find(c => c.id === categoriaId);
    
    const categoryColors = {
      1: '#8B4513',  // Histórico
      2: '#228B22',  // Naturaleza
      3: '#8B008B',  // Cultura
      4: '#DAA520',  // Gastronómico
      5: '#DC143C'   // Aventura
    };

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: categoryColors[categoriaId] || '#FF6B00',
      fillOpacity: 1,
      strokeColor: '#FFF',
      strokeWeight: 2,
      scale: 10
    };
  };

  if (loading) {
    return (
      <div className="rutas-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rutas-container">
      {/* Header */}
      <header className="rutas-header">
        <div className="rutas-header-content">
          <div className="header-left">
            <div className="header-title">
              <h1>Mapa de Rutas - Arequipa</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="rutas-main">
        {/* Panel Lateral */}
        <aside className={`panel-lateral ${!panelVisible ? 'oculto' : ''}`}>
          {/* Header del Panel */}
          <div className="panel-header">
            <h2 className="panel-title">📍 Lugares en Arequipa</h2>
            <div className="buscador-lugares">
              <span className="icono-buscar">🔍</span>
              <input
                type="text"
                className="input-buscar"
                placeholder="Buscar lugares..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="filtros-container">
            <div className="filtros-title">Filtrar por categoría:</div>
            <div className="filtros-chips">
              <div 
                className={`chip-filtro ${!filtroCategoria ? 'activo' : ''}`}
                onClick={() => setFiltroCategoria(null)}
              >
                Todos
              </div>
              {categorias.map(cat => (
                <div
                  key={cat.id}
                  className={`chip-filtro ${filtroCategoria === cat.id ? 'activo' : ''}`}
                  onClick={() => setFiltroCategoria(cat.id)}
                >
                  {cat.icono} {cat.nombre}
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Lugares */}
          <div className="lugares-lista">
            {lugaresFiltrados.length === 0 ? (
              <div className="sin-lugares">
                <div className="sin-lugares-icon">🔍</div>
                <p>No se encontraron lugares</p>
              </div>
            ) : (
              lugaresFiltrados.map(lugar => (
                <div 
                  key={lugar.id}
                  className={`lugar-item ${lugarSeleccionado?.id === lugar.id ? 'seleccionado' : ''}`}
                  onClick={() => handleLugarClick(lugar)}
                >
                  <div className="lugar-header">
                    <div 
                      className="lugar-icono"
                      style={{ 
                        background: categorias.find(c => c.id === lugar.categoria_id)?.color || '#FF6B00'
                      }}
                    >
                      {categorias.find(c => c.id === lugar.categoria_id)?.icono || '📍'}
                    </div>
                    <div className="lugar-info">
                      <div className="lugar-nombre">{lugar.nombre}</div>
                      <div className="lugar-categoria">
                        {categorias.find(c => c.id === lugar.categoria_id)?.nombre || 'Sin categoría'}
                      </div>
                    </div>
                  </div>
                  <p className="lugar-descripcion">{lugar.descripcion}</p>
                  <div className="lugar-acciones">
                    <button 
                      className={`btn-accion ${lugaresRuta.find(l => l.id === lugar.id) ? 'activo' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAgregarRuta(lugar);
                      }}
                    >
                      {lugaresRuta.find(l => l.id === lugar.id) ? '✓ En ruta' : '+ Agregar a ruta'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Mapa */}
        <div className="mapa-container">

          <div className="mapa-wrapper">
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={AREQUIPA_CENTER}
                zoom={13}
                options={defaultMapOptions}
                onLoad={(map) => { mapRef.current = map; }}
              >
                {/* Marcadores de lugares */}
                {lugares.map(lugar => (
                  <Marker
                    key={lugar.id}
                    position={{ lat: lugar.lat, lng: lugar.lng }}
                    onClick={() => handleLugarClick(lugar)}
                    icon={getMarkerIcon(lugar.categoria_id)}
                  />
                ))}

                {/* Info Window */}
                {lugarSeleccionado && (
                  <InfoWindow
                    position={{ lat: lugarSeleccionado.lat, lng: lugarSeleccionado.lng }}
                    onCloseClick={() => setLugarSeleccionado(null)}
                  >
                    <div className="info-window">
                      <h3>{lugarSeleccionado.nombre}</h3>
                      <p>{lugarSeleccionado.descripcion}</p>
                      <div className="info-window-actions">
                        <button 
                          className="btn-info"
                          onClick={() => handleAgregarRuta(lugarSeleccionado)}
                        >
                          {lugaresRuta.find(l => l.id === lugarSeleccionado.id) 
                            ? '✓ En ruta' 
                            : '+ Agregar'}
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}

                {/* Ruta generada */}
                {direcciones && (
                  <DirectionsRenderer 
                    directions={direcciones}
                    options={{
                      polylineOptions: {
                        strokeColor: '#FF6B00',
                        strokeWeight: 5
                      }
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>

          {/* Sección de acciones debajo del mapa */}
          <div className="mapa-acciones">
            {/* Botón Generar Ruta - ahora debajo del mapa */}
            <button 
              className="btn-generar-ruta"
              onClick={handleGenerarRuta}
              disabled={lugaresRuta.length < 2}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem'
              }}
            >
              🚗 Generar Ruta ({lugaresRuta.length} lugares seleccionados)
            </button>

            {/* Info de la Ruta - ahora debajo del botón */}
            {infoRuta && (
              <div className="ruta-info">
                <h3>📊 Información de la Ruta</h3>
                <div className="ruta-stat">
                  <span className="ruta-stat-icon">📏</span>
                  <div>
                    <div className="ruta-stat-label">Distancia</div>
                    <div className="ruta-stat-value">{infoRuta.distancia} km</div>
                  </div>
                </div>
                <div className="ruta-stat">
                  <span className="ruta-stat-icon">⏱️</span>
                  <div>
                    <div className="ruta-stat-label">Duración estimada</div>
                    <div className="ruta-stat-value">{infoRuta.duracion} min</div>
                  </div>
                </div>
                <div className="ruta-stat">
                  <span className="ruta-stat-icon">📍</span>
                  <div>
                    <div className="ruta-stat-label">Paradas</div>
                    <div className="ruta-stat-value">{infoRuta.paradas} lugares</div>
                  </div>
                </div>
                <button className="btn-limpiar-ruta" onClick={handleLimpiarRuta}>
                  🗑️ Limpiar Ruta
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Rutas;