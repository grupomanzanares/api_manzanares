import { Router } from 'express';
import { getAutorizaciones, getAutorizacion, crearAutorizacion, actualizarAutorizacion, eliminarAutorizacion } from './matrizAutorizacionesController.js';
import { validarCrearAutorizacion, validarActualizarAutorizacion } from './matrizAutorizacionesValidator.js';
import { apiAuth } from '../../../auth/middleware/apiauth.js';

const router = Router();

// Rutas para las autorizaciones
router.get('/', apiAuth, getAutorizaciones);
router.get('/:id', apiAuth, getAutorizacion);
router.post('/', apiAuth, validarCrearAutorizacion, crearAutorizacion);
router.put('/:id', apiAuth, validarActualizarAutorizacion, actualizarAutorizacion);
router.delete('/:id', apiAuth, eliminarAutorizacion);

export default router; 