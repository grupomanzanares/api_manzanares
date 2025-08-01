import 'dotenv/config';
import db from './config/db.js';
import { matrizAutorizaciones, User } from './modules/gestion/gestionRelations.js';

async function testExclusionJefes() {
    try {
        // Conectar a la base de datos
        await db.authenticate();
        console.log('✅ Conectado a la base de datos correctamente.');

        console.log('\n🔍 Verificando matriz de autorizaciones...');
        
        // Buscar todas las autorizaciones
        const autorizaciones = await matrizAutorizaciones.findAll({
            include: [{
                model: User,
                as: 'responsable',
                attributes: ['id', 'name', 'email']
            }]
        });

        console.log(`📊 Total de autorizaciones encontradas: ${autorizaciones.length}`);

        // Agrupar por responsable
        const resumen = {};
        autorizaciones.forEach(auth => {
            if (auth.responsable) {
                const responsableId = auth.responsable.id;
                if (!resumen[responsableId]) {
                    resumen[responsableId] = {
                        id: responsableId,
                        name: auth.responsable.name,
                        email: auth.responsable.email,
                        autorizaciones: []
                    };
                }
                resumen[responsableId].autorizaciones.push({
                    empresa: auth.empresa,
                    emisor: auth.emisor
                });
            }
        });

        console.log('\n👥 Responsables en matriz de autorizaciones:');
        Object.values(resumen).forEach(responsable => {
            const esJefe = responsable.id === 22 || responsable.id === 23;
            const estado = esJefe ? '❌ JEFE (NO asignación automática)' : '✅ NORMAL (SÍ asignación automática)';
            
            console.log(`\n${estado}`);
            console.log(`  ID: ${responsable.id}`);
            console.log(`  Nombre: ${responsable.name}`);
            console.log(`  Email: ${responsable.email}`);
            console.log(`  Autorizaciones: ${responsable.autorizaciones.length}`);
            
            responsable.autorizaciones.forEach(auth => {
                console.log(`    - ${auth.empresa} | ${auth.emisor}`);
            });
        });

        // Simular la lógica de asignación
        console.log('\n🧪 SIMULANDO LÓGICA DE ASIGNACIÓN:');
        
        Object.values(resumen).forEach(responsable => {
            const responsableId = responsable.id;
            
            if (responsableId !== 22 && responsableId !== 23) {
                console.log(`✅ Asignación automática a responsable ID: ${responsableId} (${responsable.name})`);
            } else {
                console.log(`⚠️ Omitiendo asignación automática para jefe ID: ${responsableId} (${responsable.name})`);
            }
        });

        console.log('\n📋 RESUMEN:');
        console.log('- Los jefes (IDs 22 y 23) NO recibirán asignaciones automáticas');
        console.log('- Los demás responsables SÍ recibirán asignaciones automáticas');
        console.log('- Los registros sin asignación automática quedarán pendientes de asignación manual');

    } catch (error) {
        console.error('❌ Error en testExclusionJefes:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la prueba
testExclusionJefes(); 