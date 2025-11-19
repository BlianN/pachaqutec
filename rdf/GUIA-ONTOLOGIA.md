# 📚 GUÍA DE LA ONTOLOGÍA PACHAQUTEC

## 🎯 Introducción

La **Ontología PachaQutec** es un vocabulario semántico diseñado para modelar datos turísticos personalizados de Arequipa, Perú. Esta ontología permite:

- ✅ Representar lugares turísticos con categorías
- ✅ Modelar usuarios y sus preferencias
- ✅ Registrar favoritos y reseñas
- ✅ Integración con Linked Open Data (DBpedia, Wikidata, GeoNames)
- ✅ Consultas SPARQL avanzadas
- ✅ Interoperabilidad con otras aplicaciones web semánticas

---

## 🔗 URIs y Namespaces

### **Namespace Principal:**
```
https://pachaqutec.app/ontology#
Prefijo: pq:
```

### **Namespaces Importados:**

| Prefijo | URI | Descripción |
|---------|-----|-------------|
| `schema:` | http://schema.org/ | Vocabulario general web |
| `geo:` | http://www.w3.org/2003/01/geo/wgs84_pos# | Coordenadas geográficas |
| `dct:` | http://purl.org/dc/terms/ | Metadatos Dublin Core |
| `foaf:` | http://xmlns.com/foaf/0.1/ | Personas y grupos |
| `prov:` | http://www.w3.org/ns/prov# | Proveniencia de datos |
| `sioc:` | http://rdfs.org/sioc/ns# | Contenido generado por usuarios |
| `owl:` | http://www.w3.org/2002/07/owl# | Web Ontology Language |

---

## 📊 Clases Principales

### **1. pq:TourismCategory**
**Categoría Turística**

Representa una categorización de lugares turísticos.

**Propiedades:**
- `schema:name` - Nombre de la categoría
- `schema:description` - Descripción
- `pq:categoryIcon` - Emoji representativo
- `pq:categoryColor` - Color hexadecimal
- `pq:databaseId` - ID en PostgreSQL

**Ejemplo:**
```turtle
:CategoriaHistorico
    a pq:TourismCategory ;
    schema:name "Histórico"@es ;
    pq:categoryIcon "🏛️" ;
    pq:categoryColor "#667eea" .
```

---

### **2. pq:TouristPlace**
**Lugar Turístico**

Representa un lugar de interés turístico en Arequipa.

**Hereda de:** `schema:TouristAttraction`, `schema:Place`

**Propiedades:**
- `schema:name` - Nombre del lugar
- `schema:description` - Descripción detallada
- `schema:image` - URL de la imagen
- `schema:address` - Dirección física
- `geo:lat` - Latitud (WGS84)
- `geo:long` - Longitud (WGS84)
- `pq:belongsToCategory` - Categoría del lugar
- `pq:hasReview` - Reseñas asociadas
- `owl:sameAs` - Enlaces a DBpedia/Wikidata

**Ejemplo:**
```turtle
:MonasterioSantaCatalina
    a pq:TouristPlace, schema:LandmarksOrHistoricalBuildings ;
    schema:name "Monasterio de Santa Catalina"@es ;
    pq:belongsToCategory :CategoriaHistorico ;
    geo:lat "-16.3985"^^xsd:decimal ;
    geo:long "-71.5369"^^xsd:decimal ;
    owl:sameAs <http://dbpedia.org/resource/Santa_Catalina_Monastery> .
```

---

### **3. pq:TouristUser**
**Usuario Turista**

Representa un usuario registrado en la plataforma.

**Hereda de:** `schema:Person`, `foaf:Person`

**Propiedades:**
- `foaf:name` - Nombre completo
- `pq:userEmail` - Correo electrónico (único)
- `pq:passwordHash` - Hash de contraseña
- `pq:authenticatedWith` - Método de autenticación
- `pq:hasFavorite` - Lugares favoritos
- `pq:hasInterest` - Intereses turísticos

