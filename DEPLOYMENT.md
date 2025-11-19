# 🚀 Guía de Deployment - PachaQutec

## Requisitos del VPS

- Ubuntu 20.04 o superior
- Docker y Docker Compose instalados
- Git instalado
- Puerto 80 abierto
- Dominio apuntando al VPS

## Instalación en VPS

### 1. Conectarse al VPS
```bash
ssh root@tu-vps-ip
```

### 2. Instalar Docker
```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Verificar instalación
docker --version
docker-compose --version
```

### 3. Instalar Git
```bash
apt install git -y
```

### 4. Clonar repositorio
```bash
# Ir a directorio de proyectos
cd /var/www

# Clonar repositorio
git clone https://github.com/TU_USUARIO/pachaqutec.git
cd pachaqutec
```

### 5. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.production.server .env

# Editar con tus credenciales
nano .env

# Cambiar:
# - DB_PASSWORD por una contraseña segura
```

### 6. Iniciar aplicación
```bash
# Primera vez
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 7. Configurar dominio

#### Opción A: Nginx como reverse proxy (recomendado)
```bash
# Instalar Nginx
apt install nginx -y

# Crear configuración
nano /etc/nginx/sites-available/pachaqutec
```

**Contenido:**
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
# Habilitar sitio
ln -s /etc/nginx/sites-available/pachaqutec /etc/nginx/sites-enabled/

# Probar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

#### Opción B: Cambiar puerto en docker-compose

Modificar `docker-compose.prod.yml` línea 58:
```yaml
ports:
  - "80:80"  # Ya está así por defecto
```

### 8. Configurar SSL con Let's Encrypt
```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado
certbot --nginx -d tudominio.com -d www.tudominio.com

# Auto-renovación (ya viene configurado)
certbot renew --dry-run
```

## Actualización del proyecto
```bash
cd /var/www/pachaqutec

# Opción 1: Script automático
chmod +x deploy.sh
./deploy.sh

# Opción 2: Manual
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## Comandos útiles
```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Detener todo
docker-compose -f docker-compose.prod.yml down

# Limpiar volúmenes (cuidado!)
docker-compose -f docker-compose.prod.yml down -v
```

## Backup de base de datos
```bash
# Crear backup
docker exec pachaqutec-postgres pg_dump -U pachaqutec_user pachaqutec_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20250118.sql | docker exec -i pachaqutec-postgres psql -U pachaqutec_user pachaqutec_db
```

## Troubleshooting

### Frontend no carga
```bash
docker-compose -f docker-compose.prod.yml logs frontend
```

### Backend no responde
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

### Base de datos no conecta
```bash
docker-compose -f docker-compose.prod.yml logs postgres
```