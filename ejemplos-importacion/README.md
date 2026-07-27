# Importación de Clientes

Esta carpeta contiene archivos de ejemplo para importar clientes al sistema RMI.

## Archivos de Ejemplo

- `clientes-ejemplo.csv` - Ejemplo en formato CSV
- `clientes-ejemplo.json` - Ejemplo en formato JSON

## Cómo Importar Clientes

1. Ingresá al sistema con un usuario Socio o Supervisor
2. Andá a la sección "Clientes"
3. Hacé click en el botón "📊 Importar Clientes"
4. Seleccioná tu archivo CSV o JSON
5. Los clientes se importarán automáticamente

## Formato CSV

El archivo CSV debe tener las siguientes columnas (en este orden):

```
nombre,estado,ficha,contabilidad,sueldos,impuestos,socioId,supervisorId,auxiliarId
```

**Campos obligatorios:**
- `nombre` - Nombre del cliente
- `socioId` - ID del socio (1 o 2 según el listado de usuarios)
- `supervisorId` - ID del supervisor (3 o 4 según el listado de usuarios)
- `auxiliarId` - ID del auxiliar (5, 6, 7 u 8 según el listado de usuarios)

**Campos opcionales:**
- `estado` - Puede ser: Activo, Pausado, Baja (por defecto: Activo)
- `ficha` - Código de ficha (se genera automáticamente si no se proporciona)
- `contabilidad` - true/false o 1/0
- `sueldos` - true/false o 1/0
- `impuestos` - true/false o 1/0

## Formato JSON

El archivo JSON debe ser un array de objetos con la siguiente estructura:

```json
[
  {
    "nombre": "Cliente Ejemplo",
    "estado": "Activo",
    "ficha": "F001",
    "contabilidad": true,
    "sueldos": true,
    "impuestos": false,
    "socioId": 1,
    "supervisorId": 3,
    "auxiliarId": 5
  }
]
```

## Backup y Restauración

### Descargar Backup

1. Andá a la sección "Clientes"
2. Hacé click en "📥 Descargar Backup"
3. Se descargará un archivo JSON con TODOS los datos del sistema (usuarios, clientes, tareas, auditoría)

### Cargar Backup

1. Andá a la sección "Clientes"
2. Hacé click en "📤 Cargar Backup"
3. Seleccioná el archivo de backup (formato JSON)
4. **IMPORTANTE:** Esto reemplazará TODOS los datos actuales del sistema
5. El sistema se recargará automáticamente

## Notas Importantes

- Solo usuarios con rol "Socio" o "Supervisor" pueden importar clientes y gestionar backups
- La importación agrega nuevos clientes, no reemplaza los existentes
- El backup incluye TODOS los datos del sistema (usuarios, clientes, tareas, auditoría)
- Siempre descargá un backup antes de hacer cambios importantes
