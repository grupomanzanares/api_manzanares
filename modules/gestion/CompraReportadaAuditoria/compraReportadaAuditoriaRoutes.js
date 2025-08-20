import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateAuditoria } from './compraReportadaAuditoriaValidator.js';
import { createAuditoria } from './compraReportadaAuditoriaController.js';

const router = express.Router();

router.post('/create', apiAuth, validateCreateAuditoria, createAuditoria);

export default router;


