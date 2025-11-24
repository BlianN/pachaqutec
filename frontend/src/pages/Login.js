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
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        if (recordarSesion) {
          localStorage.setItem("recordarSesion", "true");
        } else {
          localStorage.removeItem("recordarSesion");
        }
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
      
      try {
        const loginData = await login(user.email, user.uid);
        if (loginData.success) {
          localStorage.setItem("usuario", JSON.stringify(loginData.usuario));
          if (recordarSesion) localStorage.setItem("recordarSesion", "true");
          navigate("/foryou");
          return;
        }
      } catch (loginErr) { console.log("Usuario nuevo, registrando..."); }
      
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
        setError("Error al registrar con Google");
      }
    } catch (err) {
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
      try {
        const loginData = await login(user.email, user.uid);
        if (loginData.success) {
          localStorage.setItem("usuario", JSON.stringify(loginData.usuario));
          if (recordarSesion) localStorage.setItem("recordarSesion", "true");
          navigate("/foryou");
          return;
        }
      } catch (loginErr) { }
      const registroData = await registrarUsuario(
        user.displayName || user.email.split('@')[0],
        user.email,
        user.uid
      );
      if (registroData.success) {
        localStorage.setItem("usuario", JSON.stringify(registroData.usuario));
        if (recordarSesion) localStorage.setItem("recordarSesion", "true");
        navigate("/intereses");
      } else { setError("Error al registrar con Facebook"); }
    } catch (err) { setError("Error al iniciar sesión con Facebook"); } finally { setIsLoading(false); }
  };

  return (
    <div className="login-container">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}
      </style>

      <div className="login-background">
        <div className="background-overlay"></div>
      </div>

      <div className="login-content">
        
        <div className="login-card">
          <div className="login-header">
            {/* LOGO ARREGLADO */}
            <div className="logo-container">
              <div className="mountain-icon"></div>
              <h1>
                <span className="text-dark">Pacha</span>
                <span className="text-orange">Qutec</span>
              </h1>
            </div>
            <p className="welcome-title">Bienvenido de vuelta</p>
            <p className="subtitle">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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
                  disabled={isLoading}
                />
                <span className="input-icon">✉️</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
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

            {error && <div className="error-message">❌ {error}</div>}

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
              <a href="#forgot" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : 'Iniciar sesión'}
            </button>
          </form>

          <div className="divider"><span>o continúa con</span></div>

          <div className="social-login">
            <button className="social-btn google" onClick={handleGoogleLogin} disabled={isLoading}>
              <span className="social-icon">G</span> Google
            </button>
            <button className="social-btn facebook" onClick={handleFacebookLogin} disabled={isLoading}>
              <span className="social-icon">f</span> Facebook
            </button>
          </div>

          <div className="login-footer-card">
            <p>¿No tienes una cuenta?</p>
            <button className="register-link" onClick={() => navigate("/registro")} disabled={isLoading}>
              Crear cuenta nueva
            </button>
          </div>

          <div className="credentials-test">
            <p>💡 <strong>Demo:</strong> juan@ejemplo.com | password123</p>
          </div>
        </div>

        <div className="welcome-section">
          <div className="welcome-badge">
            <span>✨ Nuevo en PachaQutec</span>
          </div>
          <h1>Descubre Arequipa<br/>como nunca antes</h1>
          <p>
            Únete a nuestra comunidad de viajeros y descubre rutas personalizadas, 
            experiencias únicas y los secretos mejor guardados de la Ciudad Blanca.
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-emoji">🗺️</span>
              <span>Rutas personalizadas con IA</span>
            </div>
            <div className="feature-item">
              <span className="feature-emoji">🤖</span>
              <span>Asistente virtual 24/7</span>
            </div>
            <div className="feature-item">
              <span className="feature-emoji">⭐</span>
              <span>Experiencias verificadas</span>
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

export default Login;