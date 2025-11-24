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
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}
      </style>

      <div className="registro-background">
        <div className="background-overlay"></div>
      </div>

      <div className="registro-content">
        
        <div className="registro-card">
          <div className="registro-header">
            <div className="logo-container">
              <div className="mountain-icon"></div>
              <h1>
                <span className="text-dark">Pacha</span>
                <span className="text-orange">Qutec</span>
              </h1>
            </div>
            <p className="welcome-text">Crea tu cuenta</p>
            <p className="subtitle">Comienza tu aventura hoy mismo</p>
          </div>

          <form onSubmit={handleSubmit} className="registro-form">
            <div className="input-group">
              <label htmlFor="nombre">Nombre o apodo</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Juan Perez"
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
              <div className="input-wrapper">
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

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="passwordConfirm">Confirmar</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="passwordConfirm"
                    name="passwordConfirm"
                    placeholder="••••••"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>
            </div>

            <div className="checkbox-group">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                <span>Acepto los <a href="#">Términos y Condiciones</a></span>
              </label>
            </div>

            {error && (
              <div className="error-message">❌ {error}</div>
            )}

            <button 
              type="submit" 
              className={`registro-btn ${loading ? 'loading' : ''}`}
              disabled={loading || !aceptaTerminos}
            >
              {loading ? <span className="spinner"></span> : '🚀 Crear cuenta'}
            </button>

            <div className="divider">
              <span>o</span>
            </div>

            <div className="registro-footer">
              <p>¿Ya tienes cuenta?</p>
              <button 
                type="button"
                className="login-link-btn"
                onClick={handleVolverLogin}
                disabled={loading}
              >
                Inicia sesión aquí
              </button>
            </div>
          </form>
        </div>

        <div className="welcome-section">
          <div className="welcome-badge">
            <span>✨ Únete a la aventura</span>
          </div>
          <h1>Tu viaje en Arequipa<br/>comienza aquí</h1>
          <p>
            Regístrate para acceder a rutas personalizadas, 
            asistente virtual y los secretos mejor guardados de la Ciudad Blanca.
          </p>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Rutas IA</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span>Asistente 24/7</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⭐</span>
              <span>Experiencias Top</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p>© 2025 PachaQutec - Universidad Católica San Pablo</p>
      </footer>
    </div>
  );
}

export default Registro;