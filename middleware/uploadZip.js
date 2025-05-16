import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        // Usar el nombre original del archivo
        cb(null, file.originalname);
    }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos ZIP'), false);
    }
};

const uploadZip = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // Límite de 50MB para archivos ZIP
    }
});

export default uploadZip 