import os
import json
import re
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

app = FastAPI(title="Microservicio IA - PachaQutec")

# 1. Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Configurar Gemini (SDK Oficial)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("⚠️ ADVERTENCIA: GEMINI_API_KEY no encontrada.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Safety settings para evitar bloqueos
safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

model = genai.GenerativeModel(
    'gemini-2.5-flash',
    safety_settings=safety_settings
)

# 3. Configuración BD
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'postgres'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'mi_base_datos'),
    'user': os.getenv('DB_USER', 'miusuario'),
    'password': os.getenv('DB_PASSWORD', 'mipassword')
}

# Categorías disponibles
CATEGORIAS = {
    'historico': 'Histórico',
    'historia': 'Histórico',
    'histórico': 'Histórico',
    'naturaleza': 'Naturaleza',
    'natural': 'Naturaleza',
    'cultura': 'Cultural',
    'cultural': 'Cultural',
    'gastronomico': 'Gastronomía',
    'gastronómico': 'Gastronomía',
    'gastronomia': 'Gastronomía',
    'comida': 'Gastronomía',
    'restaurante': 'Gastronomía',
    'religioso': 'Religioso',
    'religion': 'Religioso',
    'iglesia': 'Religioso',
    'iglesias': 'Religioso',
    'aventura': 'Aventura',
    'deporte': 'Aventura',
    'extremo': 'Aventura'
}

# Lugares por categoría con coordenadas (basado en Categorias.js y Rutas.js)
LUGARES_POR_CATEGORIA = {
    'Histórico': [
        {'nombre': 'Monasterio de Santa Catalina', 'lat': -16.396067622029932, 'lng': -71.5366005218032},
        {'nombre': 'Casa del Moral', 'lat': -16.396802987371952, 'lng': -71.53775110786229},
        {'nombre': 'Museo Santuarios Andinos', 'lat': -16.399934882268333, 'lng': -71.53775211658956},
        {'nombre': 'Palacio Goyeneche', 'lat': -16.400074006757187, 'lng': -71.53846799680905},
        {'nombre': 'Barrio de San Lázaro', 'lat': -16.393323093967364, 'lng': -71.53388338678013},
        {'nombre': 'Complejo Jesuítico La Compañía', 'lat': -16.39375117166113, 'lng': -71.53317136451146},
        {'nombre': 'Casa de Tristán del Pozo', 'lat': -16.398085943416014, 'lng': -71.53598932977951},
    ],
    'Naturaleza': [
        {'nombre': 'Volcán Misti', 'lat': -16.295696, 'lng': -71.409072},
        {'nombre': 'Cañón del Colca', 'lat': -15.610850, 'lng': -71.906478},
        {'nombre': 'Reserva Nacional Salinas', 'lat': -16.366797979227773, 'lng': -71.20314955052105},
        {'nombre': 'Aguas Termales La Calera', 'lat': -15.614179853941142, 'lng': -71.58674614531635},
        {'nombre': 'Mirador de los Volcanes', 'lat': -15.759021, 'lng': -71.599145},
    ],
    'Cultural': [
        {'nombre': 'Museo Histórico Municipal', 'lat': -16.394655672567666, 'lng': -71.53550555201421},
        {'nombre': 'Fundo El Fierro', 'lat': -16.39406484223187, 'lng': -71.53529830135453},
        {'nombre': 'Teatro Municipal', 'lat': -16.39903698669278, 'lng': -71.53416624090683},
        {'nombre': 'Casa de la Cultura', 'lat': -16.399684760655227, 'lng': -71.53757199168287},
        {'nombre': 'Biblioteca Municipal', 'lat': -16.402355687182176, 'lng': -71.5376309968206},
        {'nombre': 'Centro Cultural Chaves de la Rosa', 'lat': -16.39780707547848, 'lng': -71.53748872802517},
    ],
    'Gastronomía': [
        {'nombre': 'Picantería Sol de Mayo', 'lat': -16.389778933101468, 'lng': -71.54447795895904},
        {'nombre': 'Mercado San Camilo', 'lat': -16.4028529200307, 'lng': -71.53497337606052},
        {'nombre': 'La Nueva Palomino', 'lat': -16.386899986687226, 'lng': -71.53949285797295},
        {'nombre': 'Zig Zag Restaurant', 'lat': -16.39523643659754, 'lng': -71.53546205971878},
        {'nombre': 'Chicha por Gastón Acurio', 'lat': -16.39605496368041, 'lng': -71.53646635663536},
        {'nombre': 'Tradición Arequipeña', 'lat': -16.41811549298699, 'lng': -71.52618120957807},
    ],
    'Religioso': [
        {'nombre': 'Basílica Catedral de Arequipa', 'lat': -16.398732, 'lng': -71.536891},
        {'nombre': 'Convento de la Recoleta', 'lat': -16.393804634613513, 'lng': -71.54148217235459},
        {'nombre': 'Complejo Jesuítico La Compañía', 'lat': -16.39375117166113, 'lng': -71.53317136451146},
        {'nombre': 'Monasterio de Santa Catalina', 'lat': -16.396067622029932, 'lng': -71.5366005218032},
    ],
    'Aventura': [
        {'nombre': 'Volcán Misti', 'lat': -16.295696, 'lng': -71.409072},
        {'nombre': 'Cañón del Colca', 'lat': -15.610850, 'lng': -71.906478},
        {'nombre': 'Mirador de Yanahuara', 'lat': -16.387572825511228, 'lng': -71.5419740129884},
        {'nombre': 'Campiña de Arequipa', 'lat': -16.45826042984957, 'lng': -71.5190021313519},
    ]
}

