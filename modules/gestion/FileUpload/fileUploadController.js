import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

export const uploadZipFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha proporcionado ningún archivo'
            });
        }

        // Procesar el archivo ZIP
        await processZipFile(req, res);

    } catch (error) {
        console.error('Error al procesar archivo ZIP:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar el archivo',
            error: error.message
        });
    }
}; 

const processZipFile = async (req, res) => {
    try {
        const zipFilePath = req.file.path;
        const zipFileName = path.basename(zipFilePath, '.zip');
        const uploadDir = path.dirname(zipFilePath);

        // Crear una instancia de AdmZip
        const zip = new AdmZip(zipFilePath);
        const zipEntries = zip.getEntries();

        // Verificar que hay exactamente dos archivos
        if (zipEntries.length !== 2) {
            await fs.promises.unlink(zipFilePath); // Eliminar el ZIP usando promesas
            return res.status(400).json({ 
                success: false,
                message: 'El archivo ZIP debe contener exactamente dos archivos' 
            });
        }

        // Verificar las extensiones
        const hasXml = zipEntries.some(entry => entry.entryName.toLowerCase().endsWith('.xml'));
        const hasPdf = zipEntries.some(entry => entry.entryName.toLowerCase().endsWith('.pdf'));

        if (!hasXml || !hasPdf) {
            await fs.promises.unlink(zipFilePath); // Eliminar el ZIP usando promesas
            return res.status(400).json({ 
                success: false,
                message: 'El archivo ZIP debe contener un archivo XML y un archivo PDF' 
            });
        }

        // Extraer y renombrar los archivos
        for (const entry of zipEntries) {
            const ext = path.extname(entry.entryName).toLowerCase();
            const newFileName = `${zipFileName}${ext}`;
            const newFilePath = path.join(uploadDir, newFileName);

            // Extraer el archivo usando el método correcto
            const extractedData = entry.getData();
            await fs.promises.writeFile(newFilePath, extractedData);
        }

        // Eliminar el archivo ZIP original usando promesas
        await fs.promises.unlink(zipFilePath);

        return res.status(200).json({ 
            success: true,
            message: 'Archivos procesados correctamente',
            files: {
                xml: `${zipFileName}.xml`,
                pdf: `${zipFileName}.pdf`
            }
        });

    } catch (error) {
        console.error('Error procesando el archivo ZIP:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error al procesar el archivo ZIP',
            error: error.message 
        });
    }
};