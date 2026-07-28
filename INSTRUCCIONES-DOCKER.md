# Instrucciones para levantar el Sistema RMI con Docker

## Datos Incluidos

El sistema incluye datos iniciales completos:
- **8 usuarios** del equipo RMI
- **147 clientes** reales con toda su información
- Datos adicionales (BPS, DGI, credenciales, etc.)

Estos datos se cargan automáticamente la primera vez que ejecutás el script de inicialización.

---

## Primera vez que levantás el sistema

### Paso 1: Ejecutar script de inicialización

```bash
./init-docker.sh
```

Este script va a:
- Crear el directorio `data/` si no existe
- Crear el directorio `logs/` si no existe
- Copiar los datos iniciales desde `rmi-data-template.json` a `rmi-data.json`
- Ajustar los permisos correctamente

### Paso 2: Verificar que se creó el archivo de datos

```bash
cat ./data/rmi-data.json | head -30
```

Deberías ver un archivo JSON con:
- **8 usuarios**: Leo, Ana, Monica, Cintia, Monica Rosa, Camila, Carmiña, Nicole
- **147 clientes** reales del sistema (ABE, ATEU, Alejandra Lugo, etc.)

### Paso 3: Levantar el sistema

```bash
docker-compose up -d
```

### Paso 4: Verificar que está funcionando

```bash
# Ver logs
docker-compose logs -f

# Verificar que el contenedor está corriendo
docker-compose ps

# Probar el acceso
curl http://localhost:3000/api/users
```

---

## Si ya tenías el sistema levantado y no aparecen datos

```bash
# 1. Detener el contenedor
docker-compose down

# 2. Verificar el archivo de datos
cat ./data/rmi-data.json | head -20

# Si el archivo está vacío o no existe:
./init-docker.sh

# 3. Levantar nuevamente
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f
```

---

## Verificaciones importantes

### Verificar que el directorio data existe y tiene contenido

```bash
ls -la ./data/
```

Deberías ver:
- `.gitkeep` - archivo que mantiene el directorio en git
- `rmi-data-template.json` - plantilla con datos iniciales (NO se modifica)
- `rmi-data.json` - archivo activo del sistema (se modifica constantemente)
- `README.md` - documentación del directorio

### Verificar cantidad de datos

```bash
# Contar usuarios
grep -o '"nombre"' ./data/rmi-data.json | wc -l

# Contar clientes
grep -o '"ficha"' ./data/rmi-data.json | wc -l
```

### Verificar permisos

```bash
ls -la ./data/rmi-data.json
```

Deberías tener permisos de lectura y escritura (ej: `-rw-r--r--` o `-rwxr-xr-x`)

Si no tenés permisos:
```bash
chmod 755 ./data
chmod 644 ./data/rmi-data.json
```

### Verificar que el volumen se montó correctamente

```bash
docker exec -it rmi-sistema ls -la /app/data/
```

Deberías ver el archivo `rmi-data.json` dentro del contenedor.

```bash
docker exec -it rmi-sistema cat /app/data/rmi-data.json | head -30
```

Deberías ver el contenido del archivo JSON.

---

## Problemas comunes

### Problema 1: No aparecen usuarios ni clientes

**Solución**: Ejecutar `./init-docker.sh` antes de levantar el contenedor.

### Problema 2: Los datos se borran al reiniciar

**Causa**: El volumen no se está montando.

**Solución**:
1. Verificar que existe `./data/rmi-data.json` en tu máquina
2. Verificar permisos: `ls -la ./data`
3. Reiniciar: `docker-compose restart`

### Problema 3: Error de permisos

**Solución**:
```bash
sudo chown -R $USER:$USER ./data
chmod -R 755 ./data
docker-compose restart
```

### Problema 4: El archivo está vacío o tiene datos corruptos

**Solución**:
1. Hacer backup si hay datos importantes
2. Restaurar desde plantilla: `cp ./data/rmi-data-template.json ./data/rmi-data.json`
3. Reiniciar: `docker-compose restart`

---

## Flujo recomendado para levantar el sistema

```bash
# 1. Ir al directorio del proyecto
cd /ruta/a/rmi-sistema

# 2. Si es la primera vez o tenés problemas de datos
./init-docker.sh

# 3. Construir la imagen (solo si es la primera vez o cambiaste código)
docker-compose build

# 4. Levantar el sistema
docker-compose up -d

# 5. Verificar logs
docker-compose logs -f

# 6. Acceder al sistema
# En tu navegador: http://localhost:3000
# Usuario: lrodriguez@rmiconsultores.com
# Password: 123
```

---

## Backup y Restauración

### Hacer backup manual

```bash
# Copiar el archivo de datos
cp ./data/rmi-data.json ./data/backup-$(date +%Y%m%d-%H%M%S).json
```

### Restaurar backup

```bash
# Detener el contenedor
docker-compose down

# Restaurar el backup
cp ./data/backup-YYYYMMDD-HHMMSS.json ./data/rmi-data.json

# Levantar nuevamente
docker-compose up -d
```

### Resetear a datos iniciales

Si querés volver a los datos de la plantilla:

```bash
# 1. Backup opcional de datos actuales
cp ./data/rmi-data.json ./data/backup-antes-reset.json

# 2. Restaurar plantilla
cp ./data/rmi-data-template.json ./data/rmi-data.json

# 3. Reiniciar
docker-compose restart
```

---

## Acceso desde Nginx Proxy Manager

1. En NPM, crear un nuevo Proxy Host
2. **Domain**: tu dominio (ej: `rmi.tudominio.com`)
3. **Scheme**: `http`
4. **Forward Hostname/IP**: `rmi-sistema`
5. **Forward Port**: `3000`
6. Guardar

---

## Soporte

Si seguís teniendo problemas:

1. Revisá los logs: `docker-compose logs -f`
2. Verificá que Docker está corriendo: `docker ps`
3. Verificá que el puerto 3000 no está siendo usado: `netstat -tuln | grep 3000`
4. Verificá el archivo de datos: `cat ./data/rmi-data.json | head -50`
5. Verificá que la plantilla existe: `ls -la ./data/rmi-data-template.json`
