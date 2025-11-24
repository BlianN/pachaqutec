import React from "react";
import { useNavigate } from "react-router-dom";
import "./ContactanosPage.css";

function ContactanosPage() {
  const navigate = useNavigate();

  const handleVolver = () => {
    navigate("/foryou");
  };

  const integrantes = [
    {
      id: 1,
      nombre: "Mijael Pol Escobar Aguilar",
      correo: "mijael.escobar@ucsp.edu.pe",
      linkedin: "https://linkedin.com/in/mijael-escobar",
      facebook: "https://facebook.com/mijael.escobar",
      instagram: "https://instagram.com/mijael.escobar",
      telefono: "+51 123 456 789",
      rol: "Desarrollador backend y encargado de la IA"
    },
    {
      id: 2,
      nombre: "Diego Miguel Calancho Llerena",
      correo: "diego.calancho@ucsp.edu.pe",
      linkedin: "https://linkedin.com/in/diego-calancho",
      facebook: "https://facebook.com/diego.calancho",
      instagram: "https://instagram.com/diego.calancho",
      telefono: "+51 987 654 321",
      rol: "Desarrollador Backend"
    },
    {
      id: 3,
      nombre: "Rodrigo Fredy Sulla Gonzales",
      correo: "rodrigo.sulla@ucsp.edu.pe",
      linkedin: "https://linkedin.com/in/rodrigo-sulla",
      facebook: "https://facebook.com/rodrigo.sulla",
      instagram: "https://instagram.com/rodrigo.sulla",
      telefono: "+51 456 789 123",
      rol: "Desarrollador Frontend y de interfaces responsivas"
    }
  ];

  return (
    <div className="contactanos-container">

      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');`}
      </style>

      {/* Header */}
      <header className="contactanos-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="mountain-icon"></div>
            <h1>
              <span className="text-dark">Pacha</span>
              <span className="text-orange">Qutec</span>
            </h1>
          </div>
          
          <button onClick={handleVolver} className="btn-volver">
            <span className="icon-arrow">←</span> Volver al Inicio
          </button>
        </div>
      </header>

      <main className="contactanos-main">
        <div className="hero-section">
          <h2 className="main-title">Nuestro Equipo</h2>
          <p className="subtitle">
            Conoce a las mentes detrás de PachaQutec. <br/>
            Estamos listos para conectar contigo.
          </p>
        </div>

        <div className="integrantes-grid">
          {integrantes.map((integrante) => (
            <div key={integrante.id} className="integrante-card">
              <div className="card-banner"></div>
              <div className="avatar-container">
                <div className="avatar">
                  {integrante.nombre.split(' ')[0][0]}{integrante.nombre.split(' ')[1][0]}
                </div>
              </div>
              
              <div className="card-content">
                <h4 className="integrante-nombre">{integrante.nombre}</h4>
                <span className="integrante-rol">{integrante.rol}</span>
                
                <div className="divider"></div>

                <div className="contact-list">
                  <a href={`mailto:${integrante.correo}`} className="contact-item">
                    <span className="icon">📧</span> {integrante.correo}
                  </a>
                  <div className="contact-item">
                    <span className="icon">📱</span> {integrante.telefono}
                  </div>
                </div>

                <div className="social-row">
                  <a href={integrante.linkedin} target="_blank" rel="noopener noreferrer" className="social-btn linkedin">
                    LN
                  </a>
                  <a href={integrante.facebook} target="_blank" rel="noopener noreferrer" className="social-btn facebook">
                    FB
                  </a>
                  <a href={integrante.instagram} target="_blank" rel="noopener noreferrer" className="social-btn instagram">
                    IG
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="project-info-section">
          <h3>Sobre el Proyecto</h3>
          <div className="info-cards-container">
            <div className="info-mini-card">
              <span className="info-icon">🏫</span>
              <div>
                <small>Universidad</small>
                <p>Católica San Pablo</p>
              </div>
            </div>
            <div className="info-mini-card">
              <span className="info-icon">📚</span>
              <div>
                <small>Curso</small>
                <p>DBP</p>
              </div>
            </div>
            <div className="info-mini-card">
              <span className="info-icon">📅</span>
              <div>
                <small>Año</small>
                <p>2025</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="contactanos-footer">
        <p>© 2025 PachaQutec | Desarrollado con ❤️ en Arequipa</p>
      </footer>
    </div>
  );
}

export default ContactanosPage;