# Directorio de Datos

Este directorio contiene la base de datos del sistema RMI.

## Archivos

### `rmi-data-template.json` (PLANTILLA - NO BORRAR)
Archivo de plantilla con datos iniciales:
- 8 usuarios (Leo, Ana, Monica, Cintia, Monica Rosa, Camila, Carmiña, Nicole)
- 147 clientes reales del sistema
- 0 tareas (se generan en runtime)
- 0 registros de auditoría (se generan en runtime)

**Este archivo NO se modifica durante el uso del sistema.**

### `rmi-data.json` (PRODUCCIÓN)
Archivo activo que usa el sistema. Contiene:
- Usuarios del sistema
- Clientes y sus datos
- Tareas asignadas
- Registros de auditoría

**Este archivo se modifica constantemente durante el uso del sistema.**

## Inicialización

Cuando levantás el sistema por primera vez:

1. Si NO existe `rmi-data.json`:
   - El script `init-docker.sh` lo crea automáticamente
   - Si existe `rmi-data-template.json`, se copia desde ahí
   - Si no existe la plantilla, el servidor lo crea con datos mínimos

2. Si existe `rmi-data.json`:
   - El sistema lo usa directamente
   - NO se sobrescribe

## Backup

Para hacer backup de los datos:

```bash
# Backup manual
cp ./data/rmi-data.json ./data/backup-$(date +%Y%m%d-%H%M%S).json

# Restaurar desde backup
cp ./data/backup-YYYYMMDD-HHMMSS.json ./data/rmi-data.json
docker-compose restart
```

También podés usar la funcionalidad de backup del sistema desde la interfaz web.

## Resetear datos a plantilla

Si querés volver a los datos iniciales:

```bash
# 1. Hacer backup de datos actuales (opcional)
cp ./data/rmi-data.json ./data/backup-antes-reset.json

# 2. Restaurar plantilla
cp ./data/rmi-data-template.json ./data/rmi-data.json

# 3. Reiniciar el contenedor
docker-compose restart
```

## Estructura del archivo JSON

```json
{
  "users": [
    {
      "id": 1,
      "nombre": "Leo",
      "email": "lrodriguez@rmiconsultores.com",
      "password": "123",
      "rol": "Socio",
      "activo": true
    }
  ],
  "clientes": [
    {
      "id": 1,
      "nombre": "ABE",
      "estado": "Activo",
      "ficha": "F0001",
      "servicios": {
        "contabilidad": true,
        "sueldos": true,
        "impuestos": true,
        "regimenInformativo": "Mensual"
      },
      "socioId": 2,
      "supervisorId": 6,
      "auxiliarId": 8,
      "generarTareasAutomaticas": false,
      "datosAdicionales": {
        "numeroBPS": "",
        "usuarioBPS": "",
        "claveBPS": "",
        "ciCliente": "",
        "usuarioGub": "",
        "claveGub": "",
        "claveCJPPU": "",
        "rut": ""
      }
    }
  ],
  "tareas": [],
  "auditoria": []
}
```

## Notas Importantes

- El archivo `rmi-data.json` está en `.gitignore` para NO subir datos de producción a git
- La plantilla `rmi-data-template.json` SÍ está en git para compartir datos iniciales
- Los backups automáticos también están en `.gitignore`
