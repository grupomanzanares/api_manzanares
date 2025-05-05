import express from "express";
import { apiAuth } from "../../../auth/middleware/apiauth";
import { createUnidadEmpaque, deleteUnidadEmpaque, getUnidadEmpaques, updateUnidadEmpaque } from "./unidadempaqueController";
import { validateCreateUniidadEmpaque, validateGetUnidadEmpaque } from "./unidadempaqueValidator";

const router = express.Router()

router.get('/', apiAuth, getUnidadEmpaques)
router.get('/:codigo', apiAuth, validateGetUnidadEmpaque)
router.post('/create', apiAuth, validateCreateUniidadEmpaque, createUnidadEmpaque)
router.put('/:codigo', apiAuth, validateGetUnidadEmpaque, updateUnidadEmpaque)
router.delete('/delete/:codigo', apiAuth, deleteUnidadEmpaque)