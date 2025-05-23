import express from 'express';import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateCcosto, validateGetCcosto,validateGetCcostoxNit } from './ccostoValidator.js';
import { getCcostos, getCcosto, createCcosto , updateCcosto, deleteCcosto, getCcostoxNit } from './ccostoController.js';
 


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getCcostos)

router.get('/por-nit/:nit', apiAuth, validateGetCcostoxNit, getCcostoxNit);
router.get('/por-id/:id', apiAuth, validateGetCcosto, getCcosto);
  

router.post('/create', apiAuth, validateCreateCcosto, createCcosto)
router.put('/:id', apiAuth,validateGetCcosto,  updateCcosto)
router.delete('/delete/:id',  apiAuth, deleteCcosto)


// hola

export default router
