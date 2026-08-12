# RMI Uploader

Microservicio para que un cliente suba actualizaciones de sus apps (Gestión RMI,
Contabilidad RMI, y a futuro Web RMI), y para que un admin las revise, las
deploye al servidor real, y pueda restaurar un backup si algo sale mal.

## Los dos perfiles

- **Usuario** — `http://<server>:8080/` (`public/index.html`). Pide la
  `UPLOAD_PASSWORD`. Sube un ZIP o archivos sueltos; quedan guardados en
  `UPLOAD_DIR` (`/tmp/rmi` por defecto), sin tocar nada del servidor todavía.
- **Admin** — `http://<server>:8080/admin.html` (`public/admin.html`). Pide la
  `ADMIN_PASSWORD`. Desde ahí se ve:
  - **Estado de contenedores**: pastillas con corriendo / detenido / no existe
    para cada app conocida.
  - **Uploads en /tmp/rmi**: lo que subió el cliente, con botón **Deploy**.
  - **Backups**: lo que `update-rmi.sh` fue guardando en cada deploy, con
    botón **Restaurar**.

## Cómo se define una "app"

Todo pasa por el objeto `APPS` en `server.js` y el `case` de `update-rmi.sh` —
**tienen que estar sincronizados a mano**, no hay una única fuente de verdad:

| app_id              | directorio real                          | contenedor            |
|----------------------|-------------------------------------------|------------------------|
| `gestion_prod`        | `/srv/gestion-rmi/prod`                  | `gestion-rmi`          |
| `gestion_test`        | `/srv/gestion-rmi/testing`               | `gestion-rmi-testing`  |
| `contabilidad_prod`   | `/srv/contabilidad-rmi/rmi-contabilidad` | `contabilidad-rmi`     |

Para agregar `web_rmi` (o cualquier app nueva) hay que tocar **tres lugares**:

1. `uploader/server.js` → agregar la entrada en `APPS` (`label`, `env`, `dir`,
   `container`).
2. `update-rmi.sh` (raíz del repo) → agregar el caso correspondiente
   (`APP_LABEL`, `APP_ENV`, `APP_DIR`, `CONTAINER`).
3. `docker-compose.yml` (raíz del repo) → agregar el mount del `APP_DIR` nuevo
   al servicio `rmi-uploader`, si no, `update-rmi.sh` va a intentar copiar
   archivos a una ruta que no existe dentro del contenedor.

**El nombre del contenedor tiene que ser exactamente igual** en los tres
lugares y en el `container_name:` real del `docker-compose.yml` de esa app —
si no coincide ni un carácter, ni el estado de contenedores ni el restart
automático del deploy lo van a encontrar.

## Cómo se detecta el estado de un contenedor

`GET /mgmt/container-status` corre, **desde adentro del contenedor
`rmi-uploader`**, esto:

```
docker ps -a --format '{{.Names}}|{{.State}}'
```

y busca ahí el `container` de cada app. Esto solo funciona si:

- El socket de Docker del host está montado en `rmi-uploader`
  (`/var/run/docker.sock:/var/run/docker.sock` en `docker-compose.yml`).
- `rmi-uploader` tiene el binario `docker` instalado (`apk add docker-cli` en
  el `Dockerfile`).
- El nombre configurado en `APPS[app_id].container` coincide **exactamente**
  con el `container_name:` real del contenedor en el host (mayúsculas,
  guiones, sufijos de versión, todo).

### Si un contenedor que sabés que está corriendo aparece como "no existe"

Casi siempre es un desajuste de nombre. Para confirmarlo:

```bash
# nombres reales en el host
sudo docker ps --format '{{.Names}}'

# lo que ve el uploader desde adentro (mismo socket, mismo resultado
# si el mount está bien)
docker exec rmi-uploader docker ps --format '{{.Names}}'
```

Si las dos listas difieren, o si el segundo comando falla (`permission
denied` / `docker: not found`), el problema está en el mount del socket o en
el Dockerfile, no en `server.js`. Si las dos listas coinciden pero igual
aparece "no existe" en el panel, el nombre que espera `APPS[app_id].container`
no es el que realmente tiene el contenedor — hay que renombrarlo (recrearlo
con el `container_name:` correcto) o actualizar `APPS`/`update-rmi.sh` para
que apunten al nombre real.

## Deploy

1. Cliente sube archivos → quedan en `UPLOAD_DIR/<app_id>_<timestamp>/`.
2. Admin aprieta **Deploy** → `POST /mgmt/deploy` → corre
   `update-rmi.sh <app_id>` con `DEPLOY_SRC` apuntando a ese upload.
3. El script:
   - hace backup de `APP_DIR` actual en `BACKUPS_DIR/<app_id>_<timestamp>/`,
   - copia los archivos nuevos a `APP_DIR`,
   - hace `docker restart <container>`.
4. El log se ve en vivo en el panel (SSE). Si `docker restart` falla porque el
   contenedor no existe todavía, los archivos igual quedan copiados — solo
   falta levantar el contenedor a mano una vez.

## Restore

`POST /mgmt/restore` es el mismo flujo que deploy, pero con `DEPLOY_SRC`
apuntando a una carpeta de `BACKUPS_DIR` en vez de a un upload. Como usa el
mismo script, restaurar también genera un backup del estado actual antes de
sobreescribir — no hay forma de "perder" el estado pre-restore.

## Variables de entorno (`.env`, no versionado)

| Variable              | Uso                                                             |
|-----------------------|------------------------------------------------------------------|
| `UPLOAD_PASSWORD`     | Contraseña del perfil usuario (`/upload`).                      |
| `ADMIN_PASSWORD`      | Contraseña del panel admin (todo `/mgmt/*`).                    |
| `UPLOAD_DIR`          | Default `/tmp/rmi`.                                              |
| `BACKUPS_DIR`         | Default `/backups`.                                              |
| `RESEND_API_KEY`      | Si está vacío, se omiten los emails (se loguea nomás).           |
| `RESEND_FROM`         | Remitente de los emails.                                         |
| `DEPLOY_NOTIFY_EMAIL` | Email de admin por defecto para notificaciones de deploy/restore.|

## Seguridad — importante

El contenedor `rmi-uploader` corre **como root** y tiene el socket de Docker
del host montado a propósito, para que el panel admin pueda reiniciar otros
contenedores. Esto equivale, en la práctica, a acceso root sobre el host
entero: cualquiera que consiga la `ADMIN_PASSWORD` (o explote un bug en este
servicio) puede controlar cualquier contenedor del server. Mantené esa
contraseña fuerte y este puerto (8080) fuera de acceso público directo.
