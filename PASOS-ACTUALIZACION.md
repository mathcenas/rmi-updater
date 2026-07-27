# Pasos para Actualizar el Sistema a v1.1.0

## Contexto
El archivo `index.html` ha sido actualizado con mejoras de seguridad y nuevas funcionalidades, pero los cambios no se verán hasta que migres los datos del navegador.

## ¿Qué se agregó?

1. **Usuario SysAdmin** con acceso a backup/importación
2. **Contraseñas hasheadas** (SHA-256) en lugar de texto plano
3. **Sección Backup/Import** visible solo para SysAdmin
4. **Versión y fecha de build** en el footer del menú
5. **Validación de importación** para prevenir inyección de datos maliciosos

## OPCIÓN 1: Migración Automática (Más Fácil)

1. **Sube el nuevo `index.html` al servidor**
   - Reemplaza `/var/www/gestion.rmiconsultores.com/public/index.html` con el nuevo

2. **En el navegador, abre la consola** (F12)

3. **Ejecuta este comando:**
   ```javascript
   localStorage.removeItem('migracion_seguridad'); location.reload();
   ```

4. **Espera 2 segundos** y verás en la consola:
   ```
   [SEGURIDAD] Iniciando migracion de contraseñas...
   [SEGURIDAD] Password hasheado para: [emails]
   [SEGURIDAD] Usuario SysAdmin creado
   [SEGURIDAD] Migracion completada exitosamente
   ```

5. **Cierra sesión y prueba login como SysAdmin:**
   - Email: `sysadmin@rmiconsultores.com`
   - Password: `rmi2026`

## OPCIÓN 2: Migración Manual con Script

Si la opción 1 no funciona, ejecuta este script completo en la consola:

```javascript
(async function() {
    console.log('[MIGRACION] Iniciando...');

    const hashPassword = async (password) => {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const esHash = (str) => /^[a-f0-9]{64}$/.test(str);
    let usuarios = JSON.parse(localStorage.getItem('users') || '[]');

    for (let usuario of usuarios) {
        if (!esHash(usuario.password)) {
            usuario.password = await hashPassword(usuario.password);
            console.log(`✓ Password hasheado: ${usuario.email}`);
        }
    }

    const sysAdminExiste = usuarios.find(u => u.email === 'sysadmin@rmiconsultores.com');
    if (!sysAdminExiste) {
        usuarios.push({
            id: 99,
            nombre: 'SysAdmin',
            email: 'sysadmin@rmiconsultores.com',
            password: await hashPassword('rmi2026'),
            rol: 'SysAdmin',
            activo: true
        });
        console.log('✓ Usuario SysAdmin creado');
    }

    localStorage.setItem('users', JSON.stringify(usuarios));
    localStorage.setItem('migracion_seguridad', '1.1.0');
    console.log('✓ Migracion completada. Recargando...');
    setTimeout(() => location.reload(), 1000);
})();
```

## OPCIÓN 3: Empezar de Cero (Solo si tienes backup)

1. **Descarga un backup primero** (si tienes datos importantes)
2. En la consola: `localStorage.clear()`
3. Recarga la página: `location.reload()`
4. Los datos se cargarán frescos con las contraseñas hasheadas

## Verificar que Funcionó

Después de la migración deberías ver:

✅ **En el menú lateral (como SysAdmin):**
- Dashboard
- Tareas
- Clientes
- Mi Perfil
- Planificacion
- **Backup/Import** ← Nueva opción

✅ **En el footer del menú:**
- v1.1.0
- Build: 2026-04-05 (o la fecha actual)

✅ **Funcionalidad de Backup:**
- Exportar: Descarga JSON con todos los datos
- Importar: Sube JSON para restaurar datos
- Limpiar: Elimina todo (con confirmación)

## Credenciales

**NO CAMBIAN para los usuarios:**
- Usuarios regulares: `123`
- SysAdmin: `rmi2026`

Solo están hasheadas internamente para seguridad.

## Troubleshooting

### "No veo la opción Backup/Import"
→ No estás logueado como SysAdmin. Usa `sysadmin@rmiconsultores.com`

### "Login no funciona con las credenciales"
→ La migración no se ejecutó. Usa la Opción 2 del script manual.

### "No veo la versión en el footer"
→ El archivo `index.html` no se actualizó en el servidor.

### "Aparece error en consola"
→ Copia el error completo y revisa la sintaxis del script.
