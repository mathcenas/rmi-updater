const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'rmi-data.json');

// Trust proxy - importante para Nginx Proxy Manager
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Asegurar que existe el directorio de datos
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Inicializar base de datos si no existe
function initDB() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            users: [
                { id: 1, nombre: "Leo", email: "lrodriguez@rmiconsultores.com", password: "123", rol: "Socio", activo: true },
                { id: 2, nombre: "Ana", email: "amartinez@rmiconsultores.com", password: "123", rol: "Socia", activo: true },
                { id: 3, nombre: "Camila", email: "ctorres@rmiconsultores.com", password: "123", rol: "Supervisor", activo: true },
                { id: 4, nombre: "Mónica", email: "msilva@rmiconsultores.com", password: "123", rol: "Supervisor", activo: true },
                { id: 5, nombre: "Carlos", email: "cgarcia@rmiconsultores.com", password: "123", rol: "Auxiliar", activo: true },
                { id: 6, nombre: "Laura", email: "lfernandez@rmiconsultores.com", password: "123", rol: "Auxiliar", activo: true },
                { id: 7, nombre: "Pedro", email: "promero@rmiconsultores.com", password: "123", rol: "Auxiliar", activo: true },
                { id: 8, nombre: "Nicole", email: "nmedina@rmiconsultores.com", password: "123", rol: "Auxiliar", activo: true }
            ],
            clientes: [
                { id: 999, nombre: "GENERAL", estado: "Activo", ficha: "F999", servicios: { contabilidad: false, sueldos: false, impuestos: false }, socioId: 1, supervisorId: 1, auxiliarId: 5 }
            ],
            tareas: [],
            auditoria: []
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('✓ Base de datos inicializada');
    }
}

// Leer datos
function readDB() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo base de datos:', error);
        return { users: [], clientes: [], tareas: [], auditoria: [] };
    }
}

// Escribir datos
function writeDB(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error escribiendo base de datos:', error);
        return false;
    }
}

// API Endpoints

// GET - Obtener todos los datos
app.get('/api/data', (req, res) => {
    const data = readDB();
    res.json(data);
});

// GET - Obtener colección específica
app.get('/api/:collection', (req, res) => {
    const { collection } = req.params;
    const data = readDB();

    if (data[collection]) {
        res.json(data[collection]);
    } else {
        res.status(404).json({ error: 'Colección no encontrada' });
    }
});

// Colecciones críticas que no pueden sobreescribirse con array vacío si ya tienen datos
const PROTECTED_COLLECTIONS = ['tareas', 'auditoria'];

function isDestructiveWipe(collection, newData, existingData) {
    return PROTECTED_COLLECTIONS.includes(collection)
        && Array.isArray(newData)
        && newData.length === 0
        && Array.isArray(existingData[collection])
        && existingData[collection].length > 0;
}

// POST - Actualizar colección completa
app.post('/api/:collection', (req, res) => {
    const { collection } = req.params;
    const newData = req.body;

    const data = readDB();

    if (isDestructiveWipe(collection, newData, data)) {
        console.warn(`[BLOQUEADO] Intento de vaciar '${collection}' (${data[collection].length} registros protegidos)`);
        return res.status(400).json({ error: `No se puede vaciar la colección '${collection}' que ya contiene datos` });
    }

    data[collection] = newData;

    if (writeDB(data)) {
        res.json({ success: true, data: data[collection] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// POST - Actualizar múltiples colecciones
app.post('/api/batch', (req, res) => {
    const updates = req.body;
    const data = readDB();

    let blocked = false;
    Object.keys(updates).forEach(collection => {
        if (isDestructiveWipe(collection, updates[collection], data)) {
            console.warn(`[BLOQUEADO] Batch: intento de vaciar '${collection}' (${data[collection].length} registros protegidos)`);
            blocked = true;
            return;
        }
        data[collection] = updates[collection];
    });

    if (blocked) {
        return res.status(400).json({ error: "No se puede vaciar una colección que ya contiene datos" });
    }

    if (writeDB(data)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// POST - Respaldo
app.post('/api/backup', (req, res) => {
    const data = readDB();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(__dirname, 'data', `backup-${timestamp}.json`);

    try {
        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
        res.json({ success: true, file: `backup-${timestamp}.json` });
    } catch (error) {
        res.status(500).json({ error: 'Error creando respaldo' });
    }
});

// GET - Descargar respaldo
app.get('/api/backup/download', (req, res) => {
    const data = readDB();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=rmi-backup-${timestamp}.json`);
    res.send(JSON.stringify(data, null, 2));
});

// POST - Restaurar desde respaldo
app.post('/api/restore', (req, res) => {
    const backupData = req.body;

    if (writeDB(backupData)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Error restaurando datos' });
    }
});

// POST - Importar clientes desde CSV o JSON
app.post('/api/clientes/import', (req, res) => {
    const { data: clientesImportados, formato } = req.body;

    if (!clientesImportados || !Array.isArray(clientesImportados)) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    const db = readDB();
    const existentes = db.clientes || [];

    // Obtener el ID más alto
    const maxId = existentes.length > 0 ? Math.max(...existentes.map(c => c.id)) : 0;

    // Procesar clientes importados
    const nuevosClientes = clientesImportados.map((cliente, index) => {
        // Validar campos obligatorios
        if (!cliente.nombre) {
            throw new Error(`Cliente en línea ${index + 1} no tiene nombre`);
        }

        return {
            id: maxId + index + 1,
            nombre: cliente.nombre.trim(),
            estado: cliente.estado || 'Activo',
            ficha: cliente.ficha || `F${maxId + index + 1}`,
            servicios: {
                contabilidad: cliente.contabilidad === true || cliente.contabilidad === 'true' || cliente.contabilidad === '1',
                sueldos: cliente.sueldos === true || cliente.sueldos === 'true' || cliente.sueldos === '1',
                impuestos: cliente.impuestos === true || cliente.impuestos === 'true' || cliente.impuestos === '1'
            },
            socioId: parseInt(cliente.socioId) || 1,
            supervisorId: parseInt(cliente.supervisorId) || 1,
            auxiliarId: parseInt(cliente.auxiliarId) || 5
        };
    });

    // Agregar nuevos clientes
    db.clientes = [...existentes, ...nuevosClientes];

    if (writeDB(db)) {
        res.json({
            success: true,
            importados: nuevosClientes.length,
            clientes: db.clientes
        });
    } else {
        res.status(500).json({ error: 'Error guardando clientes' });
    }
});

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar y arrancar servidor
initDB();

app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('🚀 Servidor RMI iniciado correctamente');
    console.log('========================================');
    console.log(`📍 URL Local: http://localhost:${PORT}`);
    console.log(`📍 URL Red: http://[IP-SERVIDOR]:${PORT}`);
    console.log(`💾 Datos en: ${DATA_FILE}`);
    console.log('========================================');
    console.log('✓ Sistema listo para usar');
    console.log('========================================');
});

// Ignorar errores de conexion abortada (cliente cierra antes de que el servidor responda)
app.use((err, req, res, next) => {
    if (err.type === 'request.aborted' || err.message === 'request aborted') return;
    console.error('Error en request:', err.message);
    res.status(500).json({ error: 'Error interno' });
});

// Manejo de errores
process.on('uncaughtException', (error) => {
    if (error.message === 'request aborted') return;
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Promesa rechazada:', error);
});
