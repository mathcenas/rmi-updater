# Migración Manual de Seguridad v1.1.0

## Problema
Los cambios de seguridad no se reflejan porque el navegador usa datos antiguos en localStorage.

## Solución 1: Forzar Migración (RECOMENDADO)

Abre la consola del navegador (F12) y ejecuta este código:

```javascript
// Migración de seguridad - Ejecutar en consola del navegador
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

    // Hashear contraseñas existentes
    for (let usuario of usuarios) {
        if (!esHash(usuario.password)) {
            const passwordOriginal = usuario.password;
            usuario.password = await hashPassword(passwordOriginal);
            console.log(`[MIGRACION] Password hasheado para: ${usuario.email}`);
        }
    }

    // Agregar SysAdmin si no existe
    const sysAdminExiste = usuarios.find(u => u.email === 'sysadmin@rmiconsultores.com');
    if (!sysAdminExiste) {
        const sysAdminPassword = await hashPassword('rmi2026');
        usuarios.push({
            id: 99,
            nombre: 'SysAdmin',
            email: 'sysadmin@rmiconsultores.com',
            password: sysAdminPassword,
            rol: 'SysAdmin',
            activo: true
        });
        console.log('[MIGRACION] Usuario SysAdmin creado');
    }

    localStorage.setItem('users', JSON.stringify(usuarios));
    localStorage.setItem('migracion_seguridad', '1.1.0');

    console.log('[MIGRACION] Completada. Recargando página...');
    setTimeout(() => location.reload(), 1000);
})();
```

## Solución 2: Limpiar y Reiniciar

Si prefieres empezar de cero:

1. Abre la consola del navegador (F12)
2. Ejecuta: `localStorage.clear()`
3. Recarga la página (F5)
4. Los datos se volverán a cargar con las contraseñas hasheadas

## Credenciales Después de la Migración

Las credenciales **NO CAMBIAN** para los usuarios:

- **Usuarios regulares:** sigue siendo `123`
- **SysAdmin:** `rmi2026`

Solo que ahora están hasheadas en el almacenamiento.

## Verificar que Funcionó

Después de ejecutar la migración:

1. Recarga la página
2. Cierra sesión
3. Intenta login con:
   - Email: `sysadmin@rmiconsultores.com`
   - Password: `rmi2026`
4. Deberías ver la opción "Backup/Import" en el menú lateral
5. En el footer del menú verás: v1.1.0 y la fecha del build
