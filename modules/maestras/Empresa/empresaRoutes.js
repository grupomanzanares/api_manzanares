import express from 'express';import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateEmpresa, validateGetEmpresa } from './empresaValidator.js';
import { createEmpresa, deleteEmpresa, getEmpresas, getEmpresa, updateEmpresa } from './empresaController.js';


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getEmpresas)
router.get('/:id', apiAuth, validateGetEmpresa,  getEmpresa)
router.post('/create', apiAuth, validateCreateEmpresa, createEmpresa)
router.put('/:id', apiAuth,validateGetEmpresa,  updateEmpresa)
router.delete('/delete/:id',  apiAuth, deleteEmpresa)


// hola

export default router