**Ejemplo:**
```turtle
:UsuarioJuan
    a pq:TouristUser ;
    foaf:name "Juan Pérez" ;
    pq:userEmail "juan@ejemplo.com" ;
    pq:authenticatedWith pq:GoogleOAuth ;
    pq:hasFavorite :FavoritoJuan1, :FavoritoJuan2 .
```

---

### **4. pq:Favorite**
**Favorito**

Relación entre un usuario y un lugar marcado como favorito.

**Propiedades:**
- `pq:isFavoriteOf` - Usuario que marcó el favorito
- `pq:favoritesPlace` - Lugar marcado
- `pq:favoritedAt` - Fecha/hora

**Restricciones:**
- Debe tener exactamente 1 usuario
- Debe tener exactamente 1 lugar

**Ejemplo:**
```turtle
:FavoritoJuan1
    a pq:Favorite ;
    pq:isFavoriteOf :UsuarioJuan ;
    pq:favoritesPlace :MonasterioSantaCatalina ;
    pq:favoritedAt "2025-11-16T15:30:00Z"^^xsd:dateTime .
```

---

### **5. pq:TourismReview**
**Reseña Turística**

Reseña escrita por un usuario sobre un lugar.

**Hereda de:** `schema:Review`, `sioc:Post`

**Propiedades:**
- `pq:reviewedBy` - Autor de la reseña
- `schema:itemReviewed` - Lugar reseñado
- `pq:reviewText` - Texto de la reseña
- `pq:reviewRating` - Calificación (1-5)
- `schema:datePublished` - Fecha de publicación

**Ejemplo:**
```turtle
:ResenaJuan1
    a pq:TourismReview ;
    pq:reviewedBy :UsuarioJuan ;
    schema:itemReviewed :MonasterioSantaCatalina ;
    pq:reviewText "Un lugar increíble..."@es ;
    pq:reviewRating 5 ;
    schema:datePublished "2025-11-16T16:00:00Z"^^xsd:dateTime .
```

---

### **6. pq:UserInterest**
**Interés de Usuario**

Preferencias turísticas seleccionadas por el usuario.

**Propiedades:**
- `pq:interestInCategory` - Categoría de interés

**Ejemplo:**
```turtle
:InteresJuanHistorico
    a pq:UserInterest ;
    pq:interestInCategory :CategoriaHistorico .

:UsuarioJuan pq:hasInterest :InteresJuanHistorico .
```

---

### **7. pq:UserSession**
**Sesión de Usuario**

Sesión activa de un usuario en la plataforma.

**Hereda de:** `prov:Activity`

**Propiedades:**
- `prov:wasAssociatedWith` - Usuario de la sesión
- `pq:sessionToken` - Token JWT
- `pq:rememberSession` - Recordar sesión (boolean)
- `prov:startedAtTime` - Inicio de sesión
- `prov:endedAtTime` - Fin de sesión

**Ejemplo:**
```turtle
:SesionJuan1
    a pq:UserSession ;
    prov:wasAssociatedWith :UsuarioJuan ;
    pq:sessionToken "eyJhbGci..." ;
    pq:rememberSession true ;
    prov:startedAtTime "2025-11-17T08:00:00Z"^^xsd:dateTime .
```

---

### **8. pq:AuthenticationMethod**
**Método de Autenticación**

Método usado para autenticar al usuario.

**Instancias predefinidas:**
- `pq:EmailPasswordAuth` - Email/Password tradicional
- `pq:GoogleOAuth` - Google OAuth2
- `pq:FacebookOAuth` - Facebook OAuth2

---

## 🔗 Propiedades de Objeto

