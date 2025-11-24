# Etapa 1: Build con Node.js
FROM node:18-alpine as build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias con legacy peer deps
RUN npm install --silent --legacy-peer-deps

# Copiar el resto del código
COPY . .

# ✅ Aceptar argumentos de build para variables de entorno
ARG REACT_APP_API_URL=/api
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN
ARG REACT_APP_FIREBASE_PROJECT_ID
ARG REACT_APP_FIREBASE_STORAGE_BUCKET
ARG REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ARG REACT_APP_FIREBASE_APP_ID
ARG REACT_APP_GOOGLE_MAPS_API_KEY


# ✅ Configurar variables de entorno para el build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_FIREBASE_API_KEY=$REACT_APP_FIREBASE_API_KEY
ENV REACT_APP_FIREBASE_AUTH_DOMAIN=$REACT_APP_FIREBASE_AUTH_DOMAIN
ENV REACT_APP_FIREBASE_PROJECT_ID=$REACT_APP_FIREBASE_PROJECT_ID
ENV REACT_APP_FIREBASE_STORAGE_BUCKET=$REACT_APP_FIREBASE_STORAGE_BUCKET
ENV REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ENV REACT_APP_FIREBASE_APP_ID=$REACT_APP_FIREBASE_APP_ID
ENV REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY


# Construir la aplicación
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true
RUN CI=false npm run build

# Etapa 2: Servidor de producción con Nginx
FROM nginx:alpine

# Copiar los archivos build al servidor nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]