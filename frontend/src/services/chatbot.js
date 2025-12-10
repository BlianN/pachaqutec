import axios from 'axios';

// Configuración de la API del chatbot (Python microservice)
const chatbotApi = axios.create({
  baseURL: 'http://localhost:8000', // Puerto del servicio chatbot Python
  timeout: 30000, // 30 segundos para Gemini
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Enviar mensaje al chatbot (Python FastAPI + Gemini)
 * @param {string|object} payload - Mensaje del usuario o {mensaje, contexto}
 * @returns {Promise<{respuesta_texto: string, ruta_coordenadas: Array}>}
 */
export const enviarMensajeChatbot = async (payload) => {
  try {
    // payload puede ser string (mensaje simple) o objeto {mensaje, contexto}
    const data = typeof payload === 'string' ? { mensaje: payload } : payload;
    const response = await chatbotApi.post('/api/chatbot', data);
    return response.data;
  } catch (error) {
    console.error('Error al comunicarse con el chatbot:', error);
    throw error;
  }
};

export default chatbotApi;