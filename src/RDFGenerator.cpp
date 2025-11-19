#include "RDFGenerator.hpp"
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <regex>

namespace pachaqutec {

// Definición de namespaces
const std::string RDFGenerator::NS_BASE = "https://pachaqutec.app/";
const std::string RDFGenerator::NS_DATA = "https://pachaqutec.app/data#";
const std::string RDFGenerator::NS_ONTOLOGY = "https://pachaqutec.app/ontology#";
const std::string RDFGenerator::NS_SCHEMA = "http://schema.org/";
const std::string RDFGenerator::NS_GEO = "http://www.w3.org/2003/01/geo/wgs84_pos#";
const std::string RDFGenerator::NS_DCT = "http://purl.org/dc/terms/";
const std::string RDFGenerator::NS_FOAF = "http://xmlns.com/foaf/0.1/";
const std::string RDFGenerator::NS_OWL = "http://www.w3.org/2002/07/owl#";
const std::string RDFGenerator::NS_XSD = "http://www.w3.org/2001/XMLSchema#";

// FUNCIÓN AUXILIAR PARA LIMPIAR STRINGS (reemplaza acentos)
std::string cleanUriSuffix(const std::string& input) {
    std::string result = input;
    
    // Remover espacios
    result.erase(std::remove(result.begin(), result.end(), ' '), result.end());
    
    // Reemplazar caracteres UTF-8 con sus equivalentes ASCII
    // Usar std::regex para buscar y reemplazar bytes UTF-8
    std::regex a_accent("á|Á");
    std::regex e_accent("é|É");
    std::regex i_accent("í|Í");
    std::regex o_accent("ó|Ó");
    std::regex u_accent("ú|Ú|ü|Ü");
    std::regex n_accent("ñ|Ñ");
    
    result = std::regex_replace(result, a_accent, "a");
    result = std::regex_replace(result, e_accent, "e");
    result = std::regex_replace(result, i_accent, "i");
    result = std::regex_replace(result, o_accent, "o");
    result = std::regex_replace(result, u_accent, "u");
    result = std::regex_replace(result, n_accent, "n");
    
    return result;
}

// ============================================================
// TURTLE - FUNCIONES PRINCIPALES
// ============================================================

std::string RDFGenerator::generateTurtle(const DbClientPtr& dbClient) {
    std::ostringstream rdf;
    
    // Prefijos
    rdf << getTurtlePrefixes();
    rdf << "\n# ============================================================\n";
    rdf << "# DATOS PACHAQUTEC - GENERADO AUTOMÁTICAMENTE\n";
    rdf << "# Fecha: " << trantor::Date::now().toDbStringLocal() << "\n";
    rdf << "# ============================================================\n\n";
    
    // Generar cada sección
    try {
        rdf << "# --- CATEGORÍAS ---\n";
        rdf << generateCategoriesTurtle(dbClient);
        rdf << "\n";
        
        rdf << "# --- LUGARES TURÍSTICOS ---\n";
        rdf << generatePlacesTurtle(dbClient);
        rdf << "\n";
        
        rdf << "# --- USUARIOS ---\n";
        rdf << generateUsersTurtle(dbClient);
        rdf << "\n";
        
        rdf << "# --- FAVORITOS ---\n";
        rdf << generateFavoritesTurtle(dbClient);
        rdf << "\n";
        
        rdf << "# --- RESEÑAS ---\n";
        rdf << generateReviewsTurtle(dbClient);
        rdf << "\n";
        
        rdf << "# ============================================================\n";
        rdf << "# FIN DE DATOS\n";
        rdf << "# ============================================================\n";
    } catch (const DrogonDbException& e) {
        LOG_ERROR << "Error generando RDF: " << e.base().what();
        return "# Error al generar RDF\n";
    }
    
    return rdf.str();
}

std::string RDFGenerator::generateCategoriesTurtle(const DbClientPtr& dbClient) {
    std::ostringstream rdf;
    
    auto result = dbClient->execSqlSync(
        "SELECT id, nombre, descripcion, icono, color FROM categorias ORDER BY id"
    );
    
    for (size_t i = 0; i < result.size(); ++i) {
        int id = result[i]["id"].as<int>();
        std::string nombre = result[i]["nombre"].as<std::string>();
        std::string descripcion = result[i]["descripcion"].as<std::string>();
        std::string icono = result[i]["icono"].as<std::string>();
        std::string color = result[i]["color"].as<std::string>();
        
        // URI de la categoría (sin espacios ni acentos)
        std::string uri_suffix = cleanUriSuffix(nombre);
        
        rdf << ":Categoria" << uri_suffix << "\n";
        rdf << "    a pq:TourismCategory ;\n";
        rdf << "    pq:databaseId " << id << " ;\n";
        rdf << "    schema:name \"" << escapeTurtle(nombre) << "\"@es ;\n";
        rdf << "    schema:description \"" << escapeTurtle(descripcion) << "\"@es ;\n";
        rdf << "    pq:categoryIcon \"" << escapeTurtle(icono) << "\" ;\n";
        rdf << "    pq:categoryColor \"" << escapeTurtle(color) << "\" ;\n";
        rdf << "    dct:created \"" << trantor::Date::now().toDbStringLocal() << "\"^^xsd:dateTime .\n\n";
    }
    
    return rdf.str();
}

std::string RDFGenerator::generatePlacesTurtle(const DbClientPtr& dbClient) {
    std::ostringstream rdf;
    
    auto result = dbClient->execSqlSync(
        "SELECT l.id, l.nombre, l.descripcion, l.imagen_url, l.categoria_id, c.nombre as categoria "
        "FROM lugares l "
        "JOIN categorias c ON l.categoria_id = c.id "
        "ORDER BY l.id"
    );
    
    for (size_t i = 0; i < result.size(); ++i) {
        int id = result[i]["id"].as<int>();
        std::string nombre = result[i]["nombre"].as<std::string>();
        std::string descripcion = result[i]["descripcion"].as<std::string>();
        std::string imagen_url = result[i]["imagen_url"].as<std::string>();
        int categoria_id = result[i]["categoria_id"].as<int>();
        std::string categoria = result[i]["categoria"].as<std::string>();
        
        // URI del lugar (sin espacios ni caracteres especiales)
        std::string uri_suffix = cleanUriSuffix(nombre);
        std::string cat_suffix = cleanUriSuffix(categoria);
        
        rdf << ":" << uri_suffix << "\n";
        rdf << "    a pq:TouristPlace, schema:TouristAttraction ;\n";
        rdf << "    pq:databaseId " << id << " ;\n";
        rdf << "    schema:name \"" << escapeTurtle(nombre) << "\"@es ;\n";
        rdf << "    schema:description \"" << escapeTurtle(descripcion) << "\"@es ;\n";
        rdf << "    pq:belongsToCategory :Categoria" << cat_suffix << " ;\n";
        rdf << "    schema:image <" << imagen_url << "> ;\n";
        rdf << "    schema:containedInPlace <http://dbpedia.org/resource/Arequipa> ;\n";
        rdf << "    dct:created \"" << trantor::Date::now().toDbStringLocal() << "\"^^xsd:dateTime .\n\n";
    }
    
    return rdf.str();
}

std::string RDFGenerator::generateUsersTurtle(const DbClientPtr& dbClient) {
    std::ostringstream rdf;
    
    auto result = dbClient->execSqlSync(
        "SELECT id, nombre, email FROM usuarios ORDER BY id"
    );
    
    for (size_t i = 0; i < result.size(); ++i) {
        int id = result[i]["id"].as<int>();
        std::string nombre = result[i]["nombre"].as<std::string>();
        std::string email = result[i]["email"].as<std::string>();
        
        rdf << ":Usuario" << id << "\n";
        rdf << "    a pq:TouristUser ;\n";
        rdf << "    pq:databaseId " << id << " ;\n";
        rdf << "    foaf:name \"" << escapeTurtle(nombre) << "\"@es ;\n";
        rdf << "    pq:userEmail \"" << escapeTurtle(email) << "\" ;\n";
        rdf << "    pq:authenticatedWith pq:EmailPasswordAuth ;\n";
        rdf << "    dct:created \"" << trantor::Date::now().toDbStringLocal() << "\"^^xsd:dateTime .\n\n";
    }
    
    return rdf.str();
}

std::string RDFGenerator::generateFavoritesTurtle(const DbClientPtr& dbClient) {
    std::ostringstream rdf;
    
    auto result = dbClient->execSqlSync(
        "SELECT f.id, f.usuario_id, f.lugar_id, f.created_at, l.nombre as lugar_nombre "
        "FROM favoritos f "
        "JOIN lugares l ON f.lugar_id = l.id "
        "ORDER BY f.id"
    );
    
    for (size_t i = 0; i < result.size(); ++i) {
        int id = result[i]["id"].as<int>();
        int usuario_id = result[i]["usuario_id"].as<int>();
        int lugar_id = result[i]["lugar_id"].as<int>();
        std::string created_at = result[i]["created_at"].as<std::string>();
        std::string lugar_nombre = result[i]["lugar_nombre"].as<std::string>();
        
        // URI del lugar
        std::string uri_suffix = cleanUriSuffix(lugar_nombre);
        
        rdf << ":Favorito" << id << "\n";
        rdf << "    a pq:Favorite ;\n";
        rdf << "    pq:databaseId " << id << " ;\n";
        rdf << "    pq:isFavoriteOf :Usuario" << usuario_id << " ;\n";
        rdf << "    pq:favoritesPlace :" << uri_suffix << " ;\n";
        rdf << "    pq:favoritedAt \"" << created_at << "\"^^xsd:dateTime ;\n";
        rdf << "    dct:created \"" << created_at << "\"^^xsd:dateTime .\n\n";
        
        rdf << ":Usuario" << usuario_id << " pq:hasFavorite :Favorito" << id << " .\n\n";
    }
    
    return rdf.str();
}

std::string RDFGenerator::generateReviewsTurtle(const DbClientPtr& dbClient) {
    std::ostringstream rdf;
    
    auto result = dbClient->execSqlSync(
        "SELECT r.id, r.usuario_id, r.lugar_id, r.texto, r.calificacion, r.created_at, "
        "l.nombre as lugar_nombre "
        "FROM resenas r "
        "JOIN lugares l ON r.lugar_id = l.id "
        "ORDER BY r.id"
    );
    
    for (size_t i = 0; i < result.size(); ++i) {
        int id = result[i]["id"].as<int>();
        int usuario_id = result[i]["usuario_id"].as<int>();
        int lugar_id = result[i]["lugar_id"].as<int>();
        std::string texto = result[i]["texto"].as<std::string>();
        
        int calificacion = 5;
        if (!result[i]["calificacion"].isNull()) {
            calificacion = result[i]["calificacion"].as<int>();
        }
        
        std::string created_at = result[i]["created_at"].as<std::string>();
        std::string lugar_nombre = result[i]["lugar_nombre"].as<std::string>();
        
        // URI del lugar
        std::string uri_suffix = cleanUriSuffix(lugar_nombre);
        
        rdf << ":Resena" << id << "\n";
        rdf << "    a pq:TourismReview ;\n";
        rdf << "    pq:databaseId " << id << " ;\n";
        rdf << "    pq:reviewedBy :Usuario" << usuario_id << " ;\n";
        rdf << "    schema:itemReviewed :" << uri_suffix << " ;\n";
        rdf << "    pq:reviewText \"" << escapeTurtle(texto) << "\"@es ;\n";
        rdf << "    pq:reviewRating " << calificacion << " ;\n";
        rdf << "    schema:reviewRating [\n";
        rdf << "        a schema:Rating ;\n";
        rdf << "        schema:ratingValue " << calificacion << " ;\n";
        rdf << "        schema:bestRating 5\n";
        rdf << "    ] ;\n";
        rdf << "    schema:datePublished \"" << created_at << "\"^^xsd:dateTime ;\n";
        rdf << "    dct:created \"" << created_at << "\"^^xsd:dateTime .\n\n";
        
        rdf << ":" << uri_suffix << " pq:hasReview :Resena" << id << " .\n\n";
    }
    
    return rdf.str();
}

// ============================================================
// RDF/XML - FUNCIONES PRINCIPALES
// ============================================================

std::string RDFGenerator::generateRDFXML(const DbClientPtr& dbClient) {
    std::string turtle = generateTurtle(dbClient);
    return turtleToRDFXML(turtle);
}

// ============================================================
// UTILIDADES
// ============================================================

std::string RDFGenerator::escapeTurtle(const std::string& str) {
    std::string result = str;
    
    size_t pos = 0;
    while ((pos = result.find("\\", pos)) != std::string::npos) {
        result.replace(pos, 1, "\\\\");
        pos += 2;
    }
    
    pos = 0;
    while ((pos = result.find("\"", pos)) != std::string::npos) {
        result.replace(pos, 1, "\\\"");
        pos += 2;
    }
    
    pos = 0;
    while ((pos = result.find("\n", pos)) != std::string::npos) {
        result.replace(pos, 1, "\\n");
        pos += 2;
    }
    
    return result;
}

std::string RDFGenerator::escapeXML(const std::string& str) {
    std::string result = str;
    
    size_t pos = 0;
    while ((pos = result.find("&", pos)) != std::string::npos) {
        result.replace(pos, 1, "&amp;");
        pos += 5;
    }
    
    pos = 0;
    while ((pos = result.find("<", pos)) != std::string::npos) {
        result.replace(pos, 1, "&lt;");
        pos += 4;
    }
    
    pos = 0;
    while ((pos = result.find(">", pos)) != std::string::npos) {
        result.replace(pos, 1, "&gt;");
        pos += 4;
    }
    
    pos = 0;
    while ((pos = result.find("\"", pos)) != std::string::npos) {
        result.replace(pos, 1, "&quot;");
        pos += 6;
    }
    
    return result;
}

std::string RDFGenerator::turtleToRDFXML(const std::string& turtle) {
    std::ostringstream xml;
    
    xml << "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    xml << "<rdf:RDF\n";
    xml << getRDFXMLNamespaces();
    xml << ">\n\n";
    
    xml << "<!-- ============================================================ -->\n";
    xml << "<!-- DATOS PACHAQUTEC - GENERADO AUTOMÁTICAMENTE                 -->\n";
    xml << "<!-- Fecha: " << trantor::Date::now().toDbStringLocal() << " -->\n";
    xml << "<!-- ============================================================ -->\n\n";
    
    xml << "<!-- NOTA: Para una conversión completa Turtle -> RDF/XML,      -->\n";
    xml << "<!-- se recomienda usar herramientas como Apache Jena o RDFLib  -->\n";
    xml << "<!-- Este es un RDF/XML simplificado                             -->\n\n";
    
    xml << "</rdf:RDF>\n";
    
    return xml.str();
}

std::string RDFGenerator::getTurtlePrefixes() {
    std::ostringstream prefixes;
    
    prefixes << "@prefix : <" << NS_DATA << "> .\n";
    prefixes << "@prefix pq: <" << NS_ONTOLOGY << "> .\n";
    prefixes << "@prefix schema: <" << NS_SCHEMA << "> .\n";
    prefixes << "@prefix geo: <" << NS_GEO << "> .\n";
    prefixes << "@prefix dct: <" << NS_DCT << "> .\n";
    prefixes << "@prefix foaf: <" << NS_FOAF << "> .\n";
    prefixes << "@prefix owl: <" << NS_OWL << "> .\n";
    prefixes << "@prefix xsd: <" << NS_XSD << "> .\n";
    prefixes << "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n";
    prefixes << "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n";
    
    return prefixes.str();
}

std::string RDFGenerator::getRDFXMLNamespaces() {
    std::ostringstream ns;
    
    ns << "    xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n";
    ns << "    xmlns:rdfs=\"http://www.w3.org/2000/01/rdf-schema#\"\n";
    ns << "    xmlns:xsd=\"" << NS_XSD << "\"\n";
    ns << "    xmlns:schema=\"" << NS_SCHEMA << "\"\n";
    ns << "    xmlns:geo=\"" << NS_GEO << "\"\n";
    ns << "    xmlns:dct=\"" << NS_DCT << "\"\n";
    ns << "    xmlns:foaf=\"" << NS_FOAF << "\"\n";
    ns << "    xmlns:pq=\"" << NS_ONTOLOGY << "\"\n";
    ns << "    xmlns=\"" << NS_DATA << "\"\n";
    ns << "    xml:base=\"" << NS_BASE << "\"";
    
    return ns.str();
}

// ============================================================
// JSON-LD - GENERACIÓN
// ============================================================

std::string RDFGenerator::generateJSONLD(const DbClientPtr& dbClient) {
    Json::Value root;
    root["@context"] = Json::Value(Json::objectValue);
    root["@context"]["@vocab"] = NS_ONTOLOGY;
    root["@context"]["schema"] = NS_SCHEMA;
    root["@context"]["geo"] = NS_GEO;
    root["@context"]["dct"] = NS_DCT;
    root["@context"]["foaf"] = NS_FOAF;
    
    root["@graph"] = Json::Value(Json::arrayValue);
    
    try {
        // Categorías
        auto categorias = dbClient->execSqlSync(
            "SELECT id, nombre, descripcion, icono, color FROM categorias ORDER BY id"
        );
        
        for (size_t i = 0; i < categorias.size(); ++i) {
            Json::Value cat;
            cat["@type"] = "TourismCategory";
            cat["@id"] = NS_DATA + "Categoria" + categorias[i]["nombre"].as<std::string>();
            cat["schema:name"] = categorias[i]["nombre"].as<std::string>();
            cat["schema:description"] = categorias[i]["descripcion"].as<std::string>();
            cat["categoryIcon"] = categorias[i]["icono"].as<std::string>();
            cat["categoryColor"] = categorias[i]["color"].as<std::string>();
            root["@graph"].append(cat);
        }
        
        // Lugares
        auto lugares = dbClient->execSqlSync(
            "SELECT l.id, l.nombre, l.descripcion, l.imagen_url, c.nombre as categoria "
            "FROM lugares l JOIN categorias c ON l.categoria_id = c.id ORDER BY l.id"
        );
        
        for (size_t i = 0; i < lugares.size(); ++i) {
            Json::Value lugar;
            lugar["@type"] = "TouristPlace";
            
            std::string uri_suffix = lugares[i]["nombre"].as<std::string>();
            uri_suffix.erase(std::remove(uri_suffix.begin(), uri_suffix.end(), ' '), uri_suffix.end());
            
            lugar["@id"] = NS_DATA + uri_suffix;
            lugar["schema:name"] = lugares[i]["nombre"].as<std::string>();
            lugar["schema:description"] = lugares[i]["descripcion"].as<std::string>();
            lugar["schema:image"] = lugares[i]["imagen_url"].as<std::string>();
            lugar["belongsToCategory"] = NS_DATA + "Categoria" + lugares[i]["categoria"].as<std::string>();
            root["@graph"].append(lugar);
        }
        
    } catch (const DrogonDbException& e) {
        LOG_ERROR << "Error generando JSON-LD: " << e.base().what();
    }
    
    Json::StreamWriterBuilder builder;
    builder["indentation"] = "  ";
    return Json::writeString(builder, root);
}

// ============================================================
// N-TRIPLES - GENERACIÓN
// ============================================================

std::string RDFGenerator::generateNTriples(const DbClientPtr& dbClient) {
    std::ostringstream nt;
    
    try {
        // Categorías
        auto categorias = dbClient->execSqlSync(
            "SELECT id, nombre, descripcion, icono, color FROM categorias ORDER BY id"
        );
        
        for (size_t i = 0; i < categorias.size(); ++i) {
            std::string nombre = categorias[i]["nombre"].as<std::string>();
            std::string uri = "<" + NS_DATA + "Categoria" + nombre + ">";
            
            nt << uri << " <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" << NS_ONTOLOGY << "TourismCategory> .\n";
            nt << uri << " <" << NS_SCHEMA << "name> \"" << escapeTurtle(nombre) << "\"@es .\n";
            nt << uri << " <" << NS_SCHEMA << "description> \"" << escapeTurtle(categorias[i]["descripcion"].as<std::string>()) << "\"@es .\n";
            nt << uri << " <" << NS_ONTOLOGY << "categoryIcon> \"" << categorias[i]["icono"].as<std::string>() << "\" .\n";
            nt << uri << " <" << NS_ONTOLOGY << "categoryColor> \"" << categorias[i]["color"].as<std::string>() << "\" .\n";
        }
        
        // Lugares
        auto lugares = dbClient->execSqlSync(
            "SELECT l.id, l.nombre, l.descripcion, l.imagen_url, c.nombre as categoria "
            "FROM lugares l JOIN categorias c ON l.categoria_id = c.id ORDER BY l.id"
        );
        
        for (size_t i = 0; i < lugares.size(); ++i) {
            std::string nombre = lugares[i]["nombre"].as<std::string>();
            std::string uri_suffix = nombre;
            uri_suffix.erase(std::remove(uri_suffix.begin(), uri_suffix.end(), ' '), uri_suffix.end());
            std::string uri = "<" + NS_DATA + uri_suffix + ">";
            
            nt << uri << " <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" << NS_ONTOLOGY << "TouristPlace> .\n";
            nt << uri << " <" << NS_SCHEMA << "name> \"" << escapeTurtle(nombre) << "\"@es .\n";
            nt << uri << " <" << NS_SCHEMA << "description> \"" << escapeTurtle(lugares[i]["descripcion"].as<std::string>()) << "\"@es .\n";
            nt << uri << " <" << NS_SCHEMA << "image> <" << lugares[i]["imagen_url"].as<std::string>() << "> .\n";
            nt << uri << " <" << NS_ONTOLOGY << "belongsToCategory> <" << NS_DATA << "Categoria" << lugares[i]["categoria"].as<std::string>() << "> .\n";
        }
        
    } catch (const DrogonDbException& e) {
        LOG_ERROR << "Error generando N-Triples: " << e.base().what();
    }
    
    return nt.str();
}

} // namespace pachaqutec