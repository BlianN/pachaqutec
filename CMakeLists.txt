cmake_minimum_required(VERSION 3.10)
project(mi_aplicacion)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Encuentra Drogon
find_package(Drogon CONFIG REQUIRED)

# Encuentra PostgreSQL
find_package(PostgreSQL REQUIRED)

# ✅ Agrega tu ejecutable con TODOS los archivos fuente
add_executable(mi_aplicacion 
    src/main.cpp
    src/RDFGenerator.cpp
)

# Incluye directorios de PostgreSQL y headers locales
target_include_directories(mi_aplicacion PRIVATE 
    ${PostgreSQL_INCLUDE_DIRS}
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# Enlaza con Drogon y PostgreSQL
target_link_libraries(mi_aplicacion PRIVATE 
    Drogon::Drogon
    ${PostgreSQL_LIBRARIES}
)