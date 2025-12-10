-- Crear tabla de usuarios con contraseña
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo
INSERT INTO usuarios (nombre, email, password) VALUES
    ('Juan Pérez', 'juan@ejemplo.com', 'password123'),
    ('María García', 'maria@ejemplo.com', 'password123'),
    ('Carlos López', 'carlos@ejemplo.com', 'password123')
ON CONFLICT (email) DO NOTHING;

-- Crear índice en email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar categorías
INSERT INTO categorias (id, nombre, descripcion, icono, color) VALUES
    (1, 'Histórico', 'Monumentos y sitios históricos de Arequipa', '🏛️', '#667eea'),
    (2, 'Naturaleza', 'Paisajes naturales y aventuras al aire libre', '🏞️', '#48bb78'),
    (3, 'Gastronomía', 'Sabores tradicionales arequipeños', '🍲', '#ed8936'),
    (4, 'Cultural', 'Museos y expresiones culturales', '🎭', '#9f7aea'),
    (5, 'Religioso', 'Iglesias y templos coloniales', '⛪', '#4299e1'),
    (6, 'Aventura', 'Deportes extremos y trekking', '🧗', '#f56565')
ON CONFLICT (id) DO NOTHING;

-- Tabla para lugares turísticos con categoría
CREATE TABLE IF NOT EXISTS lugares (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar lugares organizados por categoría
INSERT INTO lugares (nombre, descripcion, imagen_url, categoria_id) VALUES
    -- Categoría: Histórico (1)
    ('Monasterio de Santa Catalina', 'Ciudadela religiosa del siglo XVI, considerada una ciudad dentro de la ciudad con calles coloridas y arquitectura colonial.', 'https://www.peru.travel/Contenido/General/Imagen/es/564/1.1/santa-catalina.jpg', 1),
    ('Plaza de Armas', 'Corazón de la ciudad blanca, rodeada de portales coloniales, la catedral basílica y el Portal del Cabildo.', 'https://upload.wikimedia.org/wikipedia/commons/6/65/Arequipac.jpg', 1),
    ('Barrio de San Lázaro', 'El barrio más antiguo de Arequipa con callejuelas estrechas, casas de sillar blanco y miradores pintorescos.', 'https://www.amarujourneyperu.com/blog/wp-content/uploads/lazaro1.webp', 1),
    ('Casa del Moral', 'Casona colonial del siglo XVIII con fachada barroca y patio interior de estilo churrigueresco.', 'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/6e/dc/b9.jpg', 1),
    
    -- Categoría: Naturaleza (2)
    ('Cañón del Colca', 'Uno de los cañones más profundos del mundo, hogar del majestuoso cóndor andino y paisajes espectaculares.', 'https://www.peru.travel/Contenido/Atractivo/Imagen/es/8/1.2/Principal/Ca%C3%B1on%20del%20Colca.jpg', 2),
    ('Volcán Misti', 'Icónico volcán de 5,822 metros que domina el skyline de Arequipa, ideal para trekking y montañismo.', 'https://media-cdn.tripadvisor.com/media/photo-s/13/72/f9/f4/vista-de-volcan-misti.jpg', 2),
    ('Valle de los Volcanes', 'Paisaje lunar con más de 80 conos volcánicos, considerado un laboratorio natural de vulcanología.', 'https://www.raptravelperu.com/wp-content/uploads/portada-volcanes.webp', 2),
    ('Reserva Nacional Salinas y Aguada Blanca', 'Hogar de vicuñas, alpacas y flamencos andinos en un paisaje de puna con lagunas cristalinas.', 'https://consultasenlinea.mincetur.gob.pe/fichaInventario/foto.aspx?cod=526875', 2),
    
    -- Categoría: Gastronomía (3)
    ('Picanterías Tradicionales', 'Restaurantes familiares donde se sirven platos típicos como rocoto relleno, adobo y chupe de camarones.', 'https://larepublica.cronosmedia.glr.pe/migration/images/KKMCLVFVQ5GOXHOTEFU56J4H44.jpg', 3),
    ('Mercado San Camilo', 'Mercado tradicional con productos locales, jugos de frutas exóticas y comida callejera auténtica.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/75/4b/55/caption.jpg?w=900&h=-1&s=1', 3),
    ('Ruta del Queso Helado', 'Recorrido por las heladerías tradicionales que preparan el famoso queso helado arequipeño.', 'https://www.rumbosdelperu.com/wp-content/uploads/2023/10/queso-helado-_04.jpg', 3),
    
    -- Categoría: Cultural (4)
    ('Museo Santuarios Andinos', 'Hogar de la momia Juanita, la doncella de hielo encontrada en el volcán Ampato.', 'https://i0.wp.com/machupicchusacred.com/wp-content/uploads/2025/03/Ubicacion-Horarios-y-Tarifas-del-Museo-Santuario-Andino.jpg?fit=1900%2C800&ssl=1', 4),
    ('Casa Museo Mario Vargas Llosa', 'Casa natal del Premio Nobel de Literatura, convertida en museo interactivo sobre su vida y obra.', 'https://itinari-images.s3.eu-west-1.amazonaws.com/activity/images/original/83f6b7ed-727d-459d-b6d4-8b552947b06d-15974941_381778488850388_2542505315389018686_o.png', 4),
    ('Mirador de Yanahuara', 'Mirador con arcos de sillar que ofrecen vistas panorámicas de la ciudad y los volcanes.', 'https://www.peru.travel/Contenido/Atractivo/Imagen/es/42/1.1/Principal/mirador-yanahuara.jpg', 4),
    
    -- Categoría: Religioso (5)
    ('Catedral de Arequipa', 'Imponente templo neoclásico que ocupa todo un lado de la Plaza de Armas.', 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Catedral_de_Arequipa.jpg', 5),
    ('Iglesia de la Compañía', 'Templo jesuita con impresionante fachada barroca mestiza y claustros coloniales.', 'https://upload.wikimedia.org/wikipedia/commons/3/30/Iglesia_de_la_Compa%C3%B1%C3%ADa%2C_Arequipa.jpg', 5),
    ('Convento de Santa Teresa', 'Convento de clausura del siglo XVII que ahora funciona como museo de arte colonial.', 'https://www.peru.travel/Contenido/General/Imagen/es/762/1.1/santa-teresa-convento.jpg', 5),
    
    -- Categoría: Aventura (6)
    ('Rafting en río Chili', 'Descenso de rápidos en el río que atraviesa la ciudad, apto para principiantes y expertos.', 'https://skyperu.com/wp-content/uploads/2021/10/4-13.jpg', 6),
    ('Trekking a Chachani', 'Ascenso al volcán Chachani (6,075m), uno de los seismiles más accesibles del mundo.', 'https://skyperu.com/wp-content/uploads/2021/10/5-5.jpg', 6),
    ('Canopy y Tirolesa', 'Circuito de tirolesas en el Valle del Colca con vistas espectaculares del cañón.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/e1/87/7a/experience-the-extreme.jpg?w=1200&h=-1&s=1', 6)
ON CONFLICT DO NOTHING;

-- Tabla para favoritos
CREATE TABLE IF NOT EXISTS favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    lugar_id INTEGER REFERENCES lugares(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, lugar_id)
);

-- Tabla para reseñas
CREATE TABLE IF NOT EXISTS resenas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    lugar_id INTEGER REFERENCES lugares(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reiniciar secuencias
SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));
SELECT setval('lugares_id_seq', (SELECT MAX(id) FROM lugares));