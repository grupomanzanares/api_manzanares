import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { Op } from 'sequelize';
import db from '../../../config/db.js';
import { compraReportada } from '../gestionRelations.js';
import { XMLParser } from 'fast-xml-parser';

// Función para limpiar el nombre del archivo
function cleanFileName(name) {
    return name
        .replace(/^['"]+|['"]+$/g, '') // quita comillas al inicio/final
        .replace(/^RV: ?/, '')           // quita RV: y posible espacio
        .trim();                         // quita espacios al inicio/final
}

// Función para convertir XML a JSON
function xmlToJson(xmlContent) {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        parseAttributeValue: true,
        parseTagValue: true,
        trimValues: true,
        cdataTagName: "__cdata",
        cdataPositionChar: "\\c"
    });
    
    try {
        return parser.parse(xmlContent);
    } catch (error) {
        console.error('Error al parsear XML:', error);
        throw new Error('Error al procesar el archivo XML');
    }
}

// Función para extraer información relevante del XML
function extractInvoiceInfo(xmlJson) {
    try {
        // Verificar si tenemos un AttachedDocument
        if (!xmlJson.AttachedDocument) {
            // Si no es AttachedDocument, intentar procesar como Invoice directa
            return extractInvoiceData(xmlJson);
        }

        const invoice = xmlJson.AttachedDocument;
        
        // Verificar si tenemos el documento embebido
        if (invoice.Attachment?.ExternalReference?.Description?.__cdata) {
            const embeddedInvoice = invoice.Attachment.ExternalReference.Description.__cdata;
            const invoiceJson = xmlToJson(embeddedInvoice);
            return extractInvoiceData(invoiceJson);
        }

        // Si no hay documento embebido, intentar procesar el AttachedDocument directamente
        return extractInvoiceData(invoice);
    } catch (error) {
        console.error('Error al extraer información de la factura:', error);
        // En lugar de lanzar error, devolver un objeto con información básica
        return {
            error: 'Error al procesar la información de la factura',
            rawData: xmlJson // Incluir los datos crudos para debugging
        };
    }
}

