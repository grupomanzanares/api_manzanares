import express from 'express';
import { getPendingMessages } from './lotteryParticipationsController.js';

const router = express.Router();

// GET - Obtener registros que NO han recibido mensaje (message = 0)
router.get('/pending', getPendingMessages);

// Ruta principal para mostrar información
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API LotteryParticipations - Endpoint para consultar mensajes pendientes',
        endpoint: '/api_comercial/lottery-participations/pending',
        description: 'Obtiene todos los registros donde message = 0 (no enviados)'
    });
});

export default router;
