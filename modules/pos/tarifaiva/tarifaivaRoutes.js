import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth';
import { createTarifaIva, deleteTarifaIva, getTarifaIva, getTarifasIva, updateTarifaIva } from './tarifaivaController';
import { validateCreateTarifaIva, validateGetTarifaIva } from './tarifaivaValidator';

const router = express.Router()

router.get('/', apiAuth, getTarifasIva)
router.get('/:codigo', apiAuth, validateGetTarifaIva, getTarifaIva)
router.post('/create', apiAuth, validateCreateTarifaIva, createTarifaIva)
router.put('/:codigo', apiAuth, validateGetTarifaIva, updateTarifaIva)
router.delete('/delete/:codigo', apiAuth, deleteTarifaIva)