#include <drogon/drogon.h>
#include <fstream>
#include <sstream>
#include <cstdlib>
#include <string>
#include "RDFGenerator.hpp"
#include "WikidataClient.hpp"

using namespace drogon;
using namespace drogon::orm;

int main() {
    // Obtener variables de entorno
    std::string dbHost = std::getenv("DB_HOST") ? std::getenv("DB_HOST") : "localhost";
    std::string dbPort = std::getenv("DB_PORT") ? std::getenv("DB_PORT") : "5432";
    std::string dbName = std::getenv("DB_NAME") ? std::getenv("DB_NAME") : "mi_base_datos";
    std::string dbUser = std::getenv("DB_USER") ? std::getenv("DB_USER") : "miusuario";
    std::string dbPassword = std::getenv("DB_PASSWORD") ? std::getenv("DB_PASSWORD") : "mipassword";

    std::cout << "Conectando a PostgreSQL:" << std::endl;
    std::cout << "  Host: " << dbHost << std::endl;
    std::cout << "  Port: " << dbPort << std::endl;
    std::cout << "  Database: " << dbName << std::endl;
    std::cout << "  User: " << dbUser << std::endl;

    // CONFIGURACIÓN MODERNA DE DROGON - PostgresConfig con asignación directa
    drogon::orm::PostgresConfig pgConfig;
    pgConfig.host = dbHost;
    pgConfig.port = std::stoi(dbPort);
    pgConfig.databaseName = dbName;
    pgConfig.username = dbUser;
    pgConfig.password = dbPassword;
    pgConfig.connectionNumber = 1;
    pgConfig.timeout = 10.0;
    pgConfig.isFast = false;
    pgConfig.characterSet = "utf8";
    pgConfig.name = "default";

    // Configurar Drogon
    app()
        .addListener("0.0.0.0", 8080)
        .setThreadNum(4)
        // Habilitar CORS para el frontend
        .registerPostHandlingAdvice(
            [](const HttpRequestPtr &req, const HttpResponsePtr &resp) {
                // Obtener el origin de la petición
                auto origin = req->getHeader("Origin");

                // Permitir ambos dominios (con y sin www) Y localhost
                if (origin == "https://pachaqutec.com" ||
                    origin == "https://www.pachaqutec.com" ||
                    origin == "http://localhost:3000") {
                    resp->addHeader("Access-Control-Allow-Origin", origin);
                }

                resp->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                resp->addHeader("Access-Control-Allow-Credentials", "true");
            })
        
        // Manejar OPTIONS para CORS preflight
        .registerPreRoutingAdvice(
            [](const HttpRequestPtr &req) {
                if (req->method() == Options) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k200OK);
                    
                    auto origin = req->getHeader("Origin");
                    if (origin == "https://pachaqutec.com" ||
                        origin == "https://www.pachaqutec.com" ||
                        origin == "http://localhost:3000") {
                        resp->addHeader("Access-Control-Allow-Origin", origin);
                    }
                    
                    resp->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                    resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                    resp->addHeader("Access-Control-Allow-Credentials", "true");
                    resp->addHeader("Access-Control-Max-Age", "3600");
                    
                    return resp;
                }
                return HttpResponsePtr{};
            })
        
        // Configurar el cliente de base de datos con PostgresConfig
        .addDbClient(pgConfig)

        // Ruta de prueba - página principal
        .registerHandler("/",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {
                auto resp = HttpResponse::newHttpResponse();
                resp->setBody("¡Backend con Drogon y PostgreSQL funcionando! "
                            "Prueba: GET /usuarios para ver los datos.");
                callback(resp);
            })

        // Ruta para obtener usuarios de la base de datos
        .registerHandler("/usuarios",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                auto clientPtr = app().getDbClient("default");

                clientPtr->execSqlAsync(
                    "SELECT id, nombre, email, created_at FROM usuarios",
                    [callback](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["count"] = (int)r.size();

                        for (size_t i = 0; i < r.size(); ++i) {
                            Json::Value usuario;
                            usuario["id"] = r[i]["id"].as<int>();
                            usuario["nombre"] = r[i]["nombre"].as<std::string>();
                            usuario["email"] = r[i]["email"].as<std::string>();
                            usuario["created_at"] = r[i]["created_at"].as<std::string>();
                            jsonResponse["usuarios"].append(usuario);
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = e.base().what();

                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    }
                );
            })

        // Ruta para LOGIN
        .registerHandler("/login",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                // Solo acepta POST
                if (req->method() != Post) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k405MethodNotAllowed);
                    callback(resp);
                    return;
                }

                auto clientPtr = app().getDbClient("default");
                auto jsonPtr = req->getJsonObject();

                if (!jsonPtr) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = "JSON inválido";
                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k400BadRequest);
                    callback(resp);
                    return;
                }

                std::string email = (*jsonPtr)["email"].asString();
                std::string password = (*jsonPtr)["password"].asString();

                if (email.empty() || password.empty()) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = "Email y contraseña son requeridos";
                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k400BadRequest);
                    callback(resp);
                    return;
                }

                clientPtr->execSqlAsync(
                    "SELECT id, nombre, email FROM usuarios WHERE email = $1 AND password = $2",
                    [callback](const drogon::orm::Result &r) {
                        if (r.size() == 0) {
                            // Credenciales incorrectas
                            Json::Value jsonError;
                            jsonError["success"] = false;
                            jsonError["error"] = "Email o contraseña incorrectos";
                            auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                            resp->setStatusCode(k401Unauthorized);
                            callback(resp);
                        } else {
                            // Login exitoso
                            Json::Value jsonResponse;
                            jsonResponse["success"] = true;
                            jsonResponse["usuario"]["id"] = r[0]["id"].as<int>();
                            jsonResponse["usuario"]["nombre"] = r[0]["nombre"].as<std::string>();
                            jsonResponse["usuario"]["email"] = r[0]["email"].as<std::string>();

                            auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                            callback(resp);
                        }
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = e.base().what();
                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    },
                    email,
                    password
                );
            })
        // Ruta para REGISTRO
        .registerHandler("/registro",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                // Solo acepta POST
                if (req->method() != Post) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k405MethodNotAllowed);
                    callback(resp);
                    return;
                }

                auto clientPtr = app().getDbClient("default");
                auto jsonPtr = req->getJsonObject();

                if (!jsonPtr) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = "JSON inválido";
                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k400BadRequest);
                    callback(resp);
                    return;
                }

                std::string nombre = (*jsonPtr)["nombre"].asString();
                std::string email = (*jsonPtr)["email"].asString();
                std::string password = (*jsonPtr)["password"].asString();

                if (nombre.empty() || email.empty() || password.empty()) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = "Nombre, email y contraseña son requeridos";
                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k400BadRequest);
                    callback(resp);
                    return;
                }

                clientPtr->execSqlAsync(
                    "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email, created_at",
                    [callback](const drogon::orm::Result &r) {
                        // Registro exitoso
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["usuario"]["id"] = r[0]["id"].as<int>();
                        jsonResponse["usuario"]["nombre"] = r[0]["nombre"].as<std::string>();
                        jsonResponse["usuario"]["email"] = r[0]["email"].as<std::string>();
                        jsonResponse["usuario"]["created_at"] = r[0]["created_at"].as<std::string>();

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        resp->setStatusCode(k201Created);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        // Error (probablemente email duplicado)
                        Json::Value jsonError;
                        jsonError["success"] = false;

                        std::string errorMsg = e.base().what();
                        if (errorMsg.find("unique") != std::string::npos ||
                            errorMsg.find("duplicate") != std::string::npos) {
                            jsonError["error"] = "El email ya está registrado";
                        } else {
                            jsonError["error"] = "Error al crear usuario";
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k400BadRequest);
                        callback(resp);
                    },
                    nombre,
                    email,
                    password
                );
            })

        // ========================================
        // ENDPOINT DE LUGARES (ACTUALIZADO con campos Wikidata)
        // ========================================
        .registerHandler("/lugares",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                auto clientPtr = app().getDbClient("default");

                clientPtr->execSqlAsync(
                    "SELECT l.id, l.nombre, l.descripcion, l.imagen_url, c.nombre as categoria, l.categoria_id, "
                    "l.wikidata_id, l.source, l.latitude, l.longitude, l.address, l.website_url, "
                    "l.founding_date, l.architectural_style, l.heritage_status, l.wikimedia_image_url, "
                    "l.nombre_en, l.descripcion_en "
                    "FROM lugares l "
                    "JOIN categorias c ON l.categoria_id = c.id "
                    "ORDER BY l.id",
                    [callback](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["count"] = (int)r.size();

                        for (size_t i = 0; i < r.size(); ++i) {
                            Json::Value lugar;
                            lugar["id"] = r[i]["id"].as<int>();
                            lugar["nombre"] = r[i]["nombre"].as<std::string>();
                            lugar["descripcion"] = r[i]["descripcion"].as<std::string>();
                            lugar["imagen_url"] = r[i]["imagen_url"].as<std::string>();
                            lugar["categoria"] = r[i]["categoria"].as<std::string>();
                            lugar["categoria_id"] = r[i]["categoria_id"].as<int>();
                            
                            // Campos Wikidata (pueden ser null)
                            if (!r[i]["wikidata_id"].isNull())
                                lugar["wikidata_id"] = r[i]["wikidata_id"].as<std::string>();
                            if (!r[i]["source"].isNull())
                                lugar["source"] = r[i]["source"].as<std::string>();
                            if (!r[i]["latitude"].isNull())
                                lugar["latitude"] = r[i]["latitude"].as<double>();
                            if (!r[i]["longitude"].isNull())
                                lugar["longitude"] = r[i]["longitude"].as<double>();
                            if (!r[i]["address"].isNull())
                                lugar["address"] = r[i]["address"].as<std::string>();
                            if (!r[i]["website_url"].isNull())
                                lugar["website_url"] = r[i]["website_url"].as<std::string>();
                            if (!r[i]["founding_date"].isNull())
                                lugar["founding_date"] = r[i]["founding_date"].as<std::string>();
                            if (!r[i]["architectural_style"].isNull())
                                lugar["architectural_style"] = r[i]["architectural_style"].as<std::string>();
                            if (!r[i]["heritage_status"].isNull())
                                lugar["heritage_status"] = r[i]["heritage_status"].as<std::string>();
                            if (!r[i]["wikimedia_image_url"].isNull())
                                lugar["wikimedia_image_url"] = r[i]["wikimedia_image_url"].as<std::string>();
                            if (!r[i]["nombre_en"].isNull())
                                lugar["nombre_en"] = r[i]["nombre_en"].as<std::string>();
                            if (!r[i]["descripcion_en"].isNull())
                                lugar["descripcion_en"] = r[i]["descripcion_en"].as<std::string>();
                            
                            jsonResponse["lugares"].append(lugar);
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = e.base().what();

                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    }
                );
            },
            {Get})

        // ========================================
        // ENDPOINTS DE FAVORITOS
        // ========================================

        // Ruta para AGREGAR a favoritos (POST)
        .registerHandler("/favoritos",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                if (req->method() != Post) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k405MethodNotAllowed);
                    callback(resp);
                    return;
                }

                auto clientPtr = app().getDbClient("default");
                auto jsonPtr = req->getJsonObject();

                if (!jsonPtr) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = "JSON inválido";
                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k400BadRequest);
                    callback(resp);
                    return;
                }

                int usuarioId = (*jsonPtr)["usuarioId"].asInt();
                int lugarId = (*jsonPtr)["lugarId"].asInt();

                if (usuarioId <= 0 || lugarId <= 0) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = "Usuario ID y Lugar ID son requeridos";
                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k400BadRequest);
                    callback(resp);
                    return;
                }

                clientPtr->execSqlAsync(
                    "INSERT INTO favoritos (usuario_id, lugar_id) VALUES ($1, $2) RETURNING id",
                    [callback](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["favorito_id"] = r[0]["id"].as<int>();
                        jsonResponse["message"] = "Lugar agregado a favoritos";

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        resp->setStatusCode(k201Created);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;

                        std::string errorMsg = e.base().what();
                        if (errorMsg.find("unique") != std::string::npos ||
                            errorMsg.find("duplicate") != std::string::npos) {
                            jsonError["error"] = "Este lugar ya está en favoritos";
                        } else {
                            jsonError["error"] = "Error al agregar a favoritos";
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k400BadRequest);
                        callback(resp);
                    },
                    usuarioId,
                    lugarId
                );
            },
            {Post})

        // Ruta para OBTENER favoritos de un usuario (GET)
        .registerHandler("/favoritos/usuario/{usuario_id}",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback,
               int usuario_id) {

                auto clientPtr = app().getDbClient("default");

                clientPtr->execSqlAsync(
                    "SELECT f.id as favorito_id, l.id, l.nombre, l.descripcion, l.imagen_url, c.nombre as categoria, "
                    "l.latitude, l.longitude, l.wikidata_id, l.source "
                    "FROM favoritos f "
                    "JOIN lugares l ON f.lugar_id = l.id "
                    "JOIN categorias c ON l.categoria_id = c.id "
                    "WHERE f.usuario_id = $1 "
                    "ORDER BY f.created_at DESC",
                    [callback](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["count"] = (int)r.size();

                        for (size_t i = 0; i < r.size(); ++i) {
                            Json::Value favorito;
                            favorito["favorito_id"] = r[i]["favorito_id"].as<int>();
                            favorito["id"] = r[i]["id"].as<int>();
                            favorito["nombre"] = r[i]["nombre"].as<std::string>();
                            favorito["descripcion"] = r[i]["descripcion"].as<std::string>();
                            favorito["imagen_url"] = r[i]["imagen_url"].as<std::string>();
                            favorito["categoria"] = r[i]["categoria"].as<std::string>();
                            
                            if (!r[i]["latitude"].isNull())
                                favorito["latitude"] = r[i]["latitude"].as<double>();
                            if (!r[i]["longitude"].isNull())
                                favorito["longitude"] = r[i]["longitude"].as<double>();
                            if (!r[i]["wikidata_id"].isNull())
                                favorito["wikidata_id"] = r[i]["wikidata_id"].as<std::string>();
                            if (!r[i]["source"].isNull())
                                favorito["source"] = r[i]["source"].as<std::string>();
                            
                            jsonResponse["favoritos"].append(favorito);
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = e.base().what();
                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    },
                    usuario_id
                );
            },
            {Get})

        // Ruta para ELIMINAR de favoritos (DELETE)
        .registerHandler("/favoritos/eliminar/{favorito_id}",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback,
               int favorito_id) {

                auto clientPtr = app().getDbClient("default");

                clientPtr->execSqlAsync(
                    "DELETE FROM favoritos WHERE id = $1",
                    [callback, favorito_id](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        if (r.affectedRows() > 0) {
                            jsonResponse["success"] = true;
                            jsonResponse["message"] = "Lugar eliminado de favoritos";
                        } else {
                            jsonResponse["success"] = false;
                            jsonResponse["error"] = "Favorito no encontrado";
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = e.base().what();
                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    },
                    favorito_id
                );
            },
            {Delete})

        // ========================================
        // ENDPOINTS DE RESEÑAS
        // ========================================

        // Ruta para OBTENER reseñas de un usuario (GET)
        .registerHandler("/resenas/usuario/{usuario_id}",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback,
               int usuario_id) {

                auto clientPtr = app().getDbClient("default");

                clientPtr->execSqlAsync(
                    "SELECT r.id, r.texto, r.calificacion, r.created_at, "
                    "l.id as lugar_id, l.nombre as lugar_nombre, l.imagen_url as lugar_imagen "
                    "FROM resenas r "
                    "JOIN lugares l ON r.lugar_id = l.id "
                    "WHERE r.usuario_id = $1 "
                    "ORDER BY r.created_at DESC",
                    [callback](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["count"] = (int)r.size();

                        for (size_t i = 0; i < r.size(); ++i) {
                            Json::Value resena;
                            resena["id"] = r[i]["id"].as<int>();
                            resena["texto"] = r[i]["texto"].as<std::string>();
                            resena["calificacion"] = r[i]["calificacion"].as<int>();
                            resena["created_at"] = r[i]["created_at"].as<std::string>();
                            resena["lugar_id"] = r[i]["lugar_id"].as<int>();
                            resena["lugar_nombre"] = r[i]["lugar_nombre"].as<std::string>();
                            resena["lugar_imagen"] = r[i]["lugar_imagen"].as<std::string>();
                            jsonResponse["resenas"].append(resena);
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = e.base().what();
                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    },
                    usuario_id
                );
            },
            {Get})

        // Ruta para CREAR una reseña (POST)
        .registerHandler("/resenas",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                if (req->method() != Post) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k405MethodNotAllowed);
                    callback(resp);
                    return;
                }

                auto clientPtr = app().getDbClient("default");
                auto jsonPtr = req->getJsonObject();

                if (!jsonPtr) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = "JSON inválido";
                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k400BadRequest);
                    callback(resp);
                    return;
                }

                int usuarioId = (*jsonPtr)["usuarioId"].asInt();
                int lugarId = (*jsonPtr)["lugarId"].asInt();
                std::string texto = (*jsonPtr)["texto"].asString();
                int calificacion = (*jsonPtr)["calificacion"].asInt();

                if (usuarioId <= 0 || lugarId <= 0 || texto.empty()) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = "Usuario ID, Lugar ID y texto son requeridos";
                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k400BadRequest);
                    callback(resp);
                    return;
                }

                if (calificacion < 1 || calificacion > 5) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = "La calificación debe ser entre 1 y 5";
                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k400BadRequest);
                    callback(resp);
                    return;
                }

                clientPtr->execSqlAsync(
                    "INSERT INTO resenas (usuario_id, lugar_id, texto, calificacion) "
                    "VALUES ($1, $2, $3, $4) RETURNING id, created_at",
                    [callback](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["resena_id"] = r[0]["id"].as<int>();
                        jsonResponse["created_at"] = r[0]["created_at"].as<std::string>();
                        jsonResponse["message"] = "Reseña creada exitosamente";

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        resp->setStatusCode(k201Created);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = "Error al crear reseña";

                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k400BadRequest);
                        callback(resp);
                    },
                    usuarioId,
                    lugarId,
                    texto,
                    calificacion
                );
            },
            {Post})

        // ========================================
        // ENDPOINTS DE CATEGORÍAS
        // ========================================

        // Ruta para OBTENER todas las categorías
        .registerHandler("/categorias",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                auto clientPtr = app().getDbClient("default");

                clientPtr->execSqlAsync(
                    "SELECT id, nombre, descripcion, icono, color FROM categorias ORDER BY id",
                    [callback](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["count"] = (int)r.size();

                        for (size_t i = 0; i < r.size(); ++i) {
                            Json::Value categoria;
                            categoria["id"] = r[i]["id"].as<int>();
                            categoria["nombre"] = r[i]["nombre"].as<std::string>();
                            categoria["descripcion"] = r[i]["descripcion"].as<std::string>();
                            categoria["icono"] = r[i]["icono"].as<std::string>();
                            categoria["color"] = r[i]["color"].as<std::string>();
                            jsonResponse["categorias"].append(categoria);
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = e.base().what();
                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    }
                );
            },
            {Get})

        // Ruta para OBTENER lugares de una categoría
        .registerHandler("/categorias/{categoria_id}/lugares",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback,
               int categoria_id) {

                auto clientPtr = app().getDbClient("default");

                clientPtr->execSqlAsync(
                    "SELECT id, nombre, descripcion, imagen_url, categoria_id, "
                    "wikidata_id, source, latitude, longitude "
                    "FROM lugares WHERE categoria_id = $1 ORDER BY id",
                    [callback](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["count"] = (int)r.size();

                        for (size_t i = 0; i < r.size(); ++i) {
                            Json::Value lugar;
                            lugar["id"] = r[i]["id"].as<int>();
                            lugar["nombre"] = r[i]["nombre"].as<std::string>();
                            lugar["descripcion"] = r[i]["descripcion"].as<std::string>();
                            lugar["imagen_url"] = r[i]["imagen_url"].as<std::string>();
                            lugar["categoria_id"] = r[i]["categoria_id"].as<int>();
                            
                            if (!r[i]["wikidata_id"].isNull())
                                lugar["wikidata_id"] = r[i]["wikidata_id"].as<std::string>();
                            if (!r[i]["source"].isNull())
                                lugar["source"] = r[i]["source"].as<std::string>();
                            if (!r[i]["latitude"].isNull())
                                lugar["latitude"] = r[i]["latitude"].as<double>();
                            if (!r[i]["longitude"].isNull())
                                lugar["longitude"] = r[i]["longitude"].as<double>();
                            
                            jsonResponse["lugares"].append(lugar);
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = e.base().what();
                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    },
                    categoria_id
                );
            },
            {Get})

        // ========================================
        // ENDPOINTS WIKIDATA - SINCRONIZACIÓN
        // ========================================

        // Endpoint para EJECUTAR sincronización con Wikidata
        .registerHandler("/wikidata/sync",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                auto clientPtr = app().getDbClient("default");

                LOG_INFO << "Iniciando sincronización manual con Wikidata...";

                try {
                    auto result = pachaqutec::WikidataClient::syncWithDatabase(clientPtr);

                    Json::Value jsonResponse;
                    jsonResponse["success"] = result.success;
                    jsonResponse["places_added"] = result.placesAdded;
                    jsonResponse["places_updated"] = result.placesUpdated;
                    jsonResponse["places_skipped"] = result.placesSkipped;
                    
                    if (!result.errorMessage.empty()) {
                        jsonResponse["error"] = result.errorMessage;
                    }

                    auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                    if (!result.success) {
                        resp->setStatusCode(k500InternalServerError);
                    }
                    callback(resp);

                } catch (const std::exception& e) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = e.what();

                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k500InternalServerError);
                    callback(resp);
                }
            },
            {Post})

        // Endpoint para VER historial de sincronizaciones
        .registerHandler("/wikidata/sync/history",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                auto clientPtr = app().getDbClient("default");

                clientPtr->execSqlAsync(
                    "SELECT id, sync_type, started_at, finished_at, status, "
                    "places_added, places_updated, places_skipped, error_message "
                    "FROM wikidata_sync_log "
                    "ORDER BY started_at DESC "
                    "LIMIT 20",
                    [callback](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["count"] = (int)r.size();

                        for (size_t i = 0; i < r.size(); ++i) {
                            Json::Value sync;
                            sync["id"] = r[i]["id"].as<int>();
                            sync["sync_type"] = r[i]["sync_type"].as<std::string>();
                            sync["started_at"] = r[i]["started_at"].as<std::string>();
                            
                            if (!r[i]["finished_at"].isNull())
                                sync["finished_at"] = r[i]["finished_at"].as<std::string>();
                            
                            sync["status"] = r[i]["status"].as<std::string>();
                            sync["places_added"] = r[i]["places_added"].as<int>();
                            sync["places_updated"] = r[i]["places_updated"].as<int>();
                            sync["places_skipped"] = r[i]["places_skipped"].as<int>();
                            
                            if (!r[i]["error_message"].isNull())
                                sync["error_message"] = r[i]["error_message"].as<std::string>();
                            
                            jsonResponse["history"].append(sync);
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = e.base().what();
                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    }
                );
            },
            {Get})

        // Endpoint para OBTENER lugares de Wikidata (solo preview, sin guardar)
        .registerHandler("/wikidata/preview",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                LOG_INFO << "Obteniendo preview de lugares Wikidata...";

                try {
                    auto places = pachaqutec::WikidataClient::fetchArequipaPlaces();

                    Json::Value jsonResponse;
                    jsonResponse["success"] = true;
                    jsonResponse["count"] = (int)places.size();

                    for (const auto& place : places) {
                        Json::Value placeJson;
                        placeJson["qid"] = place.qid;
                        placeJson["name"] = place.name;
                        placeJson["name_en"] = place.nameEn;
                        placeJson["description"] = place.description;
                        placeJson["type_qid"] = place.typeQid;
                        placeJson["type_label"] = place.typeLabel;
                        placeJson["latitude"] = place.latitude;
                        placeJson["longitude"] = place.longitude;
                        placeJson["image_url"] = place.imageUrl;
                        placeJson["founding_date"] = place.foundingDate;
                        placeJson["architectural_style"] = place.architecturalStyle;
                        placeJson["heritage_status"] = place.heritageStatus;
                        placeJson["website_url"] = place.websiteUrl;
                        jsonResponse["places"].append(placeJson);
                    }

                    auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                    callback(resp);

                } catch (const std::exception& e) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = e.what();

                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k500InternalServerError);
                    callback(resp);
                }
            },
            {Get})

        // Endpoint para ver mapeo de categorías Wikidata
        .registerHandler("/wikidata/categories",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                auto clientPtr = app().getDbClient("default");

                clientPtr->execSqlAsync(
                    "SELECT wcm.id, wcm.wikidata_qid, wcm.wikidata_label, "
                    "wcm.categoria_id, c.nombre as categoria_nombre "
                    "FROM wikidata_category_mapping wcm "
                    "JOIN categorias c ON wcm.categoria_id = c.id "
                    "ORDER BY c.id, wcm.wikidata_label",
                    [callback](const drogon::orm::Result &r) {
                        Json::Value jsonResponse;
                        jsonResponse["success"] = true;
                        jsonResponse["count"] = (int)r.size();

                        for (size_t i = 0; i < r.size(); ++i) {
                            Json::Value mapping;
                            mapping["id"] = r[i]["id"].as<int>();
                            mapping["wikidata_qid"] = r[i]["wikidata_qid"].as<std::string>();
                            mapping["wikidata_label"] = r[i]["wikidata_label"].as<std::string>();
                            mapping["categoria_id"] = r[i]["categoria_id"].as<int>();
                            mapping["categoria_nombre"] = r[i]["categoria_nombre"].as<std::string>();
                            jsonResponse["mappings"].append(mapping);
                        }

                        auto resp = HttpResponse::newHttpJsonResponse(jsonResponse);
                        callback(resp);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        Json::Value jsonError;
                        jsonError["success"] = false;
                        jsonError["error"] = e.base().what();
                        auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    }
                );
            },
            {Get})

        // ========================================
        // ENDPOINTS RDF - WEB SEMÁNTICA
        // ========================================

        // Endpoint para ontología Turtle
        .registerHandler("/rdf/ontology.ttl",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                // Leer archivo de ontología
                std::ifstream file("rdf/schema/pachaqutec-ontology.ttl");
                if (!file.is_open()) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k404NotFound);
                    resp->setBody("Ontology file not found");
                    callback(resp);
                    return;
                }

                std::stringstream buffer;
                buffer << file.rdbuf();
                file.close();

                auto resp = HttpResponse::newHttpResponse();
                resp->setBody(buffer.str());
                resp->setContentTypeCode(CT_NONE);
                resp->addHeader("Content-Type", "text/turtle; charset=utf-8");
                resp->addHeader("Content-Disposition", "inline; filename=pachaqutec-ontology.ttl");
                callback(resp);
            },
            {Get})

        // Endpoint para ontología RDF/XML
        .registerHandler("/rdf/ontology.rdf",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                std::ifstream file("rdf/schema/pachaqutec-ontology.rdf");
                if (!file.is_open()) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k404NotFound);
                    resp->setBody("Ontology file not found");
                    callback(resp);
                    return;
                }

                std::stringstream buffer;
                buffer << file.rdbuf();
                file.close();

                auto resp = HttpResponse::newHttpResponse();
                resp->setBody(buffer.str());
                resp->setContentTypeCode(CT_APPLICATION_XML);
                resp->addHeader("Content-Disposition", "inline; filename=pachaqutec-ontology.rdf");
                callback(resp);
            },
            {Get})

        // Endpoint RDF con Content Negotiation
        .registerHandler("/rdf/data",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                auto clientPtr = app().getDbClient("default");

                // Obtener header Accept
                std::string accept = req->getHeader("Accept");
                std::string format = req->getParameter("format");

                std::string contentType;
                std::string body;
                std::string filename;

                try {
                    // Determinar formato
                    if (format == "jsonld" || accept.find("application/ld+json") != std::string::npos) {
                        body = pachaqutec::RDFGenerator::generateJSONLD(clientPtr);
                        contentType = "application/ld+json; charset=utf-8";
                        filename = "pachaqutec-data.jsonld";
                    }
                    else if (format == "ntriples" || accept.find("application/n-triples") != std::string::npos) {
                        body = pachaqutec::RDFGenerator::generateNTriples(clientPtr);
                        contentType = "application/n-triples; charset=utf-8";
                        filename = "pachaqutec-data.nt";
                    }
                    else if (format == "rdfxml" || accept.find("application/rdf+xml") != std::string::npos) {
                        body = pachaqutec::RDFGenerator::generateRDFXML(clientPtr);
                        contentType = "application/rdf+xml; charset=utf-8";
                        filename = "pachaqutec-data.rdf";
                    }
                    else {
                        // Default: Turtle
                        body = pachaqutec::RDFGenerator::generateTurtle(clientPtr);
                        contentType = "text/turtle; charset=utf-8";
                        filename = "pachaqutec-data.ttl";
                    }

                    auto resp = HttpResponse::newHttpResponse();
                    resp->setBody(body);
                    resp->setContentTypeCode(CT_NONE);
                    resp->addHeader("Content-Type", contentType);
                    resp->addHeader("Content-Disposition", "inline; filename=" + filename);
                    callback(resp);

                } catch (const std::exception& e) {
                    Json::Value jsonError;
                    jsonError["success"] = false;
                    jsonError["error"] = e.what();

                    auto resp = HttpResponse::newHttpJsonResponse(jsonError);
                    resp->setStatusCode(k500InternalServerError);
                    callback(resp);
                }
            },
            {Get})

        // Endpoint para categorías en Turtle
        .registerHandler("/rdf/data/categorias.ttl",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                auto clientPtr = app().getDbClient("default");

                try {
                    std::ostringstream rdf;
                    rdf << pachaqutec::RDFGenerator::getTurtlePrefixes();
                    rdf << "\n# CATEGORÍAS TURÍSTICAS\n\n";
                    rdf << pachaqutec::RDFGenerator::generateCategoriesTurtle(clientPtr);

                    auto resp = HttpResponse::newHttpResponse();
                    resp->setBody(rdf.str());
                    resp->setContentTypeCode(CT_NONE);
                    resp->addHeader("Content-Type", "text/turtle; charset=utf-8");
                    callback(resp);
                } catch (const std::exception& e) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k500InternalServerError);
                    resp->setBody("Error generating RDF");
                    callback(resp);
                }
            },
            {Get})

        // Endpoint para lugares en Turtle
        .registerHandler("/rdf/data/lugares.ttl",
            [](const HttpRequestPtr& req,
               std::function<void(const HttpResponsePtr&)>&& callback) {

                auto clientPtr = app().getDbClient("default");

                try {
                    std::ostringstream rdf;
                    rdf << pachaqutec::RDFGenerator::getTurtlePrefixes();
                    rdf << "\n# LUGARES TURÍSTICOS\n\n";
                    rdf << pachaqutec::RDFGenerator::generatePlacesTurtle(clientPtr);

                    auto resp = HttpResponse::newHttpResponse();
                    resp->setBody(rdf.str());
                    resp->setContentTypeCode(CT_NONE);
                    resp->addHeader("Content-Type", "text/turtle; charset=utf-8");
                    callback(resp);
                } catch (const std::exception& e) {
                    auto resp = HttpResponse::newHttpResponse();
                    resp->setStatusCode(k500InternalServerError);
                    resp->setBody("Error generating RDF");
                    callback(resp);
                }
            },
            {Get})

        .run();

    return 0;
}
