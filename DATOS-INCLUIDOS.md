# Datos Incluidos en el Sistema RMI

El sistema viene con datos reales precargados, listos para usar.

## Resumen

- **8 Usuarios** del equipo RMI
- **147 Clientes** reales del sistema
- **Datos adicionales** completos (BPS, DGI, credenciales)

## Usuarios Incluidos

| ID | Nombre | Email | Rol |
|----|--------|-------|-----|
| 1 | Leo | lrodriguez@rmiconsultores.com | Socio |
| 2 | Ana | airiarte@rmiconsultores.com | Socio |
| 3 | Monica | mmesorio@rmiconsultores.com | Supervisor |
| 4 | Cintia | csalvatierra@rmiconsultores.com | Supervisor |
| 5 | Monica Rosa | mrosa@rmiconsultores.com | Auxiliar |
| 6 | Camila | ccraigdallie@rmiconsultores.com | Supervisor |
| 7 | Carmiña | czeballos@rmiconsultores.com | Auxiliar |
| 8 | Nicole | nmedina@rmiconsultores.com | Auxiliar |

**Password para todos**: `123`

## Clientes Incluidos

147 clientes reales, incluyendo:

| Ficha | Nombre | Estado | Servicios |
|-------|--------|--------|-----------|
| F999 | GENERAL | Activo | - |
| F0001 | ABE | Activo | Contabilidad, Sueldos, Impuestos |
| F0002 | ATEU | Activo | Contabilidad, Sueldos, Impuestos |
| F0003 | Alejandra Lugo | Activo | Contabilidad, Sueldos, Impuestos |
| F0004 | Lorena Clavijo | Activo | Contabilidad, Sueldos, Impuestos |
| F0005 | Pablo Flores | Inactivo | Contabilidad, Sueldos, Impuestos |
| ... | ... | ... | ... |

Y 141 clientes más con toda su información completa.

## Datos Adicionales por Cliente

Cada cliente incluye:
- Número BPS
- Usuario BPS
- Clave BPS
- CI del Cliente
- Usuario gub.uy
- Clave gub.uy
- Clave CJPPU
- RUT

## Cómo se Cargan los Datos

### Primera Vez

Al ejecutar `./init-docker.sh`:

1. Se crea el directorio `data/` si no existe
2. Se copia `rmi-data-template.json` a `rmi-data.json`
3. Los datos están listos para usar

### Verificar Datos Cargados

```bash
# Ver resumen
./init-docker.sh

# Ver usuarios
cat ./data/rmi-data.json | grep -A 5 '"users"' | head -20

# Ver clientes
cat ./data/rmi-data.json | grep -A 5 '"clientes"' | head -30
```

## Gestión de Datos

### Backup de Datos

```bash
# Backup automático (desde la interfaz web)
# Sección Usuarios > Respaldo de Datos

# Backup manual
cp ./data/rmi-data.json ./data/backup-$(date +%Y%m%d-%H%M%S).json
```

### Restaurar Datos Iniciales

Si querés volver a los datos originales:

```bash
# 1. Backup de datos actuales (opcional)
cp ./data/rmi-data.json ./data/backup-actual.json

# 2. Restaurar plantilla
cp ./data/rmi-data-template.json ./data/rmi-data.json

# 3. Reiniciar
docker-compose restart
```

### Restaurar Backup

```bash
# Detener contenedor
docker-compose down

# Restaurar backup
cp ./data/backup-YYYYMMDD-HHMMSS.json ./data/rmi-data.json

# Levantar
docker-compose up -d
```

## Archivos Importantes

| Archivo | Descripción | Se Modifica |
|---------|-------------|-------------|
| `data/rmi-data-template.json` | Plantilla con datos iniciales | ❌ NO |
| `data/rmi-data.json` | Datos activos del sistema | ✅ SÍ |
| `data/backup-*.json` | Backups automáticos | ❌ NO |
| `data/README.md` | Documentación del directorio | ❌ NO |

## Notas Importantes

1. **NO borrar** `rmi-data-template.json` - es la plantilla de datos
2. El archivo `rmi-data.json` se modifica constantemente durante el uso
3. Los backups se guardan en el mismo directorio `data/`
4. Los datos persisten aunque detengas o reinicies el contenedor Docker
5. Para compartir el sistema con otros, compartir el archivo `rmi-data-template.json`

## Acceso al Sistema

Una vez levantado el sistema:

1. Ir a `http://localhost:3000` (o tu dominio configurado)
2. Usar cualquiera de los usuarios de la tabla anterior
3. Password: `123`
4. Los clientes ya están cargados y listos para usar

## Soporte

Ver más información en:
- `README.md` - Instrucciones generales
- `INSTRUCCIONES-DOCKER.md` - Instrucciones detalladas de Docker
- `data/README.md` - Gestión de datos
- `NUEVAS_FUNCIONALIDADES.md` - Funcionalidades del sistema
