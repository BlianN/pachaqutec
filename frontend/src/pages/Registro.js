import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarUsuario } from "../services/api";
import "./Registro.css";

function Registro() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    passwordConfirm: ""
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!aceptaTerminos) {
      setError("Debes aceptar los términos de uso");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const data = await registrarUsuario(
        formData.nombre,
        formData.email,
        formData.password
      );
      
      if (data.success) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        navigate("/intereses");
      } else {
        setError(data.error || "Error al crear cuenta");
      }
    } catch (err) {
      console.error("Error en registro:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVolverLogin = () => {
    navigate("/login");
  };

  return (
    <div className="registro-container">
      {/* Fondo espectacular */}
      <div className="registro-background">
        <div className="background-overlay"></div>
      </div>

      {/* Contenido principal */}
      <div className="registro-content">
        {/* Card del formulario */}
        <div className="registro-card">
          {/* Header del card */}
          <div className="registro-header">
            <div className="logo">
              <div className="mountain"></div>
              <div className="logo-text">
                <span className="black">Pacha</span>
                <span className="orange">Qutec</span>
              </div>
            </div>
            <p className="welcome-text">Crea tu cuenta</p>
            <p className="subtitle">Únete a nuestra comunidad de viajeros</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="registro-form">
            <div className="input-group">
              <label htmlFor="nombre">Nombre o apodo</label>
              <div className="input-container">
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="pepito123"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <span className="input-icon">👤</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <span className="input-icon">✉️</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="passwordConfirm">Repetir contraseña</label>
              <div className="input-container">
                <input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  placeholder="••••••••"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            {/* Checkbox términos */}
            <div className="checkbox-group">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  id="terms"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                Acepto los Términos de Uso del proyecto académico.
              </label>
            </div>

            {/* Mostrar errores */}
            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            <button 
              type="submit" 
              className={`registro-btn ${loading ? 'loading' : ''}`}
              disabled={loading || !aceptaTerminos}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creando cuenta...
                </>
              ) : (
                '🚀 Crear cuenta'
              )}
            </button>

            {/* Divisor */}
            <div className="divider">
              <span>o</span>
            </div>

            <button 
              type="button" 
              className="volver-btn"
              onClick={handleVolverLogin}
              disabled={loading}
            >
              ← Volver al login
            </button>
          </form>

          {/* Footer del card */}
          <div className="registro-footer">
            <p>¿Ya tienes una cuenta?</p>
            <button 
              className="login-link"
              onClick={handleVolverLogin}
              disabled={loading}
            >
              Iniciar sesión
            </button>
          </div>
        </div>

        {/* Texto de bienvenida lateral */}
        <div className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-badge">
              <span>✨ Únete a la aventura</span>
            </div>
            <h1>Comienza tu viaje en Arequipa</h1>
            <p>
              Regístrate y descubre rutas personalizadas, experiencias únicas 
              y los secretos mejor guardados de la Ciudad Blanca.
            </p>
            <div className="features-list">
              <div className="feature">
                <span className="feature-icon">🎯</span>
                <span>Rutas personalizadas con IA</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🤖</span>
                <span>Asistente virtual 24/7</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⭐</span>
                <span>Experiencias verificadas</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🕒</span>
                <span>Planificación adaptada a tu tiempo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="registro-footer-page">
        <div className="footer-content">
          <p>
            Proyecto académico - Desarrollo Basado en Plataformas<br />
            Universidad Católica San Pablo<br />
            Copyright© 2025. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Registro;