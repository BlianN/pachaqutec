cmake_minimum_required(VERSION 3.10)
project(mi_aplicacion)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Encuentra Drogon
find_package(Drogon CONFIG REQUIRED)

# Encuentra PostgreSQL
find_package(PostgreSQL REQUIRED)

# Encuentra CURL para peticiones HTTP a Wikidata
find_package(CURL REQUIRED)

# Ejecutable con todos los archivos fuente
add_executable(mi_aplicacion 
    src/main.cpp
    src/RDFGenerator.cpp
    src/WikidataClient.cpp
)

# Incluye directorios de headers
target_include_directories(mi_aplicacion PRIVATE 
    ${PostgreSQL_INCLUDE_DIRS}
    ${CURL_INCLUDE_DIRS}
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# Enlaza con todas las librerías necesarias
target_link_libraries(mi_aplicacion PRIVATE 
    Drogon::Drogon
    ${PostgreSQL_LIBRARIES}
    ${CURL_LIBRARIES}
)
