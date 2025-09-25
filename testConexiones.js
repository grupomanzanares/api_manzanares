import { db, db2 } from './config/db.js';

async function testConnections() {
    console.log('🔄 Probando conexiones a las bases de datos...\n');
    
    try {
        // Probar conexión principal
        console.log('📊 Probando conexión a base de datos principal...');
        await db.authenticate();
        console.log('✅ Conexión principal: OK\n');
        
        // Probar conexión secundaria
        console.log('📊 Probando conexión a base de datos secundaria...');
        await db2.authenticate();
        console.log('✅ Conexión secundaria: OK\n');
        
        // Probar consulta simple en ambas
        console.log('🔍 Probando consultas...');
        
        // Consulta en DB principal
        const [results1] = await db.query('SELECT 1 as test');
        console.log('✅ Consulta en DB principal:', results1);
        
        // Consulta en DB secundaria
        const [results2] = await db2.query('SELECT 1 as test');
        console.log('✅ Consulta en DB secundaria:', results2);
        
        console.log('\n🎉 ¡Todas las conexiones funcionan correctamente!');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
    } finally {
        // Cerrar conexiones
        await db.close();
        await db2.close();
        console.log('🔒 Conexiones cerradas');
        process.exit(0);
    }
}

testConnections();
