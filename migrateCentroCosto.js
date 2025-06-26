import db from './config/db.js';

const migrateCentroCosto = async () => {
    try {
        console.log('Iniciando migración de CentroDeCosto...');
        
        // Paso 1: Crear columna temporal
        await db.query(`
            ALTER TABLE compras_reportadas_detalle 
            ADD COLUMN CentroDeCosto_temp VARCHAR(20) NULL
        `);
        console.log('✓ Columna temporal creada');
        
        // Paso 2: Copiar y convertir datos
        await db.query(`
            UPDATE compras_reportadas_detalle 
            SET CentroDeCosto_temp = CAST(CentroDeCosto AS CHAR) 
            WHERE CentroDeCosto IS NOT NULL
        `);
        console.log('✓ Datos copiados y convertidos');
        
        // Paso 3: Eliminar columna original
        await db.query(`
            ALTER TABLE compras_reportadas_detalle 
            DROP COLUMN CentroDeCosto
        `);
        console.log('✓ Columna original eliminada');
        
        // Paso 4: Renombrar columna temporal
        await db.query(`
            ALTER TABLE compras_reportadas_detalle 
            CHANGE CentroDeCosto_temp CentroDeCosto VARCHAR(20) NULL
        `);
        console.log('✓ Columna renombrada');
        
        // Verificar migración
        const [result] = await db.query(`
            SELECT COUNT(*) as total_registros, 
                   COUNT(CentroDeCosto) as registros_con_centro_costo
            FROM compras_reportadas_detalle
        `);
        
        console.log('✓ Migración completada exitosamente');
        console.log('Resultados:', result[0]);
        
        await db.close();
        
    } catch (error) {
        console.error('Error en migración:', error);
        await db.close();
        process.exit(1);
    }
};

// Ejecutar migración
migrateCentroCosto(); 