import express from "express";
import { apiAuth } from "../../../auth/middleware/apiauth";
import { createLineas, deleteLineas, getLinea, getLineas, updateLineas } from "./lineasController";
import { validateCreateLinea, validateGetLinea } from "./lineasValidator";

const router = express.Router()

router.get('/', apiAuth, getLineas)
router.get('/:codigo', apiAuth, validateGetLinea, getLinea)
router.post('/create', apiAuth, validateCreateLinea, createLineas)
router.put('/:codigo', apiAuth, validateGetLinea, updateLineas)
router.delete('/delete/:codigo', apiAuth, deleteLineas)