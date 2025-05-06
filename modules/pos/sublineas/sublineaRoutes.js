import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth';
import { createSubLineas, deleteSubLineas, getSubLinea, getSubLineas, updateSubLineas } from './sublineaController';
import { validateCreateSublinea, validateGetSublinea } from './sublineaValidator';

const router = express.Router()

router.get('/', apiAuth, getSubLineas)
router.get('/:codigo', apiAuth, validateGetSubline, getSubLinea)
router.post('/create', apiAuth, validateCreateSublinea, createSubLineas)
router.put('/:codigo', apiAuth, validateGetSublinea, updateSubLineas)
router.delete('/delete/:codigo', apiAuth, deleteSubLineas)