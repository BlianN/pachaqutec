# Imagen base con Ubuntu y herramientas de desarrollo
FROM ubuntu:22.04 AS builder

# Evitar prompts interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Actualizar e instalar dependencias básicas
RUN apt-get update && apt-get install -y \
    git \
    gcc \
    g++ \
    cmake \
    libjsoncpp-dev \
    uuid-dev \
    zlib1g-dev \
    openssl \
    libssl-dev \
    postgresql-server-dev-all \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar Drogon Framework
RUN git clone https://github.com/drogonframework/drogon /tmp/drogon && \
    cd /tmp/drogon && \
    git submodule update --init && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make -j$(nproc) && \
    make install && \
    ldconfig && \
    rm -rf /tmp/drogon

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY CMakeLists.txt .
COPY src/ ./src/
COPY rdf/ ./rdf/

# Crear directorio build y compilar
RUN mkdir build && \
    cd build && \
    cmake .. && \
    make -j$(nproc)

# Exponer el puerto del backend
EXPOSE 8080

# Ejecutar la aplicación
CMD ["./build/mi_aplicacion"]