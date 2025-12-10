# 🤖 CHATBOT CON GOOGLE GEMINI - INSTRUCCIONES

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha integrado Google Gemini 1.5 con el chatbot de PachaQutec.

### 📁 Archivos modificados/creados:

**Frontend:**
- ✅ `/frontend/src/services/chatbot.js` - Servicio para comunicarse con el backend
- ✅ `/frontend/src/pages/Chatbot.js` - Lógica actualizada con Gemini
- ✅ `/frontend/src/pages/Chatbot.css` - Estilos (indicador "escribiendo...")
- ✅ `/frontend/src/pages/Rutas.js` - Recibe rutas del chatbot
- ✅ `/frontend/.env.local` - Variables de entorno

**Backend:**
- ✅ `/docker-compose.dev.yml` - Variable GEMINI_API_KEY agregada
- ⏳ `/src/main.cpp` - **PENDIENTE:** Endpoint `/api/chatbot` (ver abajo)

---

## 🔑 PASO 1: CONSEGUIR API KEY DE GOOGLE GEMINI

1. Ve a: https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Create API Key"**
4. Copia la API Key generada

---

## 🔧 PASO 2: CONFIGURAR API KEY

Edita `/docker-compose.dev.yml` línea 51:

```yaml
GEMINI_API_KEY: "TU_API_KEY_AQUI"
```

---

## 💻 PASO 3: IMPLEMENTAR ENDPOINT EN BACKEND C++

Agrega este código en `/src/main.cpp`:

```cpp
#include <drogon/drogon.h>
#include <drogon/HttpController.h>
#include <curl/curl.h>
#include <jsoncpp/json/json.h>

// Callback para libcurl
static size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp) {
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

// Endpoint del chatbot
app().registerHandler(
    "/api/chatbot",
    [](const HttpRequestPtr &req,
       std::function<void(const HttpResponsePtr &)> &&callback) {
        
        // Parsear request
        auto json = req->getJsonObject();
        std::string mensaje = (*json)["mensaje"].asString();
        
        // Obtener API Key desde variable de entorno
        const char* apiKey = std::getenv("GEMINI_API_KEY");
        if (!apiKey) {
            Json::Value error;
            error["respuesta_texto"] = "Error: API Key no configurada";
            error["ruta_coordenadas"] = Json::arrayValue;
            auto resp = HttpResponse::newHttpJsonResponse(error);
            callback(resp);
            return;
        }
        
        // Preparar request a Gemini
        CURL *curl = curl_easy_init();
        std::string response_string;
        
        if(curl) {
            // URL de Gemini API
            std::string url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";
            url += apiKey;
            
            // Prompt para Gemini (RESPUESTAS BREVES)
            Json::Value geminiRequest;
            Json::Value content;
            Json::Value part;
            
            std::string systemPrompt = R"(
Eres PachaBot, asistente turístico de Arequipa, Perú. 
IMPORTANTE: Da respuestas MUY BREVES (máximo 2-3 líneas).

Si el usuario pide RECOMENDACIONES o RUTAS:
- Responde brevemente que buscarás lugares.
- Formato: {"tipo":"recomendacion","texto":"Buscando lugares...","lugares":["Plaza de Armas","Santa Catalina"]}

Si pregunta INFORMACIÓN GENERAL:
- Responde brevemente con tu conocimiento.
- Formato: {"tipo":"info","texto":"Respuesta breve"}

Si pregunta sobre UN LUGAR:
- Da información breve (1-2 líneas).
- Formato: {"tipo":"lugar","texto":"Info breve","lugar":"Nombre"}

Siempre responde en JSON.
)";
            
            part["text"] = systemPrompt + "\n\nUsuario: " + mensaje;
            content["parts"].append(part);
            geminiRequest["contents"].append(content);
            
            Json::StreamWriterBuilder writer;
            std::string jsonStr = Json::writeString(writer, geminiRequest);
            
            // Configurar curl
            curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonStr.c_str());
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_string);
            
            struct curl_slist *headers = NULL;
            headers = curl_slist_append(headers, "Content-Type: application/json");
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
            
            // Ejecutar request
            CURLcode res = curl_easy_perform(curl);
            curl_easy_cleanup(curl);
            curl_slist_free_all(headers);
            
            if(res == CURLE_OK) {
                // Parsear respuesta de Gemini
                Json::CharReaderBuilder readerBuilder;
                Json::Value geminiResponse;
                std::istringstream iss(response_string);
                std::string errs;
                
                if (Json::parseFromStream(readerBuilder, iss, &geminiResponse, &errs)) {
                    std::string geminiText = geminiResponse["candidates"][0]["content"]["parts"][0]["text"].asString();
                    
                    // Parsear respuesta JSON de Gemini
                    Json::Value geminiData;
                    std::istringstream geminiStream(geminiText);
                    if (Json::parseFromStream(readerBuilder, geminiStream, &geminiData, &errs)) {
                        
                        std::string tipo = geminiData["tipo"].asString();
                        std::string texto = geminiData["texto"].asString();
                        
                        Json::Value finalResponse;
                        finalResponse["respuesta_texto"] = texto;
                        
                        // Si es recomendación, consultar BD
                        if (tipo == "recomendacion" && geminiData.isMember("lugares")) {
                            // TODO: Consultar PostgreSQL por los lugares mencionados
                            // Por ahora, devolver array vacío
                            Json::Value coordenadas(Json::arrayValue);
                            
                            // Ejemplo hardcodeado (reemplazar con query real):
                            /*
                            Json::Value lugar1;
                            lugar1["id"] = 1;
                            lugar1["nombre"] = "Plaza de Armas";
                            lugar1["lat"] = -16.398866;
                            lugar1["lon"] = -71.536961;
                            coordenadas.append(lugar1);
                            */
                            
                            finalResponse["ruta_coordenadas"] = coordenadas;
                        } else {
                            finalResponse["ruta_coordenadas"] = Json::arrayValue;
                        }
                        
                        auto resp = HttpResponse::newHttpJsonResponse(finalResponse);
                        callback(resp);
                        return;
                    }
                }
            }
        }
        
        // Error fallback
        Json::Value error;
        error["respuesta_texto"] = "Lo siento, hubo un error.";
        error["ruta_coordenadas"] = Json::arrayValue;
        auto resp = HttpResponse::newHttpJsonResponse(error);
        callback(resp);
    },
    {Post}
);
```

