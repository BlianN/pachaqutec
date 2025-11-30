# 🌐 Guía de Integración Wikidata - PachaQutec

## Resumen de Cambios

Esta actualización agrega soporte completo para Linked Open Data mediante integración con Wikidata.

### Archivos Nuevos
- `init-wikidata.sql` - Schema actualizado con campos Wikidata
- `docker-compose.dev.yml` - Docker para desarrollo local
- `Dockerfile.dev` - Dockerfile con soporte CURL
- `src/WikidataClient.hpp` - Header del cliente SPARQL
- `src/WikidataClient.cpp` - Implementación del cliente
- `CMakeLists.txt` - Actualizado con libcurl
- `src/main.cpp` - Actualizado con nuevos endpoints

### Nuevos Endpoints API
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/wikidata/sync` | POST | Ejecutar sincronización con Wikidata |
| `/wikidata/preview` | GET | Ver lugares de Wikidata sin guardar |
| `/wikidata/sync/history` | GET | Historial de sincronizaciones |
| `/wikidata/categories` | GET | Ver mapeo de categorías Wikidata |

---

## 🚀 Instrucciones de Implementación

### Paso 1: Copia los archivos a tu proyecto local

```bash
# En tu PC, dentro de la carpeta pachaqutec
# Copia cada archivo que te proporcioné en su ubicación correcta
```

### Paso 2: Crear branch de desarrollo

```bash
cd /ruta/a/pachaqutec
git checkout main
git pull origin main
git checkout -b feature/wikidata-lod
```

### Paso 3: Levantar entorno de desarrollo

```bash
# IMPORTANTE: Esto usa una base de datos NUEVA, no afecta producción

# Eliminar volumen anterior (para tener schema limpio)
docker-compose -f docker-compose.dev.yml down -v

# Construir y levantar
docker-compose -f docker-compose.dev.yml up -d --build

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Paso 4: Verificar que funciona

```bash
# Verificar backend
curl http://localhost:8080/

# Ver categorías
curl http://localhost:8080/categorias

# Ver lugares (ahora con campos Wikidata)
curl http://localhost:8080/lugares

# Ver mapeo de categorías Wikidata
curl http://localhost:8080/wikidata/categories
```

### Paso 5: Preview de datos Wikidata

```bash
# Ver qué lugares obtendría de Wikidata (SIN guardar)
curl http://localhost:8080/wikidata/preview | jq
```

### Paso 6: Ejecutar sincronización

```bash
# Sincronizar con Wikidata (GUARDA en la base de datos)
curl -X POST http://localhost:8080/wikidata/sync | jq

# Respuesta esperada:
# {
#   "success": true,
#   "places_added": 15,
#   "places_updated": 0,
#   "places_skipped": 0
# }
```

### Paso 7: Verificar resultados

```bash
# Ver lugares actualizados
curl http://localhost:8080/lugares | jq '.lugares[] | {nombre, source, wikidata_id}'

# Ver historial de sincronizaciones
curl http://localhost:8080/wikidata/sync/history | jq
```

### Paso 8: Acceder a pgAdmin (opcional)

1. Abrir http://localhost:5050
2. Login: admin@pachaqutec.com / admin123
3. Agregar servidor:
   - Host: postgres
   - Puerto: 5432
   - Usuario: miusuario
   - Password: mipassword

---

## 📊 Estructura de Base de Datos Actualizada

### Tabla `lugares` (campos nuevos)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| wikidata_id | VARCHAR(20) | QID de Wikidata (ej: Q1538957) |
| source | VARCHAR(20) | 'local' o 'wikidata' |
| local_override | BOOLEAN | TRUE = no sobrescribir en sync |
| wikidata_synced_at | TIMESTAMP | Última sincronización |
| latitude | DECIMAL | Coordenada GPS |
| longitude | DECIMAL | Coordenada GPS |
| address | TEXT | Dirección física |
| website_url | TEXT | Sitio web oficial |
| founding_date | DATE | Fecha de fundación |
| architectural_style | VARCHAR | Estilo arquitectónico |
| heritage_status | VARCHAR | UNESCO, patrimonio, etc. |
| wikimedia_image_url | TEXT | URL imagen Wikimedia |
| nombre_en | VARCHAR | Nombre en inglés |
| descripcion_en | TEXT | Descripción en inglés |

### Tabla `wikidata_category_mapping`
Mapea QIDs de Wikidata a tus categorías locales.

### Tabla `wikidata_sync_log`
Registro de todas las sincronizaciones.

---

## 🔄 Flujo de Sincronización

