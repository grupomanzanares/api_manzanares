import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../config/db.js';
import compraReportada from '../modules/gestion/CompraReportada/compraReportada.js';

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
    filename: async function (req, file, cb) {
        try {
            // Obtener el ID de la URL
            const id = req.params.id;
            
            if (!id) {
                return cb(new Error('ID no encontrado en la URL'), null);
            }

            // Consultar la base de datos para obtener emisor y numero
            const compra = await compraReportada.findByPk(id);
            
            if (!compra) {
                return cb(new Error(`No se encontró la compra con ID: ${id}`), null);
            }

            const emisor = compra.emisor;
            const numero = compra.numero;

            console.log(`📄 Consultando compra ID: ${id} - Emisor: ${emisor}, Número: ${numero}`);

            // Buscar archivos existentes para este emisor y numero
            const dest = './public/uploads/adjautorizador/';
            const baseName = `${emisor}${numero}`;
            let consecutivo = 1;
            if (fs.existsSync(dest)) {
                const files = fs.readdirSync(dest).filter(f => f.startsWith(baseName));
                consecutivo = files.length + 1;
            }
            const ext = path.extname(file.originalname).toLowerCase();
            const fileName = `${baseName}-${consecutivo}${ext}`;
            
            console.log(`💾 Guardando archivo: ${fileName}`);
            cb(null, fileName);
            
        } catch (error) {
            console.error('❌ Error consultando base de datos:', error);
            cb(new Error(`Error consultando base de datos: ${error.message}`), null);
        }
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



