import express from 'express';import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateComprasTipo, validateGetComprasTipo } from './comprasTipoValidator.js';
import { createComprasTipo, deleteComprasTipo, getComprasTipo, getComprasTipos, updateComprasTipo } from './comprasTipoController.js';


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getComprasTipos)
router.get('/:id', apiAuth, validateGetComprasTipo,  getComprasTipo)
router.post('/create', apiAuth, validateCreateComprasTipo, createComprasTipo)
router.put('/:id', apiAuth,validateGetComprasTipo,  updateComprasTipo)
router.delete('/delete/:id',  apiAuth, deleteComprasTipo)


// hola

export default router
