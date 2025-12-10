import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { enviarMensajeChatbot } from "../services/chatbot";
import "./Chatbot.css";

function Chatbot() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [mensajes, setMensajes] = useState([
    { id: 1, text: "¡Hola viajero! 🏔️ Soy PachaBot. ¿Buscas algún destino en especial?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextoConversacion, setContextoConversacion] = useState({});
  const messagesEndRef = useRef(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (chatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes, chatOpen]);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const mensajeUsuario = inputText.trim();
    const nuevoMsg = { id: Date.now(), text: mensajeUsuario, sender: 'user' };
    setMensajes(prev => [...prev, nuevoMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Enviar mensaje con contexto conversacional
      const payload = {
        mensaje: mensajeUsuario,
        contexto: contextoConversacion
      };
      
      const data = await enviarMensajeChatbot(payload);
      
      // Agregar respuesta del bot
      setMensajes(prev => [...prev, { 
        id: Date.now() + 1, 
        text: data.respuesta_texto || "No pude procesar tu solicitud.",
        sender: 'bot' 
      }]);

      // Actualizar contexto si el bot está preguntando por categoría
      if (data.respuesta_texto && data.respuesta_texto.includes('tipo de lugares prefieres')) {
        setContextoConversacion({ esperando_categoria: true });
      } else if (contextoConversacion.esperando_categoria) {
        // Ya respondió la categoría, limpiar contexto
        setContextoConversacion({});
      }

      // Si hay ruta, redirigir a /rutas después de 1 segundo
      if (data.ruta_coordenadas && data.ruta_coordenadas.length > 0) {
        setTimeout(() => {
          navigate('/rutas', {
            state: {
              rutaGenerada: data.ruta_coordenadas,
              mensajeOriginal: mensajeUsuario
            }
          });
          setChatOpen(false);
          setContextoConversacion({}); // Resetear contexto
        }, 1000);
      }
    } catch (error) {
      console.error('Error al comunicarse con el chatbot:', error);
      setMensajes(prev => [...prev, { 
        id: Date.now() + 1, 
        text: '❌ No pude conectarme al servidor. Intenta de nuevo.',
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* VENTANA DEL CHAT */}
      {chatOpen && (
        <div className="chat-window-fixed">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar-circle">🤖</div>
              <div>
                <span className="chat-title">Asistente Pacha</span>
                <span className="chat-status">En línea</span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={toggleChat}>×</button>
          </div>

          <div className="chat-body">
            {mensajes.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}>
                <div className="message-bubble">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-message message-bot">
                <div className="message-bubble typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleEnviarMensaje}>
            <input 
              type="text" 
              placeholder="Escribe tu duda..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button type="submit" className="chat-send-btn" disabled={loading}>
              {loading ? '⏳' : '➤'}
            </button>
          </form>
        </div>
      )}

      {/* BOTÓN FLOTANTE DE ACTIVACIÓN */}
      <div 
        className="chatbot-trigger-wrapper"
        onClick={toggleChat}
        title="Abrir chat de ayuda"
      >
        {!chatOpen && (
          <div className="chat-tooltip-bubble">
            ¿Necesitas ayuda con tu viaje?
          </div>
        )}
        <button className={`chatbot-float-btn ${chatOpen ? 'open' : ''}`}>
          {chatOpen ? (
            <span style={{fontSize: '24px', fontWeight: 'bold', color: 'white'}}>✕</span>
          ) : (
            <span style={{fontSize: '28px'}}>💬</span>
          )}
        </button>
      </div>
    </>
  );
}

export default Chatbot;
