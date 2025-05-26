import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { Op } from 'sequelize';
import db from '../../../config/db.js';
import { compraReportada } from '../gestionRelations.js';

// Función para limpiar el nombre del archivo
function cleanFileName(name) {
    return name
        .replace(/^['"]+|['"]+$/g, '') // quita comillas al inicio/final
        .replace(/^RV: ?/, '')           // quita RV: y posible espacio
        .trim();                         // quita espacios al inicio/final
}

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
        let cleanBaseName = null;
        for (const entry of zipEntries) {
            const ext = path.extname(entry.entryName).toLowerCase();
            // Limpia el nombre base (sin extensión)
            let baseName = path.basename(entry.entryName, ext);
            baseName = cleanFileName(baseName);
            if (!cleanBaseName) cleanBaseName = baseName; // Usar el primero como referencia para la BD

            const newFileName = `${baseName}${ext}`;
            const newFilePath = path.join(uploadDir, newFileName);

            // Extraer el archivo usando el método correcto
            const extractedData = entry.getData();
            await fs.promises.writeFile(newFilePath, extractedData);
        }

        // Eliminar el archivo ZIP original usando promesas
        await fs.promises.unlink(zipFilePath);

        // Intentar buscar y actualizar en compraReportada (opcional)
        try {
            // Buscar el registro en compraReportada donde la concatenación de emisor y numero coincida con el nombre limpio del archivo
            const registro = await compraReportada.findOne({
                where: {
                    [Op.and]: [
                        db.where(
                            db.fn('CONCAT', 
                                db.col('emisor'), 
                                db.col('numero')
                            ),
                            cleanBaseName
                        )
                    ]
                }
            });

            let mensaje = 'Archivos procesados correctamente';
            let registroInfo = null;

            if (registro) {
                // Actualizar el registro con las URLs de los archivos
                await registro.update({
                    urlPdf: `/uploads/${cleanBaseName}.pdf`
                });
                mensaje = 'Archivos procesados y registro actualizado correctamente';
                registroInfo = {
                    id: registro.id,
                    emisor: registro.emisor,
                    numero: registro.numero
                };
            }

            return res.status(200).json({ 
                success: true,
                message: mensaje,
                files: {
                    xml: `${cleanBaseName}.xml`,
                    pdf: `${cleanBaseName}.pdf`
                },
                ...(registroInfo && { registro: registroInfo })
            });

        } catch (dbError) {
            console.error('Error al actualizar en la base de datos:', dbError);
            // Aún si hay error en la base de datos, devolvemos éxito porque los archivos se procesaron correctamente
            return res.status(200).json({
                success: true,
                message: 'Archivos procesados correctamente (no se pudo actualizar el registro en la base de datos)',
                files: {
                    xml: `${cleanBaseName}.xml`,
                    pdf: `${cleanBaseName}.pdf`
                },
                dbError: dbError.message
            });
        }

    } catch (error) {
        console.error('Error procesando el archivo ZIP:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error al procesar el archivo ZIP',
            error: error.message 
        });
    }
};