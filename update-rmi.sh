#!/bin/bash
# Script de actualizacion del sistema RMI
# Uso: ./update-rmi.sh [app] [email]
#   app   : gestion_prod | gestion_test | contabilidad_prod
#   email : destinatario del email de confirmacion (opcional, sobreescribe .env)
# Env vars opcionales:
#   DEPLOY_SRC : ruta exacta al directorio de upload (lo usa el admin panel)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Cargar .env ───────────────────────────────────────────────────────────────
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  . "$SCRIPT_DIR/.env"
  set +a
fi

APP="${1:-gestion_prod}"
NOTIFY_EMAIL="${2:-$DEPLOY_NOTIFY_EMAIL}"
RESEND_API_KEY="${RESEND_API_KEY:-}"
RESEND_FROM="${RESEND_FROM:-RMI Deploy <noreply@cenas.com.uy>}"
UPLOAD_DIR="${UPLOAD_DIR:-/tmp/rmi}"

# ── Configuracion por app ─────────────────────────────────────────────────────
case "$APP" in
  gestion_prod)
    APP_LABEL="Gestion RMI"
    APP_ENV="Produccion"
    APP_DIR="/home/rmi/rmi/rmi-sistema/rmi-prod"
    CONTAINER="rmi-sistema"
    ;;
  gestion_test)
    APP_LABEL="Gestion RMI"
    APP_ENV="Testing"
    APP_DIR="/home/rmi/rmi/testing-rmi/rmi-test"
    CONTAINER="rmi-testing"
    ;;
  contabilidad_prod)
    APP_LABEL="Contabilidad RMI"
    APP_ENV="Produccion"
    APP_DIR="/srv/contabilidad-rmi/rmi-contabilidad"
    CONTAINER="rmi-contabilidad"
    ;;
  *)
    echo "ERROR: app desconocida '$APP'. Usar: gestion_prod | gestion_test | contabilidad_prod"
    exit 1
    ;;
esac

echo "=== Actualizacion RMI — $APP_LABEL ($APP_ENV) ==="

# ── Resolver directorio fuente ────────────────────────────────────────────────
# DEPLOY_SRC puede venir del admin panel (apunta al upload exacto)
if [ -n "$DEPLOY_SRC" ]; then
  LATEST="$DEPLOY_SRC"
  echo "Fuente (admin): $LATEST"
else
  echo "Buscando archivos en: $UPLOAD_DIR"
  LATEST=$(ls -1d "$UPLOAD_DIR/${APP}_"* 2>/dev/null | sort | tail -1)
  if [ -z "$LATEST" ]; then
    echo "ERROR: No hay archivos subidos para '$APP' en $UPLOAD_DIR"
    echo "El cliente debe subir los archivos primero desde el uploader (puerto 8080)."
    exit 1
  fi
  echo "Directorio de upload (ultimo): $LATEST"
fi

if [ ! -d "$LATEST" ]; then
  echo "ERROR: Directorio no existe: $LATEST"
  exit 1
fi

echo "Fecha upload: $(date -r "$LATEST" '+%Y-%m-%d %H:%M:%S')"

# ── Backup del destino actual ─────────────────────────────────────────────────
BACKUP_TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$SCRIPT_DIR/backups/${APP}_$BACKUP_TS"
mkdir -p "$BACKUP_DIR"

if [ -d "$APP_DIR" ]; then
  cp -r "$APP_DIR/." "$BACKUP_DIR/" 2>/dev/null || true
  echo "Backup creado: $BACKUP_DIR"
fi

# ── Copiar archivos al destino ────────────────────────────────────────────────
mkdir -p "$APP_DIR"
COPIED_FILES=""

for item in "$LATEST"/*; do
  [ -e "$item" ] || continue
  name=$(basename "$item")
  cp -r "$item" "$APP_DIR/$name"
  COPIED_FILES="$COPIED_FILES $name"
  echo "Copiado: $name → $APP_DIR/"
done

# ── Reiniciar contenedor ──────────────────────────────────────────────────────
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
if [ -f "$COMPOSE_FILE" ]; then
  echo "Reiniciando contenedor $CONTAINER..."
  docker compose -f "$COMPOSE_FILE" restart "$CONTAINER" 2>&1 && RESTART_OK=true || RESTART_OK=false
else
  echo "AVISO: docker-compose.yml no encontrado en $SCRIPT_DIR, saltando restart."
  RESTART_OK=false
fi

DEPLOY_DATE=$(date '+%Y-%m-%d %H:%M:%S')
echo ""
echo "==================================================="
echo "Deploy completado: $APP_LABEL ($APP_ENV)"
echo "Archivos:$COPIED_FILES"
echo "Backup: $BACKUP_DIR"
echo "Fecha: $DEPLOY_DATE"
echo "==================================================="