class MensajeRequest(BaseModel):
    mensaje: str
    contexto: dict = None  # Para mantener estado de conversación

class RutaResponse(BaseModel):
    respuesta_texto: str
    ruta_coordenadas: list = None

def get_db_connection():
    try:
        return psycopg2.connect(**DB_CONFIG)
    except Exception as e:
        print(f"Error DB: {e}")
        return None

def buscar_lugares_db(query: str):
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            sql = """
                SELECT l.id, l.nombre, l.descripcion, 
                       ST_X(l.ubicacion::geometry) as longitud,
                       ST_Y(l.ubicacion::geometry) as latitud,
                       c.nombre as categoria
                FROM lugares l
                LEFT JOIN categorias c ON l.categoria_id = c.id
                WHERE LOWER(l.nombre) LIKE LOWER(%s) 
                   OR LOWER(l.descripcion) LIKE LOWER(%s)
                   OR LOWER(c.nombre) LIKE LOWER(%s)
                LIMIT 5
            """
            search_term = f'%{query}%'
            cursor.execute(sql, (search_term, search_term, search_term))
            return cursor.fetchall()
    except Exception as e:
        print(f"Error SQL: {e}")
        return []
    finally:
        if conn:
            conn.close()

def extraer_json(texto: str):
    """Función robusta para extraer JSON de respuesta de Gemini"""
    # Limpiar marcadores de código
    texto = texto.replace("```json", "").replace("```", "").strip()
    
    # Intentar encontrar JSON con regex
    match = re.search(r'\{.*\}', texto, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except:
            pass
    
    # Si no hay JSON, retornar formato por defecto
    return {
        "intencion": "CHARLA",
        "palabra_clave": None,
        "respuesta_chat": texto
    }

@app.post("/api/chatbot", response_model=RutaResponse)
async def chatbot(request: MensajeRequest):
    try:
        mensaje_usuario = request.mensaje.strip().lower()
        contexto = request.contexto or {}
        
        # Verificar si está esperando respuesta de categoría
        if contexto.get('esperando_categoria'):
            # Detectar categoría en la respuesta del usuario
            categoria_detectada = None
            for key, value in CATEGORIAS.items():
                if key in mensaje_usuario:
                    categoria_detectada = value
                    break
            
            if categoria_detectada and categoria_detectada in LUGARES_POR_CATEGORIA:
                lugares = LUGARES_POR_CATEGORIA[categoria_detectada]
                
                if lugares:
                    nombres = [l['nombre'] for l in lugares[:5]]
                    texto_final = f"¡Perfecto! Aquí tienes lugares de {categoria_detectada}: {', '.join(nombres)}. 🗺️ Abriendo mapa..."
                    
                    coords = [
                        {
                            "id": idx + 1,
                            "nombre": lugar['nombre'],
                            "lat": lugar['lat'],
                            "lng": lugar['lng']
                        }
                        for idx, lugar in enumerate(lugares[:5])
                    ]
                    
                    return RutaResponse(
                        respuesta_texto=texto_final,
                        ruta_coordenadas=coords
                    )
            else:
                return RutaResponse(
                    respuesta_texto="No reconocí esa categoría. Por favor elige entre: Histórico, Naturaleza, Cultural, Gastronomía, Religioso o Aventura."
                )
        
        # Detección de intención principal
        palabras_recomendacion = ['recomienda', 'recomiendame', 'sugieres', 'lugares', 'donde', 'que visito', 'que ver']
        pide_recomendacion = any(palabra in mensaje_usuario for palabra in palabras_recomendacion)
        
        if pide_recomendacion:
            # Si NO especificó categoría, preguntar
            categoria_especificada = None
            for key, value in CATEGORIAS.items():
                if key in mensaje_usuario:
                    categoria_especificada = value
                    break
            
            if not categoria_especificada:
                return RutaResponse(
                    respuesta_texto="¡Me encantaría ayudarte! 😊 ¿Qué tipo de lugares prefieres?\n\n🏛️ Histórico\n🌿 Naturaleza\n🎭 Cultural\n🍲 Gastronomía\n⛪ Religioso\n🧗 Aventura\n\n¿Cuál te interesa más?"
                )
            else:
                # Ya especificó categoría en el mismo mensaje
                if categoria_especificada in LUGARES_POR_CATEGORIA:
                    lugares = LUGARES_POR_CATEGORIA[categoria_especificada]
                    
                    if lugares:
                        nombres = [l['nombre'] for l in lugares[:5]]
                        texto_final = f"¡Excelente elección! Lugares de {categoria_especificada}: {', '.join(nombres)}. 🗺️ Abriendo mapa..."
                        
                        coords = [
                            {
                                "id": idx + 1,
                                "nombre": lugar['nombre'],
                                "lat": lugar['lat'],
                                "lng": lugar['lng']
                            }
                            for idx, lugar in enumerate(lugares[:5])
                        ]
                        
                        return RutaResponse(
                            respuesta_texto=texto_final,
                            ruta_coordenadas=coords
                        )
        
        # Si no es recomendación, buscar lugares específicos
        lugares = buscar_lugares_db(mensaje_usuario)
        if lugares:
            nombres = [l['nombre'] for l in lugares[:3]]
            texto_final = f"Encontré estos lugares: {', '.join(nombres)}. 🗺️ Te los muestro en el mapa."
            
            coords = []
            for l in lugares:
                if l['latitud'] and l['longitud']:
                    coords.append({
                        "id": l['id'],
                        "nombre": l['nombre'],
                        "lat": float(l['latitud']),
                        "lng": float(l['longitud'])
                    })
            
            return RutaResponse(
                respuesta_texto=texto_final,
                ruta_coordenadas=coords
            )
        
        # Charla general
        prompt_sistema = f"""
        Eres PachaQutec, un asistente turístico amigable de Arequipa.
        Usuario dice: "{mensaje_usuario}"
        Responde de forma breve y amable (máximo 2 líneas).
        """
        response = model.generate_content(prompt_sistema)
        return RutaResponse(respuesta_texto=response.text.strip())

    except Exception as e:
        print(f"Error crítico: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno del servidor de IA")

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "chatbot-gemini"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
