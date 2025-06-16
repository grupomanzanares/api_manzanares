import express from 'express';import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { getProductos, getProducto } from './productoController.js';
 


//falta arreglar las validaciones...
const router = express.Router();

router.get('/', apiAuth, getProductos)

router.get('/por-nit/:nit', apiAuth,  getCcostoxNit);
router.get('/por-id/:id', apiAuth,  getProducto);
  

export default router
