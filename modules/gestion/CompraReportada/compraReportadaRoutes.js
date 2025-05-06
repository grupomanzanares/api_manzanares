import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateCompraReportada, validateGetCompraReportada } from './compraReportadaValidator.js';
import { createCompraReportada, deleteCompraReportada, getComprasReportadas, getCompraReportada, updateCompraReportada, bulkUpsertComprasReportadas, conciliarCompras } from './compraReportadaController.js';
import upload from '../../../middleware/uploadPdf.js';


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getComprasReportadas)
router.get('/:id', apiAuth, validateGetCompraReportada,  getCompraReportada)
router.post('/create', apiAuth, validateCreateCompraReportada, createCompraReportada)
router.put('/:id', apiAuth,upload.single('archivo') ,validateGetCompraReportada,  updateCompraReportada)
router.delete('/delete/:id',  apiAuth, deleteCompraReportada)
router.post('/bulk-upsert', apiAuth, bulkUpsertComprasReportadas);
router.post("/conciliar", apiAuth, conciliarCompras);


// hola

export default router
