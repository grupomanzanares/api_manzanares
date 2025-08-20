import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateAuditoria, validateGetAuditoria } from './compraReportadaAuditoriaValidator.js';
import { createAuditoria, getAuditoriaByCompra } from './compraReportadaAuditoriaController.js';

const router = express.Router();

router.post('/create', apiAuth, validateCreateAuditoria, createAuditoria);
router.get('/:compraReportadaId', apiAuth, validateGetAuditoria, getAuditoriaByCompra);

export default router;


