#ifndef RDF_GENERATOR_HPP
#define RDF_GENERATOR_HPP

#include <string>
#include <sstream>
#include <vector>
#include <map>
#include <drogon/drogon.h>
#include <drogon/orm/DbClient.h>

using namespace drogon;
using namespace drogon::orm;

namespace pachaqutec {

/**
 * @brief Generador de RDF para la ontología PachaQutec
 * 
 * Convierte datos de PostgreSQL a formatos RDF (Turtle y RDF/XML)
 */
class RDFGenerator {
public:
    // Namespaces
    static const std::string NS_BASE;
    static const std::string NS_DATA;
    static const std::string NS_ONTOLOGY;
    static const std::string NS_SCHEMA;
    static const std::string NS_GEO;
    static const std::string NS_DCT;
    static const std::string NS_FOAF;
    static const std::string NS_OWL;
    static const std::string NS_XSD;

    /**
     * @brief Genera RDF completo en formato Turtle desde la base de datos
     * 
     * @param dbClient Cliente de base de datos
     * @return std::string RDF en formato Turtle
     */
    static std::string generateTurtle(const DbClientPtr& dbClient);

    /**
     * @brief Genera RDF completo en formato RDF/XML desde la base de datos
     * 
     * @param dbClient Cliente de base de datos
     * @return std::string RDF en formato RDF/XML
     */
    static std::string generateRDFXML(const DbClientPtr& dbClient);

    /**
     * @brief Genera RDF en formato JSON-LD desde la base de datos
     * 
     * @param dbClient Cliente de base de datos
     * @return std::string RDF en formato JSON-LD
     */
    static std::string generateJSONLD(const DbClientPtr& dbClient);

    /**
     * @brief Genera RDF en formato N-Triples desde la base de datos
     * 
     * @param dbClient Cliente de base de datos
     * @return std::string RDF en formato N-Triples
     */
    static std::string generateNTriples(const DbClientPtr& dbClient);

    /**
     * @brief Genera RDF de categorías en formato Turtle
     */
    static std::string generateCategoriesTurtle(const DbClientPtr& dbClient);

    /**
     * @brief Genera RDF de lugares en formato Turtle
     */
    static std::string generatePlacesTurtle(const DbClientPtr& dbClient);

    /**
     * @brief Genera RDF de usuarios en formato Turtle (anónimo)
     */
    static std::string generateUsersTurtle(const DbClientPtr& dbClient);

    /**
     * @brief Genera RDF de favoritos en formato Turtle
     */
    static std::string generateFavoritesTurtle(const DbClientPtr& dbClient);

    /**
     * @brief Genera RDF de reseñas en formato Turtle
     */
    static std::string generateReviewsTurtle(const DbClientPtr& dbClient);

    /**
     * @brief Genera prefijos para Turtle
     */
    static std::string getTurtlePrefixes();

    /**
     * @brief Genera namespaces para RDF/XML
     */
    static std::string getRDFXMLNamespaces();

private:
    /**
     * @brief Escapa caracteres especiales para Turtle
     */
    static std::string escapeTurtle(const std::string& str);

    /**
     * @brief Escapa caracteres especiales para XML
     */
    static std::string escapeXML(const std::string& str);

    /**
     * @brief Convierte Turtle a RDF/XML (simplificado)
     */
    static std::string turtleToRDFXML(const std::string& turtle);
};

} // namespace pachaqutec

#endif // RDF_GENERATOR_HPP