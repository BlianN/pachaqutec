#!/bin/bash

# Script de deployment para VPS
echo "---> Iniciando deployment de PachaQutec..."

# Pull latest changes
echo "---> Pulling latest changes from Git..."
git pull origin main

# Stop current containers
echo "---> Deteniendo contenedores actuales..."
docker-compose -f docker-compose.prod.yml down

# Rebuild and start
echo "---> Rebuilding containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Show logs
echo "---> Mostrando logs..."
docker-compose -f docker-compose.prod.yml logs -f