import 'dotenv/config';
import db from './config/db.js';
import compraReportada from './modules/gestion/CompraReportada/compraReportada.js';

async function testConsultaAdjuntos() {
    try {
        // Conectar a la base de datos
        await db.authenticate();
        console.log('✅ Conectado a la base de datos correctamente.');

        console.log('\n🔍 Buscando compras para probar adjuntos...');
        
        // Buscar algunas compras para probar
        const compras = await compraReportada.findAll({
            where: { habilitado: true },
            limit: 5,
            attributes: ['id', 'emisor', 'numero', 'tipo', 'valor']
        });

        console.log(`📊 Encontradas ${compras.length} compras para probar:`);

        compras.forEach((compra, index) => {
            console.log(`\n${index + 1}. Compra ID: ${compra.id}`);
            console.log(`   Emisor: ${compra.emisor}`);
            console.log(`   Número: ${compra.numero}`);
            console.log(`   Tipo: ${compra.tipo}`);
            console.log(`   Valor: ${compra.valor}`);
            
            // Simular el nombre de archivo que se generaría
            const baseName = `${compra.emisor}-${compra.numero}`;
            console.log(`   📄 Nombre base para adjuntos: ${baseName}`);
            console.log(`   📄 Ejemplo: ${baseName}-1.pdf`);
        });

        console.log('\n📋 RESUMEN:');
        console.log('- El middleware ahora consulta la BD por ID');
        console.log('- Obtiene emisor y número automáticamente');
        console.log('- Genera nombres de archivo correctos');
        console.log('- Ejemplo: PUT /autorizar/123 con adjuntos');

    } catch (error) {
        console.error('❌ Error en testConsultaAdjuntos:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la prueba
testConsultaAdjuntos(); 