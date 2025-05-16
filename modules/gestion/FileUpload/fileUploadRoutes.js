import express from 'express';
import { apiAuth } from '../../../auth/middleware/apiauth.js';
import { uploadZipFile } from './fileUploadController.js';
import uploadZip from '../../../middleware/uploadZip.js';

const router = express.Router();

// Ruta para subir archivos ZIP
router.post('/upload-zip', apiAuth, uploadZip.single('archivo'), uploadZipFile);

export default router; 