import express from "express"

import { apiAuth } from '../middleware/apiauth.js'
import { createRol, deleteRol, getRol, getRoles } from "../controllers/rolController.js";
import { validateCreateRol, validateGetRol } from "../validators/rol.js";

const router = express.Router()

router.get('/', apiAuth, getRoles)
router.get('/:id', validateGetRol, apiAuth, getRol)
router.post('/create', validateCreateRol, apiAuth, createRol)
router.delete('/delete/:id', apiAuth, deleteRol)

export default router

