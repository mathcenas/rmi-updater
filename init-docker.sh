#!/bin/bash

echo "🚀 Inicializando Sistema RMI con Docker..."
echo ""

# Crear directorio de datos si no existe
if [ ! -d "./data" ]; then
    echo "📁 Creando directorio de datos..."
    mkdir -p ./data
fi

# Crear directorio de logs si no existe
if [ ! -d "./logs" ]; then
    echo "📁 Creando directorio de logs..."
    mkdir -p ./logs
fi

# Verificar si existe el archivo de datos
if [ ! -f "./data/rmi-data.json" ]; then
    echo "📝 Creando archivo de datos inicial..."
    if [ -f "./data/rmi-data-template.json" ]; then
        # Copiar desde la plantilla si existe
        cp ./data/rmi-data-template.json ./data/rmi-data.json
        echo "   ✓ Copiado desde plantilla (8 usuarios, 147 clientes)"
    else
        echo "   ⚠ Plantilla no encontrada, creando datos mínimos..."
        echo "   ℹ Para cargar todos los datos, ejecutá primero el sistema una vez"
    fi
else
    echo "✓ Archivo de datos ya existe"
    # Mostrar resumen de datos
    USERS=$(grep -o '"nombre"' ./data/rmi-data.json | wc -l)
    CLIENTES=$(grep -o '"ficha"' ./data/rmi-data.json | wc -l)
    echo "  - Usuarios detectados: $USERS"
    echo "  - Clientes detectados: $CLIENTES"
fi

# Ajustar permisos
echo "🔐 Ajustando permisos..."
chmod -R 755 ./data
chmod -R 755 ./logs

echo ""
echo "✅ Inicialización completa"
echo ""
echo "Para levantar el sistema, ejecutá:"
echo "  docker-compose up -d"
echo ""
echo "Para ver los logs:"
echo "  docker-compose logs -f"
echo ""
echo "Para detener el sistema:"
echo "  docker-compose down"
echo ""
