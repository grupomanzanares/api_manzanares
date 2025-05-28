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
        
        // Verificar si tenemos el documento embebido en CDATA
        const embedded = invoice.Attachment?.ExternalReference?.Description?.__cdata;
        if (embedded) {
            try {
                // Extraer el XML del CDATA
                const xmlContent = embedded.replace(/^<\?xml[^>]*\?>/, '').trim();
                const embeddedJson = xmlToJson(xmlContent);
                return extractInvoiceData(embeddedJson);
            } catch (error) {
                console.error('Error procesando XML embebido:', error);
                return {
                    error: 'Error al procesar el XML embebido',
                    rawData: embedded
                };
            }
        }

        // Si no hay documento embebido, intentar procesar el AttachedDocument directamente
        return extractInvoiceData(invoice);
    } catch (error) {
        console.error('Error al extraer información de la factura:', error);
        return {
            error: 'Error al procesar la información de la factura',
            rawData: xmlJson
        };
    }
}

// Función para extraer datos de la factura
function extractInvoiceData(data) {
    try {
        const invoice = data.Invoice || data;
        console.log('DEBUG INVOICE JSON:', JSON.stringify(invoice, null, 2));

        const result = {
            numeroFactura: invoice["cbc:ID"] || 'No disponible',
            fechaEmision: invoice["cbc:IssueDate"] || 'No disponible',
            horaEmision: invoice["cbc:IssueTime"] || 'No disponible',
            valorTotal: invoice["cac:LegalMonetaryTotal"]?.["cbc:PayableAmount"] || '0.00',
            emisor: {
                nit: invoice["cac:SenderParty"]?.["cac:PartyTaxScheme"]?.["cbc:CompanyID"]?.["#text"] || invoice["cac:SenderParty"]?.["cac:PartyTaxScheme"]?.["cbc:CompanyID"] || 'No disponible',
                nombre: invoice["cac:SenderParty"]?.["cac:PartyTaxScheme"]?.["cbc:RegistrationName"] || 'No disponible'
            },
            receptor: {
                nit: invoice["cac:ReceiverParty"]?.["cac:PartyTaxScheme"]?.["cbc:CompanyID"]?.["#text"] || invoice["cac:ReceiverParty"]?.["cac:PartyTaxScheme"]?.["cbc:CompanyID"] || 'No disponible',
                nombre: invoice["cac:ReceiverParty"]?.["cac:PartyTaxScheme"]?.["cbc:RegistrationName"] || 'No disponible'
            },
            items: []
        };

        // Items (si existen)
        if (invoice["cac:InvoiceLine"]) {
            const lines = Array.isArray(invoice["cac:InvoiceLine"]) ? invoice["cac:InvoiceLine"] : [invoice["cac:InvoiceLine"]];
            result.items = lines.map(line => ({
                id: line["cbc:ID"] || 'No disponible',
                descripcion: line["cac:Item"]?.["cbc:Description"] || 'No disponible',
                cantidad: line["cbc:InvoicedQuantity"] || '0',
                valorUnitario: line["cac:Price"]?.["cbc:PriceAmount"] || '0.00',
                valorTotal: line["cbc:LineExtensionAmount"] || '0.00'
            }));
        }

        return result;
    } catch (error) {
        console.error('Error procesando datos de la factura:', error);
        return { error: 'Error general al procesar datos', rawData: data };
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
        // Obtener el nombre del ZIP sin la extensión
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
        let invoiceData = null;
        let processingErrors = [];

        // Procesar cada archivo del ZIP
        for (const entry of zipEntries) {
            try {
                const ext = path.extname(entry.entryName).toLowerCase();
                // Usar el nombre del ZIP como base para todos los archivos
                const newFileName = `${zipFileName}${ext}`;
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
                        
                        // Guardar el JSON usando el mismo nombre base
                        const jsonFilePath = path.join(uploadDir, `${zipFileName}.json`);
                        await fs.promises.writeFile(jsonFilePath, JSON.stringify(invoiceData, null, 2));
                    } catch (xmlError) {
                        console.error('Error procesando XML:', xmlError);
                        processingErrors.push(`Error procesando XML: ${entry.entryName}: ${xmlError.message}`);
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
                            zipFileName
                        )
                    ]
                }
            });

            let mensaje = 'Archivos procesados correctamente';
            let registroInfo = null;

            if (registro) {
                await registro.update({
                    urlPdf: `/uploads/${zipFileName}.pdf`,
                    urlXml: `/uploads/${zipFileName}.xml`,
                    urlJson: `/uploads/${zipFileName}.json`
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
                    xml: `${zipFileName}.xml`,
                    pdf: `${zipFileName}.pdf`,
                    json: `${zipFileName}.json`
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
                    xml: `${zipFileName}.xml`,
                    pdf: `${zipFileName}.pdf`,
                    json: `${zipFileName}.json`
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