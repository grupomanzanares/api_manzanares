import express from 'express';import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateComprasEstado, validateGetComprasEstado } from './comprasEstadoValidator.js';
import { createComprasEstado, deleteComprasEstado, getComprasEstados, getComprasEstado, updateComprasEstado } from './comprasEstadoController.js';


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getComprasEstados)
router.get('/:id', apiAuth, validateGetComprasEstado,  getComprasEstado)
router.post('/create', apiAuth, validateCreateComprasEstado, createComprasEstado)
router.put('/:id', apiAuth,validateGetComprasEstado,  updateComprasEstado)
router.delete('/delete/:id',  apiAuth, deleteComprasEstado)




export default router