| Propiedad | Dominio | Rango | Descripción |
|-----------|---------|-------|-------------|
| `pq:belongsToCategory` | TouristPlace | TourismCategory | Categoría del lugar |
| `pq:hasFavorite` | TouristUser | Favorite | Favoritos del usuario |
| `pq:isFavoriteOf` | Favorite | TouristUser | Usuario del favorito |
| `pq:favoritesPlace` | Favorite | TouristPlace | Lugar favorito |
| `pq:hasReview` | TouristPlace | TourismReview | Reseñas del lugar |
| `pq:reviewedBy` | TourismReview | TouristUser | Autor de la reseña |
| `pq:hasInterest` | TouristUser | UserInterest | Intereses del usuario |
| `pq:interestInCategory` | UserInterest | TourismCategory | Categoría de interés |
| `pq:authenticatedWith` | TouristUser | AuthenticationMethod | Método de auth |

---

## 📝 Propiedades de Datos

| Propiedad | Dominio | Tipo | Descripción |
|-----------|---------|------|-------------|
| `pq:categoryIcon` | TourismCategory | xsd:string | Emoji de categoría |
| `pq:categoryColor` | TourismCategory | xsd:string | Color hexadecimal |
| `pq:favoritedAt` | Favorite | xsd:dateTime | Fecha de favorito |
| `pq:reviewRating` | TourismReview | xsd:integer | Calificación 1-5 |
| `pq:reviewText` | TourismReview | xsd:string | Texto de reseña |
| `pq:userEmail` | TouristUser | xsd:string | Email (único) |
| `pq:passwordHash` | TouristUser | xsd:string | Hash de password |
| `pq:sessionToken` | UserSession | xsd:string | Token JWT |
| `pq:rememberSession` | UserSession | xsd:boolean | Recordar sesión |
| `pq:databaseId` | owl:Thing | xsd:integer | ID en PostgreSQL |

---

## 🌐 Integración con Linked Open Data

### **DBpedia:**
```turtle
:MonasterioSantaCatalina
    owl:sameAs <http://dbpedia.org/resource/Santa_Catalina_Monastery> .
```

### **Wikidata:**
```turtle
:MonasterioSantaCatalina
    owl:sameAs <https://www.wikidata.org/wiki/Q2074043> .
```

### **GeoNames:**
```turtle
<http://dbpedia.org/resource/Arequipa>
    owl:sameAs <http://sws.geonames.org/3947322/> .
```

---

## 🔍 Consultas SPARQL de Ejemplo

### **1. Obtener todos los lugares históricos:**
```sparql
PREFIX pq: <https://pachaqutec.app/ontology#>
PREFIX schema: <http://schema.org/>

SELECT ?lugar ?nombre ?descripcion
WHERE {
  ?categoria a pq:TourismCategory ;
             schema:name "Histórico" .
  
  ?lugar a pq:TouristPlace ;
         pq:belongsToCategory ?categoria ;
         schema:name ?nombre ;
         schema:description ?descripcion .
}
```

### **2. Favoritos de un usuario:**
```sparql
PREFIX pq: <https://pachaqutec.app/ontology#>
PREFIX schema: <http://schema.org/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?lugar ?nombre ?fecha
WHERE {
  ?usuario a pq:TouristUser ;
           foaf:name "Juan Pérez" ;
           pq:hasFavorite ?favorito .
  
  ?favorito pq:favoritesPlace ?lugar ;
            pq:favoritedAt ?fecha .
  
  ?lugar schema:name ?nombre .
}
ORDER BY DESC(?fecha)
```

### **3. Lugares cerca de una coordenada:**
```sparql
PREFIX pq: <https://pachaqutec.app/ontology#>
PREFIX schema: <http://schema.org/>
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

SELECT ?lugar ?nombre ?distancia
WHERE {
  ?lugar a pq:TouristPlace ;
         schema:name ?nombre ;
         geo:lat ?lat ;
         geo:long ?long .
  
  BIND(ABS(?lat - (-16.3985)) + ABS(?long - (-71.5369)) AS ?distancia)
  
  FILTER(?distancia < 0.01)
}
ORDER BY ?distancia
```

