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
        const invoice = xmlJson.AttachedDocument;
        const embeddedInvoice = invoice.Attachment.ExternalReference.Description.__cdata;
        const invoiceJson = xmlToJson(embeddedInvoice);
        
        return {
            numeroFactura: invoiceJson.Invoice.cbc.ID,
            fechaEmision: invoiceJson.Invoice.cbc.IssueDate,
            horaEmision: invoiceJson.Invoice.cbc.IssueTime,
            valorTotal: invoiceJson.Invoice.cac.LegalMonetaryTotal.cbc.PayableAmount,
            emisor: {
                nit: invoiceJson.Invoice.cac.AccountingSupplierParty.cac.Party.cac.PartyTaxScheme.cbc.CompanyID,
                nombre: invoiceJson.Invoice.cac.AccountingSupplierParty.cac.Party.cac.PartyTaxScheme.cbc.RegistrationName
            },
            receptor: {
                nit: invoiceJson.Invoice.cac.AccountingCustomerParty.cac.Party.cac.PartyTaxScheme.cbc.CompanyID,
                nombre: invoiceJson.Invoice.cac.AccountingCustomerParty.cac.Party.cac.PartyTaxScheme.cbc.RegistrationName
            },
            items: invoiceJson.Invoice.cac.InvoiceLine.map(line => ({
                id: line.cbc.ID,
                descripcion: line.cac.Item.cbc.Description,
                cantidad: line.cbc.InvoicedQuantity,
                valorUnitario: line.cac.Price.cbc.PriceAmount,
                valorTotal: line.cbc.LineExtensionAmount
            }))
        };
    } catch (error) {
        console.error('Error al extraer información de la factura:', error);
        throw new Error('Error al procesar la información de la factura');
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

        for (const entry of zipEntries) {
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
                const xmlContent = extractedData.toString('utf8');
                const xmlJson = xmlToJson(xmlContent);
                invoiceData = extractInvoiceInfo(xmlJson);
                
                // Guardar el JSON como archivo
                const jsonFilePath = path.join(uploadDir, `${baseName}.json`);
                await fs.promises.writeFile(jsonFilePath, JSON.stringify(invoiceData, null, 2));
            }
        }

        // Eliminar el archivo ZIP original
        await fs.promises.unlink(zipFilePath);

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