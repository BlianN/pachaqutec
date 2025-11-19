import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Categorias.css";

function Categorias() {
  const navigate = useNavigate();
  const [categoriaExpandida, setCategoriaExpandida] = useState(null);
  const [lugaresSeleccionados, setLugaresSeleccionados] = useState(new Set());

  const categorias = [
    {
      id: 1,
      nombre: "🏛️ HISTÓRICO",
      icono: "🏛️",
      descripcion: "Lugares que preservan la memoria de Arequipa",
      color: "#8B4513",
      lugares: [
        {
          id: 1,
          nombre: "Monasterio de Santa Catalina",
          imagen: "https://www.peru.travel/Contenido/General/Imagen/es/564/1.1/santa-catalina.jpg",
          descripcion: "Ciudadela religiosa del siglo XVI"
        },
        {
          id: 2,
          nombre: "Casa del Moral",
          imagen: "https://d30oa1noalw1jv.cloudfront.net/images/2bNjZ6lpC1BwobjwHYbNEyfVO1Lf0U-la-casa-del-moral-arequipa/la-casa-del-moral-arequipa-400.jpg",
          descripcion: "Mansión colonial con famosa portada barroca"
        },
        {
          id: 3,
          nombre: "Museo Santuarios Andinos",
          imagen: "https://ucsm.edu.pe/wp-content/uploads/2021/03/UCSM-Museo-Santuarios-Andinos-de-la-UCSM-reapertur%C3%B3-atenci%C3%B3n-a-turistas-y-a-poblaci%C3%B3n-arequipe%C3%B1a-Portada.png",
          descripcion: "Hogar de la Momia Juanita"
        },
        {
          id: 4,
          nombre: "Palacio Goyeneche",
          imagen: "https://d30oa1noalw1jv.cloudfront.net/images/mxZynUikkgMyCd8sMhHYUT7sKfAe8C-palacio-de-goyeneche-arequipa/palacio-de-goyeneche-arequipa-400.jpg",
          descripcion: "Arquitectura colonial y republicana"
        },
        {
          id: 5,
          nombre: "Barrio de San Lázaro",
          imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlwN5Sqy9vsjt7T4EX6AmL7sTbDc8M9minkA&s",
          descripcion: "Barrio fundacional con calles empedradas"
        },
        {
          id: 6,
          nombre: "Complejo Jesuítico La Compañía",
          imagen: "https://upload.wikimedia.org/wikipedia/commons/7/70/Iglesia_de_la_Compa%C3%B1%C3%ADa_de_Jes%C3%BAs_en_Arequipa.jpg",
          descripcion: "Conjunto arquitectónico religioso"
        },
        {
          id: 7,
          nombre: "Casa de Tristán del Pozo",
          imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpzEZNjwMmzJn5GbgJ-iiUMQ1ZiB1d5VzEsg&s",
          descripcion: "Ejemplo de casona arequipeña tradicional"
        }
      ]
    },
    {
      id: 2,
      nombre: "🌿 NATURALEZA",
      icono: "🌿",
      descripcion: "Entornos naturales y paisajes impresionantes",
      color: "#228B22",
      lugares: [
        {
          id: 8,
          nombre: "Volcán Misti",
          imagen: "https://media.traveler.es/photos/61376ddacb06ad0f20e12713/master/pass/143246.jpg",
          descripcion: "Icono natural de Arequipa (5,825 msnm)"
        },
        {
          id: 9,
          nombre: "Cañón del Colca",
          imagen: "https://machupicchuwayna.com/wp-content/uploads/2024/10/canon-del-colca-arequipa.webp",
          descripcion: "Uno de los más profundos del mundo"
        },
        {
          id: 10,
          nombre: "Reserva Nacional Salinas",
          imagen: "https://lacasonadelolivo.com.pe/wp-content/uploads/2018/04/Reserva-Nacional-Salinas-y-Aguada-Blanca.jpg",
          descripcion: "Flora y fauna andina única"
        },
        {
          id: 11,
          nombre: "Lagunas de Salinas",
          imagen: "https://skyperu.com/wp-content/uploads/2022/11/279410403_317072800558530_5578964687260798936_n-1024x1024.jpg",
          descripcion: "Espejos de agua en altura"
        },
        {
          id: 12,
          nombre: "Valle del Colca",
          imagen: "https://www.peru.travel/Contenido/Noticia/Imagen/es/1254/1.0/Principal/valle-colca.jpg",
          descripcion: "Paisajes agrícolas y terrazas incas"
        },
        {
          id: 13,
          nombre: "Aguas Termales La Calera",
          imagen: "https://terandes.com/wp-content/uploads/2023/01/la-calera-chivay-banos-termales.jpg",
          descripcion: "Aguas medicinales en Chivay"
        },
        {
          id: 14,
          nombre: "Mirador de los Volcanes",
          imagen: "https://elbuho.pe/wp-content/uploads/2021/06/192484888_4201199053291872_7447927856720252637_n.jpg",
          descripcion: "Vista panorámica de Misti, Chachani y Pichu Pichu"
        }
      ]
    },
    {
      id: 3,
      nombre: "🎭 CULTURA",
      icono: "🎭",
      descripcion: "Expresiones artísticas y tradiciones vivas",
      color: "#8B008B",
      lugares: [
        {
          id: 15,
          nombre: "Museo Histórico Municipal",
          imagen: "https://www.vivearequipa.com/wp-content/uploads/2022/06/pequena04_museo_historico_municipal_divulgacion-768x578-1-768x480.jpg",
          descripcion: "Historia de Arequipa desde 1540"
        },
        {
          id: 16,
          nombre: "Fundo El Fierro",
          imagen: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEijkDii5PHpzzm_zWUelnY0YndD3hAKzdneh0F1wgaK_wwk4oU-xMbiKZlSHEZlzLmelaq2Sn-m9t5hceNPPkK7IYgcKCswKOA3OSnSB2zYnhIKYtN8YRQ6AAioKYRpyYlaygrnr5OYzbcB/s1600/IMG_20191009_110206.jpg",
          descripcion: "Centro cultural y gastronómico"
        },
        {
          id: 17,
          nombre: "Teatro Municipal",
          imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk5WemCuD6JOmeuskAcuB4jTrca5XEFI-u5Q&s",
          descripcion: "Escenario principal de artes escénicas"
        },
        {
          id: 18,
          nombre: "Casa de la Cultura",
          imagen: "https://c8.alamy.com/comp/KY085M/arequipa-peru-may-12-2015-andes-museum-museo-santuarios-andinos-in-KY085M.jpg",
          descripcion: "Exposiciones y eventos culturales"
        },
        {
          id: 19,
          nombre: "Biblioteca Municipal",
          imagen: "https://www.bnp.gob.pe/wp-content/uploads/2021/01/Foto-sala-de-lectura-de-la-biblioteca-02.jpg",
          descripcion: "Archivo histórico y literario"
        },
        {
          id: 20,
          nombre: "Galería de Arte Pancho Fierro",
          imagen: "https://www.enlima.pe/sites/default/files/PANCHO-FIERRO-En-Lima-Agenda-Cultural.jpg",
          descripcion: "Exposiciones de arte contemporáneo"
        },
        {
          id: 21,
          nombre: "Centro Cultural Chaves de la Rosa",
          imagen: "https://diarioelpueblo.com.pe/wp-content/uploads/2023/03/galeria-3.-Artistas-de-diferentes-escuelas-tendencias-y-corrientes-exponen-su-arte_.jpg",
          descripcion: "Actividades culturales diversas"
        }
      ]
    },
    {
      id: 4,
      nombre: "🍽️ GASTRONÓMICO",
      icono: "🍽️",
      descripcion: "Sabores auténticos de la cocina arequipeña",
      color: "#DAA520",
      lugares: [
        {
          id: 22,
          nombre: "Picantería Sol de Mayo",
          imagen: "https://media-cdn.tripadvisor.com/media/photo-s/06/d3/54/21/sol-de-mayo.jpg",
          descripcion: "Comida tradicional arequipeña"
        },
        {
          id: 23,
          nombre: "Mercado San Camilo",
          imagen: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/75/4b/55/caption.jpg?w=1200&h=-1&s=1",
          descripcion: "Mercado tradicional con sabores locales"
        },
        {
          id: 24,
          nombre: "La Nueva Palomino",
          imagen: "https://larepublica.cronosmedia.glr.pe/migration/images/KKMCLVFVQ5GOXHOTEFU56J4H44.jpg",
          descripcion: "Picantería emblemática"
        },
        {
          id: 25,
          nombre: "Zig Zag Restaurant",
          imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsb7-RNemO6wb-fLlmWEmoLSf4pt2Nhijg-A&s",
          descripcion: "Fusión peruana-europea"
        },
        {
          id: 26,
          nombre: "Chicha por Gastón Acurio",
          imagen: "https://gestion.pe/resizer/v2/LGNJC53S5JFKZPVEVYFNJN3WVI.jpg?auth=a077f90ba233f94a10d8091f97712a72e9bb00e6523ecb49f96c45f336576b8d&width=1200&height=900&quality=75&smart=true",
          descripcion: "Alta cocina peruana"
        },
        {
          id: 27,
          nombre: "Tradición Arequipeña",
          imagen: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/09/b2/f0/photo2jpg.jpg?w=900&h=500&s=1",
          descripcion: "Cocina regional auténtica"
        },
        {
          id: 28,
          nombre: "Cevichería El Lago",
          imagen: "https://media-cdn.tripadvisor.com/media/photo-s/0f/30/62/04/hotel-el-lago-estelar.jpg",
          descripcion: "Pescados y mariscos frescos"
        }
      ]
    },
    {
      id: 5,
      nombre: "⛰️ AVENTURA",
      icono: "⛰️",
      descripcion: "Experiencias llenas de adrenalina y deporte",
      color: "#DC143C",
      lugares: [
        {
          id: 29,
          nombre: "Trekking al Volcán Misti",
          imagen: "https://www.pvtravels.com/wp-content/uploads/2021/12/Mistitrek-1024x669.jpg",
          descripcion: "Ascenso al volcán emblemático"
        },
        {
          id: 30,
          nombre: "Cabalgatas en la Campiña",
          imagen: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/5d/9a/2d/caption.jpg?w=1200&h=-1&s=1",
          descripcion: "Paseos a caballo por el campo"
        },
        {
          id: 31,
          nombre: "Ciclismo en Chiguata",
          imagen: "https://colca.info/images/tours/downhill-misti-chiguata-arequipa.jpg",
          descripcion: "Rutas desafiantes de montaña"
        },
        {
          id: 32,
          nombre: "Parapente en Cerro Colorado",
          imagen: "https://www.machupicchuterra.com/wp-content/uploads/arequipa-parapente.jpg",
          descripcion: "Vuelo con vistas panorámicas"
        },
        {
          id: 33,
          nombre: "Rappel en Quebrada San Lázaro",
          imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRq_ZRxB5Y6YEgVjCabl1dK0inSlVv0BlOYw&s",
          descripcion: "Deporte de aventura urbano"
        },
        {
          id: 34,
          nombre: "Sandboard en Dunas de Yura",
          imagen: "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/11/ec/96/2d.jpg",
          descripcion: "Deslizamiento en arena volcánica"
        },
        {
          id: 35,
          nombre: "Caminata a Cruz del Cóndor",
          imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhK0tqpCO4pXs4dBk9nW_RkssEK3Vabg9hQQ&s",
          descripcion: "Avistamiento de cóndores"
        }
      ]
    }
  ];

  const toggleCategoria = (categoriaId) => {
    setCategoriaExpandida(categoriaExpandida === categoriaId ? null : categoriaId);
  };

  const toggleLugarSeleccionado = (lugarId, e) => {
    e.stopPropagation(); // Evita que se active el click de la categoría
    const nuevosSeleccionados = new Set(lugaresSeleccionados);
    if (nuevosSeleccionados.has(lugarId)) {
      nuevosSeleccionados.delete(lugarId);
    } else {
      nuevosSeleccionados.add(lugarId);
    }
    setLugaresSeleccionados(nuevosSeleccionados);
  };

  const handleContinuar = () => {
    // Guardar selecciones en localStorage para usar después
    const selecciones = {
      lugares: Array.from(lugaresSeleccionados),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('lugaresSeleccionados', JSON.stringify(selecciones));
    
    navigate("/foryou");
  };

  return (
    <div className="categorias-modern-container">
      {/* Header */}
      <header className="categorias-modern-header">
        <div className="modern-header-content">
          <div className="modern-logo">
            <div className="glass-mountain"></div>
            <div className="modern-logo-text">
              <span className="glass-black">Pacha</span>
              <span className="glass-orange">Qutec</span>
            </div>
          </div>
          <button 
            className="btn-modern-volver"
            onClick={() => navigate("/intereses")}
          >
            ← Volver a Intereses
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="modern-hero">
        <h1>Descubre Arequipa por Categorías</h1>
        <p>Explora cada categoría y selecciona tus lugares favoritos para personalizar tu experiencia</p>
      </section>

      {/* Grid de Categorías - VIÑETAS */}
      <div className="categorias-grid-modern">
        {categorias.map((categoria) => (
          <div 
            key={categoria.id}
            className="categoria-card-modern"
          >
            <div className="categoria-card-header">
              <div 
                className="categoria-icon-modern"
                style={{ backgroundColor: categoria.color }}
              >
                {categoria.icono}
              </div>
              <div className="categoria-info-modern">
                <h2>{categoria.nombre}</h2>
                <p>{categoria.descripcion}</p>
                
                {/* Botón Ver Más - Solo se muestra si la categoría NO está expandida */}
                {categoriaExpandida !== categoria.id && (
                  <button 
                    className="btn-ver-mas"
                    onClick={() => toggleCategoria(categoria.id)}
                  >
                    🔍 Explorar {categoria.lugares.length} lugares
                  </button>
                )}
              </div>
            </div>

            {/* Lugares - Solo se muestran cuando la categoría está expandida */}
            {categoriaExpandida === categoria.id && (
              <div className="lugares-grid-modern">
                {categoria.lugares.map((lugar) => (
                  <div 
                    key={lugar.id}
                    className="lugar-card-modern"
                    onClick={(e) => toggleLugarSeleccionado(lugar.id, e)}
                  >
                    <div className="lugar-image-modern">
                      <img src={lugar.imagen} alt={lugar.nombre} />
                      <div className="lugar-overlay-modern">
                        <button 
                          className={`btn-guardar ${
                            lugaresSeleccionados.has(lugar.id) ? 'guardado' : ''
                          }`}
                        >
                          {lugaresSeleccionados.has(lugar.id) ? '✅ Guardado' : '💾 Guardar'}
                        </button>
                      </div>
                    </div>
                    <div className="lugar-content-modern">
                      <h3>{lugar.nombre}</h3>
                      <p>{lugar.descripcion}</p>
                    </div>
                  </div>
                ))}
                
                {/* Botón para cerrar la vista expandida */}
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '1rem' }}>
                  <button 
                    className="btn-ver-mas"
                    onClick={() => setCategoriaExpandida(null)}
                    style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
                  >
                    ↑ Cerrar {categoria.nombre}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contador de seleccionados */}
      {lugaresSeleccionados.size > 0 && (
        <div className="contador-seleccionados">
          <span>✅ {lugaresSeleccionados.size} lugares seleccionados</span>
        </div>
      )}

      {/* Botón continuar */}
      <div className="continuar-container-modern">
        <button 
          className="btn-ir-foryou-modern"
          onClick={handleContinuar}
          disabled={lugaresSeleccionados.size === 0}
        >
          {lugaresSeleccionados.size > 0 
            ? `🚀 Continuar con ${lugaresSeleccionados.size} lugares seleccionados`
            : 'Selecciona algunos lugares para continuar'
          }
        </button>
      </div>

      {/* Footer */}
      <footer className="categorias-modern-footer">
        <div className="modern-footer-content">
          <div className="footer-brand-modern">
            <div className="logo-small-modern">
              <div className="mountain-small-modern"></div>
              <div className="modern-logo-text">
                <span className="glass-black">Pacha</span>
                <span className="glass-orange">Qutec</span>
              </div>
            </div>
            <p>Tu guía personal para descubrir Arequipa</p>
          </div>
          <div className="footer-info-modern">
            <p>
              Proyecto académico - Desarrollo Basado en Plataformas<br />
              Universidad Católica San Pablo<br />
              Copyright© 2025. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Categorias;