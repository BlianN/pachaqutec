#include "WikidataClient.hpp"
#include <curl/curl.h>
#include <sstream>
#include <iomanip>
#include <ctime>

namespace pachaqutec {

// Constantes
const std::string WikidataClient::WIKIDATA_SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
const std::string WikidataClient::AREQUIPA_QID = "Q159273";

// Callback para CURL
static size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* userp) {
    userp->append((char*)contents, size * nmemb);
    return size * nmemb;
}

std::string WikidataClient::urlEncode(const std::string& value) {
    CURL* curl = curl_easy_init();
    std::string result;
    
    if (curl) {
        char* encoded = curl_easy_escape(curl, value.c_str(), value.length());
        if (encoded) {
            result = encoded;
            curl_free(encoded);
        }
        curl_easy_cleanup(curl);
    }
    
    return result;
}

std::optional<std::string> WikidataClient::httpGet(const std::string& url) {
    CURL* curl = curl_easy_init();
    std::string response;
    
    if (!curl) {
        LOG_ERROR << "Error inicializando CURL";
        return std::nullopt;
    }
    
    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Accept: application/sparql-results+json");
    headers = curl_slist_append(headers, "User-Agent: PachaQutec/1.0 (Tourism App; contact@pachaqutec.com)");
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    
    CURLcode res = curl_easy_perform(curl);
    
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    
    if (res != CURLE_OK) {
        LOG_ERROR << "CURL error: " << curl_easy_strerror(res);
        return std::nullopt;
    }
    
    return response;
}

std::string WikidataClient::buildArequipaPlacesQuery() {
    return R"(
SELECT DISTINCT 
    ?place 
    ?placeLabel 
    ?typeQid
    ?typeLabel 
    ?lat 
    ?lon 
    ?image
WHERE {
    {
        ?place wdt:P131 wd:Q159273.
    } UNION {
        ?place wdt:P131 ?district.
        ?district wdt:P131 wd:Q159273.
    }
    
    ?place wdt:P625 ?coords.
    ?place p:P625 [
        psv:P625 [
            wikibase:geoLatitude ?lat;
            wikibase:geoLongitude ?lon
        ]
    ].
    
    ?place wdt:P31 ?type.
    BIND(STRAFTER(STR(?type), "entity/") AS ?typeQid)
    
    FILTER(?type IN (
        wd:Q44613,
        wd:Q2977,
        wd:Q16970,
        wd:Q44539,
        wd:Q56395672,
        wd:Q33506,
        wd:Q16560,
        wd:Q3947,
        wd:Q12280,
        wd:Q24354,
        wd:Q676050,
        wd:Q4989906,
        wd:Q1329623,
        wd:Q1254933,
        wd:Q317557,
        wd:Q811979,
        wd:Q41176,
        wd:Q35112127
    ))
    
    OPTIONAL { ?place wdt:P18 ?image. }
    
    SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "es,en". 
        ?place rdfs:label ?placeLabel.
        ?type rdfs:label ?typeLabel.
    }
}
ORDER BY ?placeLabel
LIMIT 100
)";
}

std::optional<Json::Value> WikidataClient::executeSparqlQuery(const std::string& query) {
    std::string url = WIKIDATA_SPARQL_ENDPOINT + "?query=" + urlEncode(query);
    
    LOG_INFO << "Ejecutando consulta SPARQL a Wikidata...";
    
    auto response = httpGet(url);
    if (!response) {
        LOG_ERROR << "Error en petición HTTP a Wikidata";
        return std::nullopt;
    }
    
    Json::Value root;
    Json::CharReaderBuilder builder;
    std::string errors;
    std::istringstream stream(*response);
    
    if (!Json::parseFromStream(builder, stream, &root, &errors)) {
        LOG_ERROR << "Error parseando JSON: " << errors;
        return std::nullopt;
    }
    
    return root;
}

std::string WikidataClient::extractValue(const Json::Value& binding, const std::string& key) {
    if (binding.isMember(key) && binding[key].isMember("value")) {
        return binding[key]["value"].asString();
    }
    return "";
}

