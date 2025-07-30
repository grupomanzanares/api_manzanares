import 'dotenv/config';
import { emailRecordatorioComprasPorAutorizar } from './helpers/emails.js';

async function testMensajes() {
    console.log('🧪 Probando mensajes especiales en correos...');
    
    try {
        // Simular datos de prueba
        const datosPrueba = {
            correoResponsable: 'test@gmanzanares.com.co',
            nombreResponsable: 'Usuario de Prueba',
            CantidadFacturasPendientes: 5
        };

        console.log('\n📧 Probando correo con mensaje de penúltimo día hábil...');
        await emailRecordatorioComprasPorAutorizar({
            ...datosPrueba,
            mensajeEspecial: 'Hoy es penúltimo día hábil del mes, es necesario que todos los documentos queden autorizados.'
        });

        console.log('\n📧 Probando correo con mensaje de primer día hábil...');
        await emailRecordatorioComprasPorAutorizar({
            ...datosPrueba,
            mensajeEspecial: 'Hoy es primer día hábil del nuevo mes, necesitamos que todos los documentos del mes anterior queden autorizados y procesados.'
        });

        console.log('\n📧 Probando correo sin mensaje especial...');
        await emailRecordatorioComprasPorAutorizar({
            ...datosPrueba
        });

        console.log('\n✅ Todas las pruebas completadas');
        
    } catch (error) {
        console.error('❌ Error en testMensajes:', error);
    } finally {
        process.exit(0);
    }
}

testMensajes(); 