import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth';
import { createGrupos, deleteGrupo, getGrupo, getGrupos, updateGrupo } from './grupoController';
import { validateCreateGrupo, validateGetGrupo } from './grupoValidator';

const router = express.Router();

router.get('/', apiAuth, getGrupos)
router.get('/:codigo', apiAuth, validateGetGrupo, getGrupo)
router.post('/create', apiAuth, validateCreateGrupo, createGrupos)
router.put('/:codigo', apiAuth, validateGetGrupo, updateGrupo)
router.delete('/delete/:codigo', apiAuth, deleteGrupo)