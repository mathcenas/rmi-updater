# Sistema RMI - Gestión de Tareas

Sistema de gestión de tareas con base de datos JSON local, dockerizado para fácil despliegue.

## Datos Incluidos

El sistema incluye datos reales precargados:
- 8 usuarios del equipo RMI
- 147 clientes con información completa
- Ver `DATOS-INCLUIDOS.md` para el listado completo

## Requisitos

- Docker
- Docker Compose

## Instalación y Uso

### 1. Construir la imagen Docker

```bash
docker-compose build
```

### 2. Iniciar el sistema

```bash
docker-compose up -d
```

### 3. Verificar que está funcionando

```bash
docker-compose ps
```

El servidor estará disponible:
- Localmente: `http://localhost:3000`
- A través de Nginx Proxy Manager: Configurar tus URLs personalizadas

## Configuración con Nginx Proxy Manager

Este sistema está optimizado para trabajar con Nginx Proxy Manager:

1. **Red Docker compartida**: El contenedor se conecta automáticamente a la red `npm_default`
2. **Puerto interno**: Expone el puerto 3000 solo a localhost y a la red Docker
3. **Trust proxy**: Configurado para confiar en headers de proxy (X-Forwarded-For, etc.)

### Configurar en NPM:

1. Abre Nginx Proxy Manager
2. Añade un nuevo Proxy Host
3. **Domain Names**: Tus URLs (ej: `rmi.tudominio.com`)
4. **Scheme**: `http`
5. **Forward Hostname/IP**: `rmi-sistema`
6. **Forward Port**: `3000`
7. Habilita "Block Common Exploits"
8. Opcional: Configura SSL/HTTPS con Let's Encrypt

### 4. Ver logs

```bash
docker-compose logs -f
```

### 5. Detener el sistema

```bash
docker-compose down
```

## Persistencia de datos

Los datos se guardan en el directorio `./data` de tu máquina local, por lo que persisten aunque detengas o elimines el contenedor.

### Datos iniciales incluidos

El sistema incluye una plantilla de datos (`data/rmi-data-template.json`) con:
- **8 usuarios**: Leo, Ana, Monica, Cintia, Monica Rosa, Camila, Carmiña, Nicole
- **147 clientes** reales del sistema
- Datos adicionales de cada cliente (BPS, DGI, etc.)

La primera vez que se ejecuta `./init-docker.sh`, estos datos se copian automáticamente a `rmi-data.json`.

## Endpoints API

- `GET /api/data` - Obtener todos los datos
- `GET /api/:collection` - Obtener colección específica
- `POST /api/:collection` - Actualizar colección
- `POST /api/batch` - Actualizar múltiples colecciones
- `POST /api/backup` - Crear respaldo
- `GET /api/backup/download` - Descargar respaldo
- `POST /api/restore` - Restaurar desde respaldo

## Acceso desde otros dispositivos en la red

El servidor está configurado para aceptar conexiones desde cualquier IP. Para acceder desde otros dispositivos:

1. Obtén la IP de tu servidor: `ip addr` o `ipconfig`
2. Accede desde otro dispositivo: `http://[IP-SERVIDOR]:3000`

## Comandos útiles

```bash
# Reconstruir y reiniciar
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Entrar al contenedor
docker exec -it rmi-sistema sh

# Ver estado de salud
docker inspect rmi-sistema | grep -A 10 Health
```