std::vector<WikidataPlace> WikidataClient::parseSparqlResults(const Json::Value& jsonResult) {
    std::vector<WikidataPlace> places;
    std::map<std::string, WikidataPlace> placeMap;
    
    if (!jsonResult.isMember("results") || !jsonResult["results"].isMember("bindings")) {
        LOG_ERROR << "Formato de respuesta SPARQL inválido";
        return places;
    }
    
    const Json::Value& bindings = jsonResult["results"]["bindings"];
    
    for (const auto& binding : bindings) {
        std::string placeUri = extractValue(binding, "place");
        std::string qid = placeUri.substr(placeUri.rfind('/') + 1);
        
        if (placeMap.find(qid) != placeMap.end()) {
            continue;
        }
        
        WikidataPlace place;
        place.qid = qid;
        place.name = extractValue(binding, "placeLabel");
        place.typeQid = extractValue(binding, "typeQid");
        place.typeLabel = extractValue(binding, "typeLabel");
        
        std::string latStr = extractValue(binding, "lat");
        std::string lonStr = extractValue(binding, "lon");
        if (!latStr.empty()) place.latitude = std::stod(latStr);
        if (!lonStr.empty()) place.longitude = std::stod(lonStr);
        
        place.imageUrl = extractValue(binding, "image");
        
        placeMap[qid] = place;
    }
    
    for (const auto& pair : placeMap) {
        places.push_back(pair.second);
    }
    
    LOG_INFO << "Parseados " << places.size() << " lugares de Wikidata";
    return places;
}

std::vector<WikidataPlace> WikidataClient::fetchArequipaPlaces() {
    std::string query = buildArequipaPlacesQuery();
    auto result = executeSparqlQuery(query);
    
    if (!result) {
        LOG_ERROR << "Error obteniendo datos de Wikidata";
        return {};
    }
    
    return parseSparqlResults(*result);
}

int WikidataClient::getCategoryFromWikidataType(const DbClientPtr& dbClient, const std::string& wikidataTypeQid) {
    try {
        auto result = dbClient->execSqlSync(
            "SELECT categoria_id FROM wikidata_category_mapping WHERE wikidata_qid = $1",
            wikidataTypeQid
        );
        
        if (result.size() > 0 && !result[0]["categoria_id"].isNull()) {
            return result[0]["categoria_id"].as<int>();
        }
    } catch (const DrogonDbException& e) {
        LOG_ERROR << "Error obteniendo mapeo de categoría: " << e.base().what();
    }
    
    return 1;
}

void WikidataClient::logSyncChange(
    const DbClientPtr& dbClient,
    int syncLogId,
    int lugarId,
    const std::string& wikidataId,
    const std::string& changeType,
    const std::string& fieldChanged,
    const std::string& oldValue,
    const std::string& newValue
) {
    try {
        dbClient->execSqlSync(
            "INSERT INTO wikidata_sync_changes "
            "(sync_log_id, lugar_id, wikidata_id, change_type) "
            "VALUES ($1, $2, $3, $4)",
            syncLogId, lugarId, wikidataId, changeType
        );
    } catch (const DrogonDbException& e) {
        LOG_ERROR << "Error registrando cambio de sync: " << e.base().what();
    }
}

