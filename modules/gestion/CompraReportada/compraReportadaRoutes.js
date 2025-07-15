import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateCompraReportada, validateGetCompraReportada } from './compraReportadaValidator.js';
import { createCompraReportada, deleteCompraReportada, getComprasReportadas, getCompraReportada, updateCompraReportada, bulkUpsertComprasReportadas, conciliarCompras, getComprasPorAutorizar } from './compraReportadaController.js';
import upload from '../../../middleware/uploadPdf.js';
import uploadAdjAutorizador from '../../../middleware/uploadAdjAutorizador.js';


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getComprasReportadas)
router.get('/por-autorizar', apiAuth, getComprasPorAutorizar)
router.get('/:id', apiAuth, validateGetCompraReportada,  getCompraReportada)
router.post('/create', apiAuth, validateCreateCompraReportada, createCompraReportada)
//router.put(
  //'/:id',
  //apiAuth,
  //uploadAdjAutorizador.fields([
   // { name: 'archivo', maxCount: 1 },
   // { name: 'adjuntos', maxCount: 10 }
  //]),
  //validateGetCompraReportada,
  //updateCompraReportada
//)
router.delete('/delete/:id',  apiAuth, deleteCompraReportada)
router.post('/bulk-upsert', apiAuth, bulkUpsertComprasReportadas);
router.post("/conciliar", apiAuth, conciliarCompras);

router.put('/:id', apiAuth,upload.single('archivo') ,validateGetCompraReportada,  updateCompraReportada)

export default router
