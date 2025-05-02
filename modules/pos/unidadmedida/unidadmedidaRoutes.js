import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth';
import { createUnidadmedida, deleteUnidadmedida, getUnidadesmedida, getUnidadmedida, updateUnidadmedida } from './unidadmedidaController';
import { validateCreateUnidadMedida, validateGetUnidadMedida } from './unidadmedidaValidator';

const router = express.Router()

router.get('/', apiAuth, getUnidadesmedida)
router.get('/:codigo', apiAuth, validateGetUnidadMedida, getUnidadmedida)
router.post('/create', apiAuth, validateCreateUnidadMedida, createUnidadmedida)
router.put('/:codigo', apiAuth, validateGetUnidadMedida, updateUnidadmedida)
router.delete('/delete/:codigo', apiAuth, deleteUnidadmedida)