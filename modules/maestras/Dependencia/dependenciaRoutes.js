import express from 'express';import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateDependencia, validateGetDependencia } from './dependenciaValidator.js';
import { createDependencia, deleteDependencia, getDependencias, getDependencia, updateDependencia } from './dependenciaController.js';


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getDependencias)
router.get('/:id', apiAuth, validateGetDependencia,  getDependencia)
router.post('/create', apiAuth, validateCreateDependencia, createDependencia)
router.put('/:id', apiAuth,validateGetDependencia,  updateDependencia)
router.delete('/delete/:id',  apiAuth, deleteDependencia)


// hola

export default router
