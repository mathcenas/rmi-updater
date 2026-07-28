# Nuevas Funcionalidades Agregadas

## 0. Datos Iniciales Completos

El sistema ahora incluye datos reales precargados:

### Datos Incluidos:
- **8 usuarios del equipo**: Leo, Ana, Monica, Cintia, Monica Rosa, Camila, Carmiña, Nicole
- **147 clientes reales** con toda su información
- Datos adicionales de cada cliente (BPS, DGI, credenciales, etc.)

### Archivos:
- `data/rmi-data-template.json` - Plantilla con datos iniciales (NO se modifica)
- `data/rmi-data.json` - Archivo activo del sistema (se crea automáticamente)

### Carga Automática:
Al ejecutar `./init-docker.sh` por primera vez:
1. Se crea el directorio `data/` si no existe
2. Se copia `rmi-data-template.json` a `rmi-data.json`
3. El sistema está listo con todos los usuarios y clientes

**No es necesario importar nada manualmente**, los datos ya están incluidos.

Ver `data/README.md` para más información sobre gestión de datos.

---

## 1. Importar Clientes Masivamente

En la sección **Clientes**, ahora hay un botón **📊 Importar Clientes** que te permite cargar múltiples clientes de una sola vez.

### Formatos Soportados:
- **CSV**: Archivo separado por comas
- **JSON**: Archivo en formato JSON

### Archivos de Ejemplo:
Podés encontrar archivos de ejemplo en la carpeta `ejemplos-importacion/`:
- `clientes-ejemplo.csv` - Ejemplo en formato CSV
- `clientes-ejemplo.json` - Ejemplo en formato JSON

### Cómo Usar:
1. Ingresá al sistema con un usuario Socio o Supervisor
2. Andá a la sección "Clientes"
3. Hacé click en "📊 Importar Clientes"
4. Seleccioná tu archivo CSV o JSON
5. Los clientes se importarán automáticamente

### Formato CSV:
```
nombre,estado,ficha,contabilidad,sueldos,impuestos,socioId,supervisorId,auxiliarId
Empresa ABC SA,Activo,F100,true,true,true,1,3,5
```

### Formato JSON:
```json
[
  {
    "nombre": "Empresa ABC SA",
    "estado": "Activo",
    "ficha": "F100",
    "contabilidad": true,
    "sueldos": true,
    "impuestos": true,
    "socioId": 1,
    "supervisorId": 3,
    "auxiliarId": 5
  }
]
```

## 2. Descargar Backup

En la sección **Clientes**, ahora hay un botón **📥 Descargar Backup** que te permite descargar todos los datos del sistema.

### Qué Incluye:
- Usuarios
- Clientes
- Tareas
- Auditoría

### Cómo Usar:
1. Ingresá al sistema con un usuario Socio o Supervisor
2. Andá a la sección "Clientes"
3. Hacé click en "📥 Descargar Backup"
4. Se descargará un archivo JSON con todos los datos
5. Guardá el archivo en un lugar seguro

## 3. Cargar Backup

En la sección **Clientes**, ahora hay un botón **📤 Cargar Backup** que te permite restaurar todos los datos del sistema desde un backup.

### ⚠️ IMPORTANTE:
- Esta acción **REEMPLAZARÁ TODOS** los datos actuales del sistema
- Siempre descargá un backup antes de hacer cambios importantes
- El sistema se recargará automáticamente después de cargar el backup

### Cómo Usar:
1. Ingresá al sistema con un usuario Socio o Supervisor
2. Andá a la sección "Clientes"
3. Hacé click en "📤 Cargar Backup"
4. Confirmá que querés reemplazar todos los datos
5. Seleccioná el archivo de backup (formato JSON)
6. El sistema se recargará automáticamente

## Notas Importantes:

- Solo usuarios con rol "Socio" o "Supervisor" pueden usar estas funcionalidades
- La importación **agrega** nuevos clientes, no reemplaza los existentes
- El backup incluye **TODOS** los datos del sistema
- Siempre descargá un backup antes de hacer cambios importantes
- Los archivos de backup tienen el formato: `backup-rmi-AAAA-MM-DD.json`

## Auditoría:

Todas estas acciones quedan registradas en el sistema de auditoría:
- `clientes_importados` - Cuando se importan clientes
- `backup_descargado` - Cuando se descarga un backup
- `backup_cargado` - Cuando se carga un backup
