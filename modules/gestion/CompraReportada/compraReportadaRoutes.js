import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateCompraReportada, validateGetCompraReportada, validateUpdateImpresion } from './compraReportadaValidator.js';
import { createCompraReportada, deleteCompraReportada, getComprasReportadas, getCompraReportada, updateCompraReportada, bulkUpsertComprasReportadas, conciliarCompras, getComprasPorAutorizar, ejecutarEnvioCorreosProgramados, getMedicionesTiempo, getCentrosCostoPorResponsable, getResponsablesPorEmisor, updateCompraImpresion } from './compraReportadaController.js';
import upload from '../../../middleware/uploadPdf.js';
import uploadAdjAutorizador from '../../../middleware/uploadAdjAutorizador.js';


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getComprasReportadas)
router.get('/por-autorizar', apiAuth, getComprasPorAutorizar)
router.get('/mediciones-tiempo', apiAuth, getMedicionesTiempo)
router.get('/centros-costo-por-responsable', apiAuth, getCentrosCostoPorResponsable)
router.get('/responsables-por-emisor', apiAuth, getResponsablesPorEmisor)
router.get('/:id', apiAuth, validateGetCompraReportada,  getCompraReportada)
router.post('/create', apiAuth, validateCreateCompraReportada, createCompraReportada)

// Ruta para autorizador (solo adjuntos, sin PDF principal)
router.put(
    '/autorizar/:id',
    apiAuth,
    uploadAdjAutorizador.array('adjuntos', 10),  // Solo adjuntos, hasta 10 archivos
    validateGetCompraReportada,
    updateCompraReportada
);

// Ruta para marcar impresión (solo campos: impreso, fechaImpresion, userMod)
router.put(
    '/impresion/:id',
    apiAuth,
    upload.none(),
    validateUpdateImpresion,
    updateCompraImpresion
);

// Ruta para actualización simple con solo PDF principal
router.put(
    '/:id',
    apiAuth,
    upload.single('archivo'),
    validateGetCompraReportada,
    updateCompraReportada
);

router.delete('/delete/:id',  apiAuth, deleteCompraReportada)
router.post('/bulk-upsert', apiAuth, bulkUpsertComprasReportadas);
router.post("/conciliar", apiAuth, conciliarCompras);
router.post("/enviar-correos-programados", apiAuth, ejecutarEnvioCorreosProgramados);

export default router
