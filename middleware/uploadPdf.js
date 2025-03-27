import multer from 'multer'
import path from 'path'






// Extensiones permitidas
const allowedExtensions = ['.pdf'];


const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){

        // Asegurarse de que emisor y numero existen
        const emisor = req.body?.emisor || req.query?.emisor || 'SIN_EMISOR';
        const numero = req.body?.numero || req.query?.numero || 'SIN_NUMERO';

        if (!emisor || !numero) {
            return cb(new Error('Faltan datos del emisor o número'), null);
        }

        const Id = req.body.emisor + req.body.numero;
        if (!Id) {
            return cb(new Error('Falta identificación para el archivo'), null);
        }
        console.log("filename", file)
        const fileName = `${Id}${path.extname(file.originalname)}`;

        cb(null, fileName);
    }
})
// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    console.log("file",file)
    const allowedExtensions = ['.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no válido'), false);
    }
};


const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // Límite de 5MB
    }
})

export default upload



