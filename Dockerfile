# Dockerfile para Sistema RMI de Gestión de Tareas
FROM node:18-alpine

# Información del contenedor
LABEL maintainer="RMI Consultores"
LABEL description="Sistema de gestión de tareas con base de datos compartida"

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar archivos del sistema
COPY server.js ./
COPY public ./public

# Crear directorio para datos (se montará como volumen)
RUN mkdir -p /app/data

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck para verificar que el servidor está corriendo
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/data', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar el servidor
CMD ["node", "server.js"]
