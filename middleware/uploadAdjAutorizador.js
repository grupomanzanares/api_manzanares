import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Extensiones permitidas
const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx', '.xls'];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = './public/uploads/adjautorizador/';
        // Crear la carpeta si no existe
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        // Obtener emisor y numero
        const emisor = req.body?.emisor || req.query?.emisor || 'SIN_EMISOR';
        const numero = req.body?.numero || req.query?.numero || 'SIN_NUMERO';
        if (!emisor || !numero) {
            return cb(new Error('Faltan datos del emisor o número'), null);
        }
        // Buscar archivos existentes para este emisor y numero
        const dest = './public/uploads/adjautorizador/';
        const baseName = `${emisor}-${numero}`;
        let consecutivo = 1;
        if (fs.existsSync(dest)) {
            const files = fs.readdirSync(dest).filter(f => f.startsWith(baseName));
            consecutivo = files.length + 1;
        }
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = `${baseName}-${consecutivo}${ext}`;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no válido'), false);
    }
};

const uploadAdjAutorizador = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por archivo
        files: 10 // máximo 10 archivos por request
    }
});

export default uploadAdjAutorizador;



