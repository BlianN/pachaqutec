import axios from 'axios';

// Configuración base de Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ==========================================
// ENDPOINTS - Usuarios
export const obtenerUsuarios = async () => {
  try {
    const response = await api.get('/usuarios');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// ==========================================
// ENDPOINTS - Autenticación
export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const registrarUsuario = async (nombre, email, password) => {
  try {
    const response = await api.post('/registro', { nombre, email, password });
    return response.data;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

// ==========================================
// ENDPOINTS - Lugares
export const obtenerLugares = async () => {
  try {
    const response = await api.get('/lugares');
    return response.data;
  } catch (error) {
    console.error('Error al obtener lugares:', error);
    throw error;
  }
};

export const obtenerFavoritos = async (usuarioId) => {
  try {
    const response = await api.get(`/favoritos/usuario/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    throw error;
  }
};

export const agregarFavorito = async (usuarioId, lugarId) => {
  try {
    const response = await api.post('/favoritos', { usuarioId, lugarId });
    return response.data;
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    throw error;
  }
};

export const eliminarFavorito = async (favoritoId) => {
  try {
    const response = await api.delete(`/favoritos/eliminar/${favoritoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    throw error;
  }
};

// ==========================================
// ENDPOINTS - Reseñas
export const obtenerResenas = async (usuarioId) => {
  try {
    const response = await api.get(`/resenas/usuario/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    throw error;
  }
};

export const crearResena = async (usuarioId, lugarId, texto, calificacion) => {
  try {
    const response = await api.post('/resenas', {
      usuarioId,
      lugarId,
      texto,
      calificacion
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear reseña:', error);
    throw error;
  }
};

// ==========================================
// ENDPOINTS - Categorías
export const obtenerCategorias = async () => {
  try {
    const response = await api.get('/categorias');
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

export const obtenerLugaresPorCategoria = async (categoriaId) => {
  try {
    console.log(`🔍 Solicitando lugares para categoría ID: ${categoriaId}`);
    const response = await api.get(`/categorias/${categoriaId}/lugares`);
    console.log(`📦 Respuesta para categoría ${categoriaId}:`, response.data);
    
    if (response.data.success) {
      console.log(`📍 Lugares encontrados: ${response.data.lugares?.length || 0}`);
      // Verificar duplicados
      const lugares = response.data.lugares || [];
      const ids = lugares.map(l => l.id);
      const uniqueIds = [...new Set(ids)];
      
      if (ids.length !== uniqueIds.length) {
        console.warn(`⚠️ DUPLICADOS DETECTADOS en categoría ${categoriaId}:`);
        console.warn(`   - Total lugares: ${lugares.length}`);
        console.warn(`   - Lugares únicos: ${uniqueIds.length}`);
        
        // Encontrar duplicados
        const duplicates = lugares.filter((item, index) => 
          lugares.findIndex(l => l.id === item.id) !== index
        );
        console.warn(`   - Elementos duplicados:`, duplicates);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener lugares por categoría:', error);
    throw error;
  }
};

// CORRECCIÓN: Usamos 'api' (axios) en lugar de fetch para aprovechar la configuración base
export const obtenerResenasUsuario = async (usuarioId) => {
  try {
    const response = await api.get(`/resenas/usuario/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener reseñas de usuario:", error);
    throw error;
  }
};


export default api;