---

## 🚀 PASO 4: RECONSTRUIR Y PROBAR

```bash
# Reconstruir contenedores
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build

# Abrir aplicación
google-chrome http://localhost:3000
```

---

## 🧪 PRUEBAS SUGERIDAS:

1. **Información general:**
   - "¿Cuál es la mejor época para visitar Arequipa?"
   - Debería: Solo texto, sin mapa

2. **Recomendación:**
   - "Dame una ruta por el centro histórico"
   - Debería: Texto + redirección a /rutas con mapa

3. **Lugar específico:**
   - "Cuéntame sobre el Monasterio de Santa Catalina"
   - Debería: Texto breve con información

---

## 📝 NOTAS IMPORTANTES:

- ✅ Frontend completamente listo
- ⏳ Backend necesita implementar endpoint `/api/chatbot`
- ⏳ Backend necesita consultas a PostgreSQL para coordenadas
- 🔒 API Key está en backend (más seguro que frontend)
- 🎯 Gemini configurado para respuestas BREVES

---

## 🐛 TROUBLESHOOTING:

**Error "No pude conectarme al servidor":**
- Verifica que backend esté corriendo: `docker ps`
- Revisa logs: `docker logs pachaqutec-backend-dev`

**Gemini no responde:**
- Verifica API Key en docker-compose.dev.yml
- Chequea que la API Key sea válida

**Ruta no se dibuja:**
- Revisa console del navegador (F12)
- Verifica que backend devuelva `ruta_coordenadas` en formato correcto
