import express from 'express';import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateCompraReportada, validateGetCompraReportada } from './compraReportadaValidator.js';
import { createCompraReportada, deleteCompraReportada, getComprasReportadas, getCompraReportada, updateCompraReportada, bulkUpsertComprasReportadas } from './compraReportadaController.js';


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getComprasReportadas)
router.get('/:id', apiAuth, validateGetCompraReportada,  getCompraReportada)
router.post('/create', apiAuth, validateCreateCompraReportada, createCompraReportada)
router.put('/:id', apiAuth,validateGetCompraReportada,  updateCompraReportada)
router.delete('/delete/:id',  apiAuth, deleteCompraReportada)
router.post('/bulk-upsert', apiAuth, bulkUpsertComprasReportadas);


// hola

export default router
