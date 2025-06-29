import 'dotenv/config';
import cron from 'node-cron';
import db from './config/db.js';
import { syncronizarMaestrasYeminus } from "./modules/maestras/syncService.js";
try {
        await db.authenticate();
        await db.sync(); // si quieres reflejar modelos actualizados
        console.log('✅ Conectado a la base de datos correctamente.');
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error);
        process.exit(1);
    }

    async function ejecutarSincronizacion() {
            try {
                console.log(`[${new Date().toISOString()}] ⏳ Ejecutando sincronización de centros de costos...`);
                await syncronizarMaestrasYeminus();
                console.log(`[${new Date().toISOString()}] ✅ Sincronización completada`);
                } catch (err) {
                    console.error(`[${new Date().toISOString()}] ❌ Error durante sincronización:`, err);
                }
    }

    // Cron: cada 1 hora (puedes ajustar la expresión)
    cron.schedule('0 * * * *', () => {
        ejecutarSincronizacion();
});

// Ejecutar inmediatamente una vez al iniciar
ejecutarSincronizacion();