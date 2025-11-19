import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./RDFViewer.css";

function RDFViewer() {
  const navigate = useNavigate();
  const [format, setFormat] = useState("turtle");
  const [rdfData, setRdfData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ categorias: 0, lugares: 0, usuarios: 0 });

  const formats = [
    { 
      id: "turtle", 
      name: "Turtle", 
      extension: "ttl",
      contentType: "text/turtle",
      icon: "🐢",
      description: "Formato legible y compacto"
    },
    { 
      id: "rdfxml", 
      name: "RDF/XML", 
      extension: "rdf",
      contentType: "application/rdf+xml",
      icon: "📄",
      description: "Estándar XML para RDF"
    },
    { 
      id: "jsonld", 
      name: "JSON-LD", 
      extension: "jsonld",
      contentType: "application/ld+json",
      icon: "📦",
      description: "JSON con contexto semántico"
    },
    { 
      id: "ntriples", 
      name: "N-Triples", 
      extension: "nt",
      contentType: "application/n-triples",
      icon: "📝",
      description: "Tripletas individuales"
    }
  ];

  const currentFormat = formats.find(f => f.id === format);

  useEffect(() => {
    loadRDFData();
    loadStats();
  }, [format]);

  const loadRDFData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await api.get(`/rdf/data?format=${format}`, {
        responseType: 'text',
        transformResponse: [(data) => data]
      });
      
      setRdfData(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los datos RDF');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [categorias, lugares, usuarios] = await Promise.all([
        api.get('/categorias'),
        api.get('/lugares'),
        api.get('/usuarios')
      ]);

      setStats({
        categorias: categorias.data.count || 0,
        lugares: lugares.data.count || 0,
        usuarios: usuarios.data.count || 0
      });
    } catch (err) {
      console.error('Error cargando stats:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([rdfData], { type: currentFormat.contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pachaqutec-data.${currentFormat.extension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rdfData);
    alert('📋 Copiado al portapapeles');
  };

  return (
    <div className="rdf-viewer-container">
      {/* Header */}
      <header className="rdf-header">
        <div className="rdf-header-content">
          <button className="btn-back" onClick={() => navigate("/foryou")}>
            ← Volver
          </button>
          <div className="rdf-header-title">
            <div className="logo">
              <div className="mountain"></div>
              <div className="logo-text">
                <span className="black">Pacha</span>
                <span className="orange">Qutec</span>
              </div>
            </div>
            <h1>Datos RDF - Web Semántica</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="rdf-main">
        <div className="rdf-container">
          
          {/* Información */}
          <div className="rdf-info-card">
            <div className="info-badge">
              <span className="badge-icon">🌐</span>
              <span className="badge-text">Web Semántica 3.0</span>
            </div>
            <h2>Explora los Datos en Formatos Linked Data</h2>
            <p>
              Descarga los datos turísticos de PachaQutec en formato RDF. 
              Compatible con SPARQL endpoints, triple stores y herramientas semánticas.
            </p>
            
            {/* Estadísticas */}
            <div className="rdf-stats">
              <div className="stat-item">
                <div className="stat-number">{stats.categorias}</div>
                <div className="stat-label">Categorías</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.lugares}</div>
                <div className="stat-label">Lugares</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.usuarios}</div>
                <div className="stat-label">Usuarios</div>
              </div>
            </div>
          </div>

          {/* Selector de Formato */}
          <div className="format-selector-card">
            <h3>Selecciona el Formato</h3>
            <div className="formats-grid">
              {formats.map(fmt => (
                <div 
                  key={fmt.id}
                  className={`format-option ${format === fmt.id ? 'selected' : ''}`}
                  onClick={() => setFormat(fmt.id)}
                >
                  <div className="format-icon">{fmt.icon}</div>
                  <div className="format-info">
                    <div className="format-name">{fmt.name}</div>
                    <div className="format-ext">.{fmt.extension}</div>
                  </div>
                  <div className="format-description">{fmt.description}</div>
                  {format === fmt.id && (
                    <div className="format-check">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visualizador */}
          <div className="rdf-viewer-card">
            <div className="viewer-header">
              <div className="viewer-title">
                <span className="viewer-icon">{currentFormat.icon}</span>
                <span>Vista Previa - {currentFormat.name}</span>
              </div>
              <div className="viewer-actions">
                <button className="btn-action" onClick={handleCopy} disabled={loading}>
                  📋 Copiar
                </button>
                <button className="btn-action btn-download" onClick={handleDownload} disabled={loading}>
                  ⬇️ Descargar
                </button>
              </div>
            </div>

            {loading && (
              <div className="viewer-loading">
                <div className="spinner-large"></div>
                <p>Generando RDF...</p>
              </div>
            )}

            {error && (
              <div className="viewer-error">
                <p>❌ {error}</p>
                <button onClick={loadRDFData}>Reintentar</button>
              </div>
            )}

            {!loading && !error && (
              <div className="viewer-content">
                <pre>
                  <code className={`language-${format}`}>
                    {rdfData}
                  </code>
                </pre>
              </div>
            )}
          </div>

          {/* Enlaces útiles */}
          <div className="rdf-links-card">
            <h3>📚 Recursos Útiles</h3>
            <div className="links-grid">
              <a href="https://www.w3.org/RDF/" target="_blank" rel="noopener noreferrer" className="link-item">
                <span className="link-icon">🌐</span>
                <div>
                  <div className="link-title">W3C RDF</div>
                  <div className="link-desc">Estándar de datos enlazados</div>
                </div>
              </a>
              <a href="https://www.easyrdf.org/converter" target="_blank" rel="noopener noreferrer" className="link-item">
                <span className="link-icon">🔄</span>
                <div>
                  <div className="link-title">Conversor RDF</div>
                  <div className="link-desc">Validar y convertir entre formatos</div>
                </div>
              </a>
              <a href="https://schema.org/" target="_blank" rel="noopener noreferrer" className="link-item">
                <span className="link-icon">📖</span>
                <div>
                  <div className="link-title">Schema.org</div>
                  <div className="link-desc">Vocabulario estándar web</div>
                </div>
              </a>
              <a href="http://dbpedia.org/" target="_blank" rel="noopener noreferrer" className="link-item">
                <span className="link-icon">🗃️</span>
                <div>
                  <div className="link-title">DBpedia</div>
                  <div className="link-desc">Datos enlazados de Wikipedia</div>
                </div>
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="rdf-footer">
        <p>
          Datos generados dinámicamente desde PostgreSQL<br />
          Ontología PachaQutec v1.0.0 - Compatible con Linked Open Data
        </p>
      </footer>
    </div>
  );
}

export default RDFViewer;