# Inicio Rápido - Sistema RMI

## 3 Pasos para Levantar el Sistema

### 1. Inicializar
```bash
./init-docker.sh
```

### 2. Levantar
```bash
docker-compose up -d
```

### 3. Acceder
Abrir en el navegador: `http://localhost:3000`

**Usuario**: lrodriguez@rmiconsultores.com
**Password**: 123

## Datos Ya Incluidos

- ✅ 8 usuarios del equipo
- ✅ 147 clientes reales
- ✅ Datos completos (BPS, DGI, etc.)

**No necesitás importar nada**, todo está listo.

## Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Detener
docker-compose down

# Backup de datos
cp ./data/rmi-data.json ./data/backup-$(date +%Y%m%d).json
```

## Si No Aparecen Datos

```bash
docker-compose down
./init-docker.sh
docker-compose up -d
```

## Documentación Completa

- `README.md` - Información general
- `DATOS-INCLUIDOS.md` - Listado de usuarios y clientes
- `INSTRUCCIONES-DOCKER.md` - Troubleshooting detallado
- `data/README.md` - Gestión de datos
