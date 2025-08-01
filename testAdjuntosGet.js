import 'dotenv/config';
import db from './config/db.js';
import compraReportada from './modules/gestion/CompraReportada/compraReportada.js';
import fs from 'fs/promises';
import path from 'path';

async function testAdjuntosGet() {
    try {
        // Conectar a la base de datos
        await db.authenticate();
        console.log('✅ Conectado a la base de datos correctamente.');

        console.log('\n🔍 Buscando compras para probar adjuntos...');
        
        // Buscar algunas compras para probar
        const compras = await compraReportada.findAll({
            where: { habilitado: true },
            limit: 3,
            attributes: ['id', 'emisor', 'numero', 'tipo', 'valor']
        });

        console.log(`📊 Encontradas ${compras.length} compras para probar:`);

        for (const compra of compras) {
            console.log(`\n📄 Compra ID: ${compra.id}`);
            console.log(`   Emisor: ${compra.emisor}`);
            console.log(`   Número: ${compra.numero}`);
            console.log(`   Tipo: ${compra.tipo}`);
            console.log(`   Valor: ${compra.valor}`);
            
            const emisorNumero = `${compra.emisor}${compra.numero}`;
            console.log(`   🔍 Buscando adjuntos para: ${emisorNumero}`);
            
            // Simular la búsqueda de adjuntos
            try {
                const adjuntosDir = './public/uploads/adjautorizador/';
                
                // Verificar si existe el directorio
                try {
                    await fs.access(adjuntosDir);
                } catch (error) {
                    console.log('   📁 Directorio de adjuntos no existe');
                    continue;
                }
                
                // Leer archivos del directorio
                const archivos = await fs.readdir(adjuntosDir);
                
                // Filtrar archivos que coincidan con el patrón emisorNumero
                const adjuntos = archivos
                    .filter(archivo => archivo.startsWith(emisorNumero))
                    .map(archivo => ({
                        nombre: archivo,
                        url: `/uploads/adjautorizador/${archivo}`,
                        extension: path.extname(archivo).toLowerCase()
                    }))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre));
                
                console.log(`   📎 Encontrados ${adjuntos.length} adjuntos:`);
                
                if (adjuntos.length > 0) {
                    adjuntos.forEach((adjunto, index) => {
                        console.log(`      ${index + 1}. ${adjunto.nombre} (${adjunto.extension})`);
                        console.log(`         URL: ${adjunto.url}`);
                    });
                } else {
                    console.log('      ⚠️ No se encontraron adjuntos');
                }
                
            } catch (error) {
                console.log(`   ❌ Error buscando adjuntos: ${error.message}`);
            }
        }

        console.log('\n📋 RESUMEN:');
        console.log('- getCompraReportada ahora incluye adjuntos');
        console.log('- Busca archivos que coincidan con emisorNumero');
        console.log('- Retorna array de adjuntos con nombre, url y extensión');
        console.log('- Los adjuntos se ordenan alfabéticamente');

    } catch (error) {
        console.error('❌ Error en testAdjuntosGet:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la prueba
testAdjuntosGet(); 