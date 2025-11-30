-- ============================================================
-- PACHAQUTEC - SCHEMA CON SOPORTE WIKIDATA
-- Versión: 2.0
-- Fecha: 2025-11-29
-- ============================================================

-- Habilitar extensión PostGIS para coordenadas geográficas
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- TABLA: usuarios (sin cambios)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- ============================================================
-- TABLA: categorias (sin cambios mayores)
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (id, nombre, descripcion, icono, color) VALUES
    (1, 'Histórico', 'Monumentos y sitios históricos de Arequipa', '🏛️', '#667eea'),
    (2, 'Naturaleza', 'Paisajes naturales y aventuras al aire libre', '🏞️', '#48bb78'),
    (3, 'Gastronomía', 'Sabores tradicionales arequipeños', '🍲', '#ed8936'),
    (4, 'Cultural', 'Museos y expresiones culturales', '🎭', '#9f7aea'),
    (5, 'Religioso', 'Iglesias y templos coloniales', '⛪', '#4299e1'),
    (6, 'Aventura', 'Deportes extremos y trekking', '🧗', '#f56565')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TABLA: wikidata_category_mapping
-- Mapeo entre QIDs de Wikidata y categorías locales
-- ============================================================
CREATE TABLE IF NOT EXISTS wikidata_category_mapping (
    id SERIAL PRIMARY KEY,
    wikidata_qid VARCHAR(20) NOT NULL UNIQUE,  -- ej: Q44613 (monasterio)
    wikidata_label VARCHAR(100),                -- ej: "monasterio"
    categoria_id INTEGER REFERENCES categorias(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mapeos iniciales basados en nuestra investigación
INSERT INTO wikidata_category_mapping (wikidata_qid, wikidata_label, categoria_id) VALUES
    -- Histórico (1)
    ('Q44613', 'monasterio', 1),
    ('Q16560', 'palacio', 1),
    ('Q3947', 'casa', 1),
    ('Q12280', 'puente', 1),
    ('Q537127', 'puente carretero', 1),
    ('Q676050', 'casco antiguo', 1),
    ('Q4989906', 'monumento', 1),
    
    -- Naturaleza (2)
    ('Q8502', 'montaña', 2),
    ('Q39816', 'valle', 2),
    ('Q355304', 'cascada', 2),
    ('Q23397', 'lago', 2),
    ('Q47089', 'volcán', 2),
    
    -- Cultural (4)
    ('Q33506', 'museo', 4),
    ('Q24354', 'teatro', 4),
    ('Q1329623', 'centro cultural', 4),
    ('Q2190251', 'centro artístico', 4),
    ('Q1254933', 'observatorio', 4),
    
    -- Religioso (5)
    ('Q2977', 'catedral', 5),
    ('Q16970', 'iglesia', 5),
    ('Q44539', 'templo', 5),
    ('Q56395672', 'iglesia jesuítica', 5),
    ('Q317557', 'convento', 5),
    
    -- Aventura (6)
    ('Q54050', 'cerro', 6),
    ('Q133056', 'ruta de senderismo', 6)
ON CONFLICT (wikidata_qid) DO NOTHING;

-- ============================================================
-- TABLA: lugares (ACTUALIZADA con campos Wikidata)
-- ============================================================
CREATE TABLE IF NOT EXISTS lugares (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    
    -- === NUEVOS CAMPOS WIKIDATA ===
    wikidata_id VARCHAR(20),              -- QID de Wikidata (ej: Q1538957)
    source VARCHAR(20) DEFAULT 'local',   -- 'local' o 'wikidata'
    local_override BOOLEAN DEFAULT FALSE, -- TRUE = no sobrescribir en sync
    wikidata_synced_at TIMESTAMP,         -- última sincronización
    
    -- === COORDENADAS ===
    latitude DECIMAL(10, 7),              -- -16.3985000
    longitude DECIMAL(10, 7),             -- -71.5369000
    
    -- === DATOS ADICIONALES ===
    address TEXT,                         -- dirección física
    website_url TEXT,                     -- sitio web oficial
    founding_date DATE,                   -- fecha de fundación/construcción
    architectural_style VARCHAR(100),     -- estilo arquitectónico
    heritage_status VARCHAR(100),         -- UNESCO, patrimonio nacional, etc.
    
    -- === IMÁGENES ===
    wikimedia_image_url TEXT,             -- URL de Wikimedia Commons
    image_source VARCHAR(20) DEFAULT 'local', -- 'local' o 'wikimedia'
    
    -- === LABELS MULTIIDIOMA ===
    nombre_en VARCHAR(200),               -- nombre en inglés
    descripcion_en TEXT,                  -- descripción en inglés
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: wikidata_id único si no es null
    CONSTRAINT unique_wikidata_id UNIQUE (wikidata_id)
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_lugares_wikidata_id ON lugares(wikidata_id);
CREATE INDEX IF NOT EXISTS idx_lugares_source ON lugares(source);
CREATE INDEX IF NOT EXISTS idx_lugares_categoria ON lugares(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lugares_coords ON lugares(latitude, longitude);

-- Insertar lugares existentes (actualizados con coordenadas)
INSERT INTO lugares (nombre, descripcion, imagen_url, categoria_id, source, latitude, longitude) VALUES
    -- Categoría: Histórico (1)
    ('Monasterio de Santa Catalina', 'Ciudadela religiosa del siglo XVI, considerada una ciudad dentro de la ciudad con calles coloridas y arquitectura colonial.', 'https://www.peru.travel/Contenido/General/Imagen/es/564/1.1/santa-catalina.jpg', 1, 'local', -16.3953, -71.5369),
    ('Plaza de Armas', 'Corazón de la ciudad blanca, rodeada de portales coloniales, la catedral basílica y el Portal del Cabildo.', 'https://media.istockphoto.com/id/809109190/es/foto/catedral-en-plaza-de-armas-arequipa-per%C3%BA.jpg', 1, 'local', -16.3988, -71.5370),
    ('Barrio de San Lázaro', 'El barrio más antiguo de Arequipa con callejuelas estrechas, casas de sillar blanco y miradores pintorescos.', 'https://www.amarujourneyperu.com/blog/wp-content/uploads/lazaro1.webp', 1, 'local', -16.3945, -71.5345),
    ('Casa del Moral', 'Casona colonial del siglo XVIII con fachada barroca y patio interior de estilo churrigueresco.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/d5/e0/3c/casa-del-moral.jpg', 1, 'local', -16.3978, -71.5358),
    
    -- Categoría: Naturaleza (2)
    ('Cañón del Colca', 'Uno de los cañones más profundos del mundo, hogar del majestuoso cóndor andino y paisajes espectaculares.', 'https://www.peru.travel/Contenido/Atractivo/Imagen/es/8/1.2/Principal/Ca%C3%B1on%20del%20Colca.jpg', 2, 'local', -15.6078, -71.8772),
    ('Volcán Misti', 'Icónico volcán de 5,822 metros que domina el skyline de Arequipa, ideal para trekking y montañismo.', 'https://media-cdn.tripadvisor.com/media/photo-s/13/72/f9/f4/vista-de-volcan-misti.jpg', 2, 'local', -16.2942, -71.4090),
    ('Valle de los Volcanes', 'Paisaje lunar con más de 80 conos volcánicos, considerado un laboratorio natural de vulcanología.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Valle_de_los_Volcanes_-_Andagua.jpg/1200px-Valle_de_los_Volcanes_-_Andagua.jpg', 2, 'local', -15.4167, -72.3333),
    ('Reserva Nacional Salinas y Aguada Blanca', 'Hogar de vicuñas, alpacas y flamencos andinos en un paisaje de puna con lagunas cristalinas.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXyZ5X8qQHQmQZFHqZQmVJYQqZqYQHqQZQmQ&s', 2, 'local', -16.0000, -71.1667),
    
    -- Categoría: Gastronomía (3)
    ('Picanterías Tradicionales', 'Restaurantes familiares donde se sirven platos típicos como rocoto relleno, adobo y chupe de camarones.', 'https://larepublica.cronosmedia.glr.pe/migration/images/KKMCLVFVQ5GOXHOTEFU56J4H44.jpg', 3, 'local', -16.4090, -71.5375),
    ('Mercado San Camilo', 'Mercado tradicional con productos locales, jugos de frutas exóticas y comida callejera auténtica.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/9c/8d/3e/mercado-san-camilo.jpg', 3, 'local', -16.4012, -71.5345),
    ('Ruta del Queso Helado', 'Recorrido por las heladerías tradicionales que preparan el famoso queso helado arequipeño.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqZ5X8qQHQmQZQHqZQmVJYQqZqYQHqQZQmQ&s', 3, 'local', -16.3995, -71.5368),
    
    -- Categoría: Cultural (4)
    ('Museo Santuarios Andinos', 'Hogar de la momia Juanita, la doncella de hielo encontrada en el volcán Ampato.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrQYKRt7pE8KITR1yR-efcetaNowyhX2sB9Q&s', 4, 'local', -16.3985, -71.5369),
    ('Casa Museo Mario Vargas Llosa', 'Casa natal del Premio Nobel de Literatura, convertida en museo interactivo sobre su vida y obra.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHqQZQmQZQHqZQmVJYQqZqYQHqQZQmQ&s', 4, 'local', -16.3992, -71.5348),
    ('Mirador de Yanahuara', 'Mirador con arcos de sillar que ofrecen vistas panorámicas de la ciudad y los volcanes.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/2c/85/82/mirador-de-yanahuara.jpg', 4, 'local', -16.3892, -71.5428),
    
    -- Categoría: Religioso (5)
    ('Catedral de Arequipa', 'Imponente templo neoclásico que ocupa todo un lado de la Plaza de Armas.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Catedral_de_Arequipa.jpg/1200px-Catedral_de_Arequipa.jpg', 5, 'local', -16.3985, -71.5372),
    ('Iglesia de la Compañía', 'Templo jesuita con impresionante fachada barroca mestiza y claustros coloniales.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHqZQmQZQHqZQmVJYQqZqYQHqQZQmQ&s', 5, 'local', -16.3995, -71.5355),
    ('Convento de Santa Teresa', 'Convento de clausura del siglo XVII que ahora funciona como museo de arte colonial.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmQZQHqZQmVJYQqZqYQHqQZQmQ&s', 5, 'local', -16.3962, -71.5378),
    
    -- Categoría: Aventura (6)
    ('Rafting en río Chili', 'Descenso de rápidos en el río que atraviesa la ciudad, apto para principiantes y expertos.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZQHqZQmVJYQqZqYQHqQZQmQ&s', 6, 'local', -16.4100, -71.5200),
    ('Trekking a Chachani', 'Ascenso al volcán Chachani (6,075m), uno de los seismiles más accesibles del mundo.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHqZQmVJYQqZqYQHqQZQmQ&s', 6, 'local', -16.1911, -71.5300),
    ('Canopy y Tirolesa', 'Circuito de tirolesas en el Valle del Colca con vistas espectaculares del cañón.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmQZQHqZQmVJYQqZqYQHqQZQmQ&s', 6, 'local', -15.6100, -71.8800)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLA: wikidata_sync_log
-- Registro de sincronizaciones con Wikidata
-- ============================================================
CREATE TABLE IF NOT EXISTS wikidata_sync_log (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL,       -- 'full', 'incremental', 'single'
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed'
    places_added INTEGER DEFAULT 0,
    places_updated INTEGER DEFAULT 0,
    places_skipped INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: wikidata_sync_changes
-- Detalle de cambios en cada sincronización
-- ============================================================
CREATE TABLE IF NOT EXISTS wikidata_sync_changes (
    id SERIAL PRIMARY KEY,
    sync_log_id INTEGER REFERENCES wikidata_sync_log(id) ON DELETE CASCADE,
    lugar_id INTEGER REFERENCES lugares(id) ON DELETE CASCADE,
    wikidata_id VARCHAR(20),
    change_type VARCHAR(20) NOT NULL,     -- 'added', 'updated', 'skipped'
    field_changed VARCHAR(50),            -- qué campo cambió
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sync_changes_log ON wikidata_sync_changes(sync_log_id);
CREATE INDEX IF NOT EXISTS idx_sync_changes_lugar ON wikidata_sync_changes(lugar_id);

-- ============================================================
-- TABLA: favoritos (sin cambios)
-- ============================================================
CREATE TABLE IF NOT EXISTS favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    lugar_id INTEGER REFERENCES lugares(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, lugar_id)
);

-- ============================================================
-- TABLA: resenas (sin cambios)
-- ============================================================
CREATE TABLE IF NOT EXISTS resenas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    lugar_id INTEGER REFERENCES lugares(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- FUNCIÓN: Actualizar timestamp automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para lugares
DROP TRIGGER IF EXISTS update_lugares_updated_at ON lugares;
CREATE TRIGGER update_lugares_updated_at
    BEFORE UPDATE ON lugares
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Reiniciar secuencias
-- ============================================================
SELECT setval('categorias_id_seq', (SELECT COALESCE(MAX(id), 0) FROM categorias));
SELECT setval('lugares_id_seq', (SELECT COALESCE(MAX(id), 0) FROM lugares));
SELECT setval('wikidata_category_mapping_id_seq', (SELECT COALESCE(MAX(id), 0) FROM wikidata_category_mapping));

-- ============================================================
-- VISTA: lugares_completos
-- Vista con toda la información de lugares incluyendo categoría
-- ============================================================
CREATE OR REPLACE VIEW lugares_completos AS
SELECT 
    l.id,
    l.nombre,
    l.descripcion,
    l.imagen_url,
    l.categoria_id,
    c.nombre as categoria_nombre,
    c.icono as categoria_icono,
    c.color as categoria_color,
    l.wikidata_id,
    l.source,
    l.local_override,
    l.wikidata_synced_at,
    l.latitude,
    l.longitude,
    l.address,
    l.website_url,
    l.founding_date,
    l.architectural_style,
    l.heritage_status,
    l.wikimedia_image_url,
    l.image_source,
    l.nombre_en,
    l.descripcion_en,
    l.created_at,
    l.updated_at
FROM lugares l
JOIN categorias c ON l.categoria_id = c.id;

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
