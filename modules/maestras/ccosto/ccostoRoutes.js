import express from 'express';import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { validateCreateCcosto, validateGetCcosto,validateGetCcostoxNit } from './ccostoValidator.js';
import { getCcostos, getCcosto, createCcosto , updateCcosto, deleteCcosto, getCcostoxNit } from './ccostoController.js';
 


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getCcostos)

router.get('/', apiAuth, (req, res) => {
    const { id, nit } = req.query;
    if (id) return getCcosto(req, res);
    if (nit) return getCcostoxNit(req, res);
  });
  

router.post('/create', apiAuth, validateCreateCcosto, createCcosto)
router.put('/:id', apiAuth,validateGetCcosto,  updateCcosto)
router.delete('/delete/:id',  apiAuth, deleteCcosto)


// hola

export default router