SyncResult WikidataClient::syncWithDatabase(const DbClientPtr& dbClient) {
    SyncResult result;
    int syncLogId = 0;
    
    try {
        auto logResult = dbClient->execSqlSync(
            "INSERT INTO wikidata_sync_log (sync_type, started_at, status) "
            "VALUES ('full', NOW(), 'running') RETURNING id"
        );
        syncLogId = logResult[0]["id"].as<int>();
        
        LOG_INFO << "Iniciando sincronización con Wikidata (log_id: " << syncLogId << ")";
        
        auto wikidataPlaces = fetchArequipaPlaces();
        
        if (wikidataPlaces.empty()) {
            result.success = false;
            result.errorMessage = "No se obtuvieron lugares de Wikidata";
            
            dbClient->execSqlSync(
                "UPDATE wikidata_sync_log SET status = 'failed', finished_at = NOW(), "
                "error_message = $1 WHERE id = $2",
                result.errorMessage, syncLogId
            );
            
            return result;
        }
        
        LOG_INFO << "Obtenidos " << wikidataPlaces.size() << " lugares de Wikidata";
        
        for (const auto& place : wikidataPlaces) {
            try {
                auto existingResult = dbClient->execSqlSync(
                    "SELECT id, local_override FROM lugares WHERE wikidata_id = $1",
                    place.qid
                );
                
                if (existingResult.size() > 0) {
                    bool localOverride = existingResult[0]["local_override"].as<bool>();
                    int existingId = existingResult[0]["id"].as<int>();
                    
                    if (localOverride) {
                        result.placesSkipped++;
                        logSyncChange(dbClient, syncLogId, existingId, place.qid, "skipped", "", "", "");
                    } else {
                        int categoryId = getCategoryFromWikidataType(dbClient, place.typeQid);
                        
                        dbClient->execSqlSync(
                            "UPDATE lugares SET "
                            "latitude = $1, longitude = $2, wikidata_synced_at = NOW(), categoria_id = $3 "
                            "WHERE wikidata_id = $4",
                            place.latitude, place.longitude, categoryId, place.qid
                        );
                        
                        if (!place.imageUrl.empty()) {
                            dbClient->execSqlSync(
                                "UPDATE lugares SET wikimedia_image_url = $1 WHERE wikidata_id = $2",
                                place.imageUrl, place.qid
                            );
                        }
                        
                        result.placesUpdated++;
                        logSyncChange(dbClient, syncLogId, existingId, place.qid, "updated", "", "", "");
                    }
                } else {
                    int categoryId = getCategoryFromWikidataType(dbClient, place.typeQid);
                    std::string descripcion = place.typeLabel + " en Arequipa";
                    std::string imageUrl = place.imageUrl.empty() 
                        ? "https://via.placeholder.com/400x300?text=Sin+Imagen"
                        : place.imageUrl;
                    
                    auto insertResult = dbClient->execSqlSync(
                        "INSERT INTO lugares "
                        "(nombre, descripcion, imagen_url, categoria_id, wikidata_id, source, "
                        "latitude, longitude, wikidata_synced_at) "
                        "VALUES ($1, $2, $3, $4, $5, 'wikidata', $6, $7, NOW()) "
                        "RETURNING id",
                        place.name, descripcion, imageUrl, categoryId, place.qid,
                        place.latitude, place.longitude
                    );
                    
                    int newId = insertResult[0]["id"].as<int>();
                    
                    if (!place.imageUrl.empty()) {
                        dbClient->execSqlSync(
                            "UPDATE lugares SET wikimedia_image_url = $1 WHERE id = $2",
                            place.imageUrl, newId
                        );
                    }
                    
                    result.placesAdded++;
                    logSyncChange(dbClient, syncLogId, newId, place.qid, "added", "", "", "");
                    
                    LOG_INFO << "Agregado: " << place.name << " (" << place.qid << ")";
                }
                
            } catch (const DrogonDbException& e) {
                LOG_ERROR << "Error procesando " << place.qid << ": " << e.base().what();
            }
        }
        
        dbClient->execSqlSync(
            "UPDATE wikidata_sync_log SET "
            "status = 'completed', finished_at = NOW(), "
            "places_added = $1, places_updated = $2, places_skipped = $3 "
            "WHERE id = $4",
            result.placesAdded, result.placesUpdated, result.placesSkipped, syncLogId
        );
        
        LOG_INFO << "Sincronización completada: " 
                 << result.placesAdded << " agregados, "
                 << result.placesUpdated << " actualizados, "
                 << result.placesSkipped << " omitidos";
        
    } catch (const std::exception& e) {
        result.success = false;
        result.errorMessage = e.what();
        
        if (syncLogId > 0) {
            try {
                dbClient->execSqlSync(
                    "UPDATE wikidata_sync_log SET status = 'failed', finished_at = NOW(), "
                    "error_message = $1 WHERE id = $2",
                    result.errorMessage, syncLogId
                );
            } catch (...) {}
        }
        
        LOG_ERROR << "Error en sincronización: " << e.what();
    }
    
    return result;
}

} // namespace pachaqutec
