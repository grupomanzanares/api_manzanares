import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateAuditoria, validateGetAuditoria } from './compraReportadaAuditoriaValidator.js';
import { createAuditoria, getAuditoriaByCompra } from './compraReportadaAuditoriaController.js';
import upload from '../../../middleware/uploadPdf.js';

const router = express.Router();

// Aceptar multipart/form-data sin archivos
router.post('/create', apiAuth, validateCreateAuditoria, createAuditoria);
router.get('/:compraReportadaId', apiAuth, validateGetAuditoria, getAuditoriaByCompra);

export default router;


