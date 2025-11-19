import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../config/firebase";
import { login, registrarUsuario } from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [recordarSesion, setRecordarSesion] = useState(false);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const sesionGuardada = localStorage.getItem("recordarSesion");
    const usuario = localStorage.getItem("usuario");
    
    if (sesionGuardada === "true" && usuario) {
      // Si hay sesión guardada, redirigir automáticamente
      console.log("✅ Sesión recordada, redirigiendo...");
      navigate("/foryou");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const data = await login(formData.email, formData.password);
      
      if (data.success) {
        // Guardar usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        
        // Guardar preferencia de recordar sesión
        if (recordarSesion) {
          localStorage.setItem("recordarSesion", "true");
        } else {
          localStorage.removeItem("recordarSesion");
        }
        
        console.log("✅ Login exitoso");
        navigate("/foryou");
      } else {
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error("Error en login:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log("✅ Google Auth exitoso:", user.displayName);
      
      // Intentar login primero (por si el usuario ya existe)
      try {
        const loginData = await login(user.email, user.uid);
        
        if (loginData.success) {
          localStorage.setItem("usuario", JSON.stringify(loginData.usuario));
          if (recordarSesion) localStorage.setItem("recordarSesion", "true");
          navigate("/foryou");
          return;
        }
      } catch (loginErr) {
        // Si falla, el usuario no existe, vamos a registrarlo
        console.log("Usuario no existe, registrando...");
      }
      
      // Registrar nuevo usuario con Google
      const registroData = await registrarUsuario(
        user.displayName || user.email.split('@')[0],
        user.email,
        user.uid // Usar UID de Google como password
      );
      
      if (registroData.success) {
        localStorage.setItem("usuario", JSON.stringify(registroData.usuario));
        if (recordarSesion) localStorage.setItem("recordarSesion", "true");
        navigate("/intereses"); // Nuevo usuario → Intereses
      } else {
        setError("Error al registrar con Google");
      }
    } catch (err) {
      console.error("Error en Google login:", err);
      setError("Error al iniciar sesión con Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      
      console.log("✅ Facebook Auth exitoso:", user.displayName);
      
      // Intentar login primero
      try {
        const loginData = await login(user.email, user.uid);
        
        if (loginData.success) {
          localStorage.setItem("usuario", JSON.stringify(loginData.usuario));
          if (recordarSesion) localStorage.setItem("recordarSesion", "true");
          navigate("/foryou");
          return;
        }
      } catch (loginErr) {
        console.log("Usuario no existe, registrando...");
      }
      
      // Registrar nuevo usuario con Facebook
      const registroData = await registrarUsuario(
        user.displayName || user.email.split('@')[0],
        user.email,
        user.uid
      );
      
      if (registroData.success) {
        localStorage.setItem("usuario", JSON.stringify(registroData.usuario));
        if (recordarSesion) localStorage.setItem("recordarSesion", "true");
        navigate("/intereses");
      } else {
        setError("Error al registrar con Facebook");
      }
    } catch (err) {
      console.error("Error en Facebook login:", err);
      setError("Error al iniciar sesión con Facebook");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Fondo espectacular */}
      <div className="login-background">
        <div className="background-overlay"></div>
      </div>

      {/* Contenido principal */}
      <div className="login-content">
        {/* Card del formulario */}
        <div className="login-card">
          {/* Header del card */}
          <div className="login-header">
            <div className="logo">
              <div className="mountain"></div>
              <div className="logo-text">
                <span className="black">Pacha</span>
                <span className="orange">Qutec</span>
              </div>
            </div>
            <p className="welcome-text">Bienvenido de vuelta</p>
            <p className="subtitle">Ingresa a tu cuenta para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            {/* Mostrar errores */}
            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            <div className="form-options">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={recordarSesion}
                  onChange={(e) => setRecordarSesion(e.target.checked)}
                  disabled={isLoading} 
                />
                <span className="checkmark"></span>
                Recordar sesión
              </label>
              <a href="#forgot" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button 
              type="submit" 
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Iniciando sesión...
                </>
              ) : (
                '🎯 Iniciar sesión'
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="divider">
            <span>o continúa con</span>
          </div>

          {/* Login social */}
          <div className="social-login">
            <button 
              className="social-btn google-btn" 
              type="button" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <span className="social-icon">🔴</span>
              Google
            </button>
            <button 
              className="social-btn facebook-btn" 
              type="button" 
              onClick={handleFacebookLogin}
              disabled={isLoading}
            >
              <span className="social-icon">👤</span>
              Facebook
            </button>
          </div>

          {/* Footer del card */}
          <div className="login-footer">
            <p>¿No tienes una cuenta?</p>
            <button 
              className="register-link"
              onClick={() => navigate("/registro")}
              disabled={isLoading}
            >
              Crear cuenta nueva
            </button>
          </div>

          {/* Credenciales de prueba */}
          <div className="credentials-test">
            <p className="credentials-title">💡 Credenciales de prueba:</p>
            <p className="credentials-text">
              Email: <strong>juan@ejemplo.com</strong>
            </p>
            <p className="credentials-text">
              Contraseña: <strong>password123</strong>
            </p>
          </div>
        </div>

        {/* Texto de bienvenida lateral */}
        <div className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-badge">
              <span>✨ Nuevo en PachaQutec</span>
            </div>
            <h1>Descubre Arequipa como nunca antes</h1>
            <p>
              Únete a nuestra comunidad de viajeros y descubre rutas personalizadas, 
              experiencias únicas y los secretos mejor guardados de la Ciudad Blanca.
            </p>
            <div className="features-list">
              <div className="feature">
                <span className="feature-icon">🗺️</span>
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
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer-page">
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

export default Login;