### **4. Promedio de calificaciones por lugar:**
```sparql
PREFIX pq: <https://pachaqutec.app/ontology#>
PREFIX schema: <http://schema.org/>

SELECT ?lugar ?nombre (AVG(?rating) AS ?promedio) (COUNT(?resena) AS ?total)
WHERE {
  ?lugar a pq:TouristPlace ;
         schema:name ?nombre ;
         pq:hasReview ?resena .
  
  ?resena pq:reviewRating ?rating .
}
GROUP BY ?lugar ?nombre
HAVING (?total > 1)
ORDER BY DESC(?promedio)
```

### **5. Usuarios con intereses en común:**
```sparql
PREFIX pq: <https://pachaqutec.app/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?usuario1 ?nombre1 ?usuario2 ?nombre2 (COUNT(?categoria) AS ?intereses_comunes)
WHERE {
  ?usuario1 a pq:TouristUser ;
            foaf:name ?nombre1 ;
            pq:hasInterest ?interes1 .
  
  ?usuario2 a pq:TouristUser ;
            foaf:name ?nombre2 ;
            pq:hasInterest ?interes2 .
  
  ?interes1 pq:interestInCategory ?categoria .
  ?interes2 pq:interestInCategory ?categoria .
  
  FILTER(?usuario1 != ?usuario2)
}
GROUP BY ?usuario1 ?nombre1 ?usuario2 ?nombre2
HAVING (?intereses_comunes > 0)
ORDER BY DESC(?intereses_comunes)
```

---

## 📐 Restricciones y Axiomas

### **Cardinalidad:**
- Un `Favorite` debe tener **exactamente 1** usuario
- Un `Favorite` debe tener **exactamente 1** lugar
- Un `TourismReview` debe tener **exactamente 1** autor
- Un `TouristPlace` debe tener **al menos 1** categoría

### **Rangos de Valores:**
- `pq:reviewRating` debe estar entre 1 y 5 (inclusive)
- `pq:userEmail` es una propiedad funcional (único)
- `pq:databaseId` es una propiedad funcional (único)

### **Propiedades Inversas:**
- `pq:hasFavorite` ⇔ `pq:isFavoriteOf`

---

## 🔐 Seguridad y Privacidad

### **Datos Sensibles:**
- `pq:passwordHash` - Nunca exponer en endpoints públicos
- `pq:sessionToken` - Solo para uso interno
- `pq:userEmail` - Puede ser privado según configuración

### **Recomendaciones:**
1. No incluir `passwordHash` en exports RDF públicos
2. Usar HTTPS para todos los endpoints
3. Implementar autenticación en SPARQL endpoints
4. Anonimizar datos de usuarios en dumps públicos

---

## 📦 Archivos de la Ontología

| Archivo | Formato | Descripción |
|---------|---------|-------------|
| `pachaqutec-ontology.ttl` | Turtle | Ontología base |
| `pachaqutec-ontology.rdf` | RDF/XML | Ontología base (XML) |
| `pachaqutec-example-data.ttl` | Turtle | Datos de ejemplo |

---

## 🚀 Próximos Pasos

1. ✅ Generar RDF dinámicamente desde PostgreSQL
2. ✅ Crear endpoints REST para RDF (Turtle y RDF/XML)
3. ✅ Setup de Apache Jena Fuseki (triple store)
4. ✅ Implementar consultas SPARQL
5. ✅ Integración con DBpedia/Wikidata
6. ✅ Asistente virtual con razonamiento semántico

---

## 📚 Referencias

- **Schema.org:** https://schema.org/
- **WGS84 Geo Ontology:** https://www.w3.org/2003/01/geo/
- **Dublin Core:** http://purl.org/dc/terms/
- **FOAF:** http://xmlns.com/foaf/spec/
- **OWL 2:** https://www.w3.org/TR/owl2-overview/
- **SPARQL 1.1:** https://www.w3.org/TR/sparql11-query/
- **Linked Open Data:** https://lod-cloud.net/

---

## 📧 Contacto

**Equipo PachaQutec - UCSP**
- Diego Calancho - Frontend
- Miguel Escobar - Backend
- Rodrigo Sulla - UI/UX

**Proyecto:** Desarrollo Basado en Plataformas  
**Universidad:** Universidad Católica San Pablo  
**Año:** 2025
