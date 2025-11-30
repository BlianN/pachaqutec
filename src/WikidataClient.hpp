#ifndef WIKIDATA_CLIENT_HPP
#define WIKIDATA_CLIENT_HPP

#include <string>
#include <vector>
#include <map>
#include <optional>
#include <json/json.h>
#include <drogon/drogon.h>
#include <drogon/orm/DbClient.h>

using namespace drogon;
using namespace drogon::orm;

namespace pachaqutec {

/**
 * @brief Estructura para representar un lugar de Wikidata
 */
struct WikidataPlace {
    std::string qid;           // Q1538957
    std::string name;          // Monasterio de Santa Catalina
    std::string nameEn;        // (opcional)
    std::string description;   // (opcional)
    std::string descriptionEn; // (opcional)
    double latitude = 0.0;
    double longitude = 0.0;
    std::string typeQid;       // QID del tipo (Q44613)
    std::string typeLabel;     // "monasterio"
    std::string imageUrl;      // URL de Wikimedia Commons
    std::string foundingDate;      // (opcional)
    std::string architecturalStyle; // (opcional)
    std::string heritageStatus;    // (opcional)
    std::string websiteUrl;        // (opcional)
};

/**
 * @brief Resultado de sincronización
 */
struct SyncResult {
    int placesAdded = 0;
    int placesUpdated = 0;
    int placesSkipped = 0;
    std::string errorMessage;
    bool success = true;
};

/**
 * @brief Cliente para consultas SPARQL a Wikidata
 */
class WikidataClient {
public:
    static const std::string WIKIDATA_SPARQL_ENDPOINT;
    static const std::string AREQUIPA_QID;

    static std::vector<WikidataPlace> fetchArequipaPlaces();
    static std::optional<Json::Value> executeSparqlQuery(const std::string& query);
    static SyncResult syncWithDatabase(const DbClientPtr& dbClient);
    static int getCategoryFromWikidataType(const DbClientPtr& dbClient, const std::string& wikidataTypeQid);
    static std::string buildArequipaPlacesQuery();
    static std::vector<WikidataPlace> parseSparqlResults(const Json::Value& jsonResult);

private:
    static std::optional<std::string> httpGet(const std::string& url);
    static std::string urlEncode(const std::string& value);
    static std::string extractValue(const Json::Value& binding, const std::string& key);
    static void logSyncChange(
        const DbClientPtr& dbClient,
        int syncLogId,
        int lugarId,
        const std::string& wikidataId,
        const std::string& changeType,
        const std::string& fieldChanged = "",
        const std::string& oldValue = "",
        const std::string& newValue = ""
    );
};

} // namespace pachaqutec

#endif // WIKIDATA_CLIENT_HPP
