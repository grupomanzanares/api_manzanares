import LotteryParticipation from './lotteryParticipations.js';

// GET - Obtener registros que NO han recibido mensaje (message = false)
export const getPendingMessages = async (req, res) => {
    try {
        console.log('🔍 Buscando registros con message = false...');
        
        // Consulta usando el modelo Sequelize
        const pendingRecords = await LotteryParticipation.findAll({
            where: {
                message: false  // En tu modelo message es BOOLEAN, no INTEGER
            },
            order: [
                ['date', 'ASC'] // Ordenar por fecha, los más antiguos primero
            ]
        });

        console.log(`✅ Encontrados ${pendingRecords.length} registros pendientes`);

        res.json({
            success: true,
            message: 'Registros pendientes de envío obtenidos correctamente',
            total: pendingRecords.length,
            data: pendingRecords
        });

    } catch (error) {
        console.error('❌ Error al obtener registros pendientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al consultar la base de datos',
            error: error.message
        });
    }
};