```
1. POST /wikidata/sync
   ↓
2. Consulta SPARQL a Wikidata (lugares de Arequipa)
   ↓
3. Por cada lugar:
   - ¿Existe en DB (por wikidata_id)?
     - NO → INSERT nuevo lugar
     - SÍ → ¿local_override = true?
       - SÍ → SKIP (no actualizar)
       - NO → UPDATE con datos Wikidata
   ↓
4. Registrar en wikidata_sync_log
```

---

## ⚠️ Consideraciones Importantes

1. **No afecta producción**: `docker-compose.dev.yml` usa volúmenes separados

2. **Datos locales protegidos**: Si editas un lugar manualmente y pones `local_override = true`, la sincronización no lo sobrescribirá

3. **Rate limiting**: Wikidata tiene límites. No ejecutes sync más de 1-2 veces por hora

4. **Imágenes**: La sincronización trae URLs de Wikimedia Commons. Considera descargarlas a tu servidor para producción

---

## 🚢 Despliegue a Producción

### Cuando todo funcione en local:

1. **Hacer backup de la BD de producción**
```bash
# En el VPS
docker exec pachaqutec-postgres pg_dump -U pachaqutec_user pachaqutec_db > backup_pre_wikidata.sql
```

2. **Mergear a main**
```bash
git add .
git commit -m "feat: Integración Wikidata LOD"
git checkout main
git merge feature/wikidata-lod
git push origin main
```

3. **Actualizar producción**
```bash
# En el VPS
cd /var/www/pachaqutec
git pull origin main

# Aplicar migraciones a la BD existente
docker exec -i pachaqutec-postgres psql -U pachaqutec_user pachaqutec_db < migration-wikidata.sql

# Rebuild backend
docker-compose -f docker-compose.prod.yml up -d --build backend
```

4. **Ejecutar primera sincronización en producción**
```bash
curl -X POST https://api.pachaqutec.com/wikidata/sync
```

---

## 📝 Archivo de Migración (para producción)

Si ya tienes datos en producción, usa este archivo para agregar solo los campos nuevos sin perder datos:

```sql
-- migration-wikidata.sql
-- Ejecutar DESPUÉS de backup

-- Agregar campos a lugares existente
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS wikidata_id VARCHAR(20);
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'local';
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS local_override BOOLEAN DEFAULT FALSE;
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS wikidata_synced_at TIMESTAMP;
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7);
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS founding_date DATE;
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS architectural_style VARCHAR(100);
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS heritage_status VARCHAR(100);
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS wikimedia_image_url TEXT;
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS image_source VARCHAR(20) DEFAULT 'local';
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS nombre_en VARCHAR(200);
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS descripcion_en TEXT;
ALTER TABLE lugares ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Crear constraint único si no existe
ALTER TABLE lugares ADD CONSTRAINT IF NOT EXISTS unique_wikidata_id UNIQUE (wikidata_id);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_lugares_wikidata_id ON lugares(wikidata_id);
CREATE INDEX IF NOT EXISTS idx_lugares_source ON lugares(source);
CREATE INDEX IF NOT EXISTS idx_lugares_coords ON lugares(latitude, longitude);

-- Crear tabla de mapeo
CREATE TABLE IF NOT EXISTS wikidata_category_mapping (
    id SERIAL PRIMARY KEY,
    wikidata_qid VARCHAR(20) NOT NULL UNIQUE,
    wikidata_label VARCHAR(100),
    categoria_id INTEGER REFERENCES categorias(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar mapeos
INSERT INTO wikidata_category_mapping (wikidata_qid, wikidata_label, categoria_id) VALUES
    ('Q44613', 'monasterio', 1),
    ('Q2977', 'catedral', 5),
    ('Q16970', 'iglesia', 5),
    ('Q44539', 'templo', 5),
    ('Q33506', 'museo', 4),
    ('Q16560', 'palacio', 1),
    ('Q12280', 'puente', 1),
    ('Q24354', 'teatro', 4),
    ('Q676050', 'casco antiguo', 1),
    ('Q4989906', 'monumento', 1),
    ('Q1329623', 'centro cultural', 4),
    ('Q1254933', 'observatorio', 4)
ON CONFLICT (wikidata_qid) DO NOTHING;

-- Crear tablas de log
CREATE TABLE IF NOT EXISTS wikidata_sync_log (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'running',
    places_added INTEGER DEFAULT 0,
    places_updated INTEGER DEFAULT 0,
    places_skipped INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wikidata_sync_changes (
    id SERIAL PRIMARY KEY,
    sync_log_id INTEGER REFERENCES wikidata_sync_log(id) ON DELETE CASCADE,
    lugar_id INTEGER REFERENCES lugares(id) ON DELETE CASCADE,
    wikidata_id VARCHAR(20),
    change_type VARCHAR(20) NOT NULL,
    field_changed VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

¡Listo! Sigue los pasos en orden y tendrás Wikidata integrado. 🎉