// Función para extraer datos de la factura
function extractInvoiceData(data) {
    try {
        // Intentar obtener los datos básicos de la factura
        const invoice = data.Invoice || data;
        
        // Crear objeto base con valores por defecto
        const result = {
            numeroFactura: 'No disponible',
            fechaEmision: 'No disponible',
            horaEmision: 'No disponible',
            valorTotal: '0.00',
            emisor: {
                nit: 'No disponible',
                nombre: 'No disponible'
            },
            receptor: {
                nit: 'No disponible',
                nombre: 'No disponible'
            },
            items: []
        };

        // Intentar extraer cada campo de forma segura
        try {
            result.numeroFactura = invoice.cbc?.ID || 'No disponible';
            result.fechaEmision = invoice.cbc?.IssueDate || 'No disponible';
            result.horaEmision = invoice.cbc?.IssueTime || 'No disponible';
            result.valorTotal = invoice.cac?.LegalMonetaryTotal?.cbc?.PayableAmount || '0.00';
        } catch (e) {
            console.warn('Error al extraer datos básicos:', e);
        }

        // Intentar extraer datos del emisor
        try {
            const emisor = invoice.cac?.AccountingSupplierParty?.cac?.Party?.cac?.PartyTaxScheme?.cbc;
            if (emisor) {
                result.emisor.nit = emisor.CompanyID || 'No disponible';
                result.emisor.nombre = emisor.RegistrationName || 'No disponible';
            }
        } catch (e) {
            console.warn('Error al extraer datos del emisor:', e);
        }

        // Intentar extraer datos del receptor
        try {
            const receptor = invoice.cac?.AccountingCustomerParty?.cac?.Party?.cac?.PartyTaxScheme?.cbc;
            if (receptor) {
                result.receptor.nit = receptor.CompanyID || 'No disponible';
                result.receptor.nombre = receptor.RegistrationName || 'No disponible';
            }
        } catch (e) {
            console.warn('Error al extraer datos del receptor:', e);
        }

        // Intentar extraer items
        try {
            const items = invoice.cac?.InvoiceLine || [];
            result.items = items.map(line => ({
                id: line.cbc?.ID || 'No disponible',
                descripcion: line.cac?.Item?.cbc?.Description || 'No disponible',
                cantidad: line.cbc?.InvoicedQuantity || '0',
                valorUnitario: line.cac?.Price?.cbc?.PriceAmount || '0.00',
                valorTotal: line.cbc?.LineExtensionAmount || '0.00'
            }));
        } catch (e) {
            console.warn('Error al extraer items:', e);
        }

        return result;
    } catch (error) {
        console.error('Error al procesar datos de la factura:', error);
        return {
            error: 'Error al procesar datos de la factura',
            rawData: data
        };
    }
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
            await fs.promises.unlink(zipFilePath);
            return res.status(400).json({ 
                success: false,
                message: 'El archivo ZIP debe contener exactamente dos archivos' 
            });
        }

        // Verificar las extensiones
        const hasXml = zipEntries.some(entry => entry.entryName.toLowerCase().endsWith('.xml'));
        const hasPdf = zipEntries.some(entry => entry.entryName.toLowerCase().endsWith('.pdf'));

        if (!hasXml || !hasPdf) {
            await fs.promises.unlink(zipFilePath);
            return res.status(400).json({ 
                success: false,
                message: 'El archivo ZIP debe contener un archivo XML y un archivo PDF' 
            });
        }

        // Extraer y procesar los archivos
        let cleanBaseName = null;
        let invoiceData = null;
        let processingErrors = [];

        for (const entry of zipEntries) {
            try {
                const ext = path.extname(entry.entryName).toLowerCase();
                let baseName = path.basename(entry.entryName, ext);
                baseName = cleanFileName(baseName);
                if (!cleanBaseName) cleanBaseName = baseName;

                const newFileName = `${baseName}${ext}`;
                const newFilePath = path.join(uploadDir, newFileName);

                // Extraer el archivo
                const extractedData = entry.getData();
                await fs.promises.writeFile(newFilePath, extractedData);

                // Si es XML, procesarlo y crear el JSON
                if (ext === '.xml') {
                    try {
                        const xmlContent = extractedData.toString('utf8');
                        const xmlJson = xmlToJson(xmlContent);
                        invoiceData = extractInvoiceInfo(xmlJson);
                        
                        // Guardar el JSON como archivo
                        const jsonFilePath = path.join(uploadDir, `${baseName}.json`);
                        await fs.promises.writeFile(jsonFilePath, JSON.stringify(invoiceData, null, 2));
                    } catch (xmlError) {
                        console.error('Error procesando XML:', xmlError);
                        processingErrors.push(`Error procesando XML: ${xmlError.message}`);
                    }
                }
            } catch (entryError) {
                console.error('Error procesando entrada:', entryError);
                processingErrors.push(`Error procesando archivo ${entry.entryName}: ${entryError.message}`);
            }
        }

        // Eliminar el archivo ZIP original
        //await fs.promises.unlink(zipFilePath);

        // Intentar buscar y actualizar en compraReportada
        try {
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
                await registro.update({
                    urlPdf: `/uploads/${cleanBaseName}.pdf`,
                    urlXml: `/uploads/${cleanBaseName}.xml`,
                    urlJson: `/uploads/${cleanBaseName}.json`
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
                    pdf: `${cleanBaseName}.pdf`,
                    json: `${cleanBaseName}.json`
                },
                invoiceData,
                processingErrors: processingErrors.length > 0 ? processingErrors : undefined,
                ...(registroInfo && { registro: registroInfo })
            });

        } catch (dbError) {
            console.error('Error al actualizar en la base de datos:', dbError);
            return res.status(200).json({
                success: true,
                message: 'Archivos procesados correctamente (no se pudo actualizar el registro en la base de datos)',
                files: {
                    xml: `${cleanBaseName}.xml`,
                    pdf: `${cleanBaseName}.pdf`,
                    json: `${cleanBaseName}.json`
                },
                invoiceData,
                processingErrors: processingErrors.length > 0 ? processingErrors : undefined,
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