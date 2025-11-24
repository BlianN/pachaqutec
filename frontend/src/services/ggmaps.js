// Coordenadas del centro de Arequipa
export const AREQUIPA_CENTER = {
  lat: -16.4090474,
  lng: -71.537451
};

// Estilos personalizados del mapa (opcional - tema oscuro)
export const mapStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }]
  }
];

// Estilo claro (alternativo)
export const mapStylesLight = [];

/**
 * Opciones por defecto del mapa
 */
export const defaultMapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: mapStylesLight, // Cambiar a mapStyles para tema oscuro
  mapTypeId: 'roadmap'
};

/**
 * Obtener coordenadas de un lugar por nombre usando Geocoding API
 */
export const geocodeLugar = async (nombreLugar) => {
  try {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(nombreLugar + ', Arequipa, Peru')}&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng
      };
    }
    return null;
  } catch (error) {
    console.error('Error en geocoding:', error);
    return null;
  }
};

/**
 * Calcular ruta entre múltiples puntos
 */
export const calcularRuta = async (origen, destino, waypoints = []) => {
  const directionsService = new window.google.maps.DirectionsService();
  
  try {
    const result = await directionsService.route({
      origin: origen,
      destination: destino,
      waypoints: waypoints.map(wp => ({
        location: wp,
        stopover: true
      })),
      optimizeWaypoints: true,
      travelMode: window.google.maps.TravelMode.DRIVING
    });
    
    return result;
  } catch (error) {
    console.error('Error al calcular ruta:', error);
    throw error;
  }
};

/**
 * Obtener información de un lugar usando Places API
 */
export const buscarLugar = async (query) => {
  try {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' Arequipa')}&key=${apiKey}`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error al buscar lugar:', error);
    return [];
  }
};

/**
 * Iconos personalizados para marcadores
 */
export const markerIcons = {
  historico: {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: '#8B4513',
    fillOpacity: 1,
    strokeColor: '#FFF',
    strokeWeight: 2,
    scale: 10
  },
  naturaleza: {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: '#228B22',
    fillOpacity: 1,
    strokeColor: '#FFF',
    strokeWeight: 2,
    scale: 10
  },
  cultura: {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: '#8B008B',
    fillOpacity: 1,
    strokeColor: '#FFF',
    strokeWeight: 2,
    scale: 10
  },
  gastronomico: {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: '#DAA520',
    fillOpacity: 1,
    strokeColor: '#FFF',
    strokeWeight: 2,
    scale: 10
  },
  aventura: {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: '#DC143C',
    fillOpacity: 1,
    strokeColor: '#FFF',
    strokeWeight: 2,
    scale: 10
  }
};