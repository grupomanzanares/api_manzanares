import express from 'express';import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { bulkUpsertRegistrosDian, createRegistroDian, deleteRegistroDian, getRegistroDian, getRegistrosDian, updateRegistroDian } from './registroDianController.js';
import { validateCreateRegistroDian, validateGetRegistroDian } from './registroDianValidator.js';


const router = express.Router();

router.get('/', apiAuth, getRegistrosDian)
router.get('/:id', apiAuth, validateGetRegistroDian,  getRegistroDian)
router.post('/create', apiAuth, validateCreateRegistroDian, createRegistroDian)
router.put('/:id', apiAuth, validateGetRegistroDian,  updateRegistroDian)
router.delete('/delete/:id',  apiAuth, deleteRegistroDian)
router.post('/bulk-upsert', apiAuth, bulkUpsertRegistrosDian);



export default router
