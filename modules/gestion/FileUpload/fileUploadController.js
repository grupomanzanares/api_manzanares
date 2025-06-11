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
        // Si es AttachedDocument
        if (xmlJson.AttachedDocument) {
            const invoice = xmlJson.AttachedDocument;

            // 1. CDATA (ya lo tienes)
            const embedded = invoice.Attachment?.ExternalReference?.Description?.__cdata;
            if (embedded) {
                const xmlContent = embedded.replace(/^<\?xml[^>]*\?>/, '').trim();
                const embeddedJson = xmlToJson(xmlContent);
                console.log('DEBUG EMBEDDED JSON:', JSON.stringify(embeddedJson, null, 2));
                if (embeddedJson.Invoice) {
                    return extractInvoiceData(embeddedJson.Invoice);
                } else {
                    return extractInvoiceData(embeddedJson);
                }
            }

            // 2. O puede estar como string en cbc:Description
            const desc = invoice["cac:Attachment"]?.["cac:ExternalReference"]?.["cbc:Description"];
            if (desc && typeof desc === "string" && desc.includes("<Invoice")) {
                const xmlContent = desc.replace(/^<\?xml[^>]*\?>/, '').trim();
                const embeddedJson = xmlToJson(xmlContent);
                console.log('DEBUG EMBEDDED JSON (string):', JSON.stringify(embeddedJson, null, 2));
                if (embeddedJson.Invoice) {
                    return extractInvoiceData(embeddedJson.Invoice);
                } else {
                    return extractInvoiceData(embeddedJson);
                }
            }

            // Si no, procesar el AttachedDocument directamente
            return extractInvoiceData(invoice);
        }

        // Si no es AttachedDocument, intentar procesar como Invoice directa
        return extractInvoiceData(xmlJson);

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
        console.log('DEBUG INVOICE ITEMS:', JSON.stringify(invoice["cac:InvoiceLine"], null, 2));

        // Extraer el número de factura y limpiarlo
        const numeroFactura = (invoice["cbc:ID"] || '').trim();
        
        // Obtener el código del emisor con su schemeAgencyID
        const supplierParty = invoice["cac:AccountingSupplierParty"];
        const partyTaxScheme = supplierParty?.["cac:Party"]?.["cac:PartyTaxScheme"];
        const companyID = partyTaxScheme?.["cbc:CompanyID"];
        
        // Extraer el código del emisor y su tipo de identificación
        let codigoTercero1 = '';
        let schemeAgencyID = '';
        
        if (companyID) {
            // Si es un objeto con atributos
            if (typeof companyID === 'object') {
                codigoTercero1 = companyID["#text"] || companyID;
                schemeAgencyID = companyID["@_schemeAgencyID"];
                console.log('DEBUG Emisor:', {
                    codigo: codigoTercero1,
                    schemeAgencyID: schemeAgencyID,
                    schemeID: companyID["@_schemeID"],
                    schemeName: companyID["@_schemeName"]
                });
            } else {
                // Si es un string directo
                codigoTercero1 = companyID;
            }
        }
        
        // Crear el objeto documento con el formato requerido
        const result = {
            documento: {
                tipoDocumento: "PV",
                prefijo: "-",
                numero: 3000009999,
                fechaDocumento: invoice["cbc:IssueDate"] || '2025-06-10',
                fechaVencimiento: invoice["cbc:DueDate"] || '2025-06-25',
                codigoTercero1: codigoTercero1 || '890201881',
                numeroDeCaja: "1",
                numeroCaja: "1",
                precioTotal: parseFloat(invoice["cac:LegalMonetaryTotal"]?.["cbc:TaxInclusiveAmount"] || '0.00'),
                direccionFactura: " ",
                codigoFormaPago: "30",
                almacenOrigenEncabezado: "XXX",
                codigoMedioPublicitario: 0,
                codigoPatronContable: "CP001",
                cantidadBase: 0,
                documentoExterno: numeroFactura.padEnd(20, ' '),
                añoMovimiento: 2025,
                mesMovimiento: 6,
                usuarioCreacion: "VEN_ROT3",
                fechaCreacion: "2025-06-10 00:06:00",
                horaCreacion: "2025-06-10  16:44:49",
                hora: "2025-06-10  16:44:49",
                usuarioModificacion: "",
                fechaHoraModificacion: "2025-06-10 ",
                observaciones: "MIG",
                items: []
            },
            actualizarDocOrigen: false,
            desdeCapturaNueva: true,
            tipoEntrega: 1
        };

        // Procesar los items
        if (invoice["cac:InvoiceLine"]) {
            const lines = Array.isArray(invoice["cac:InvoiceLine"])
                ? invoice["cac:InvoiceLine"]
                : [invoice["cac:InvoiceLine"]];

            result.documento.items = lines.map((line, index) => {
                const cantidad = parseFloat(line["cbc:InvoicedQuantity"] || '0');
                const precioUnitario = parseFloat(line["cac:Price"]?.["cbc:PriceAmount"] || '0.00');
                const precioTotal = parseFloat(line["cbc:LineExtensionAmount"] || '0.00');
                const costoUnitario = 13300; // Este valor debería venir de algún lugar
                const costoTotal = cantidad * costoUnitario;

                return {
                    tipoDocumento: "PV",
                    prefijo: "CAN",
                    numero: 3000005504, // Mismo número que el documento
                    numeroItem: index + 1,
                    fechaDocumento: result.documento.fechaDocumento,
                    CentroDeCosto: "02050102",
                    producto: "V0001", // Este valor debería venir de algún lugar
                    almacen: "P02",
                    cantidad: cantidad,
                    cantidadAlterna: cantidad,
                    consecutivoItemOrdenDeProducion: 0,
                    numeroDePedidoProduccion: 0,
                    itemPedidoProduccion: 0,
                    añoMovimiento: 2025,
                    mesMovimiento: 6,
                    usuarioCreacion: "VEN_ROT3",
                    fechaCreacion: "2025-06-10 00:06:00",
                    horaCreacion: "2025-06-10  16:44:49",
                    precioUnitario: precioUnitario,
                    precioTotal: precioTotal,
                    porcentajeDescuentoDelPrecio: 0,
                    valorDescuentoDelPrecio: 0,
                    valorDescuento2: 0,
                    valorDescuento3: 0,
                    porcentajeImpuesto: 0,
                    valorImpuestoDelPrecio: 0,
                    precioTotalIncluidoImpuesto: precioTotal,
                    costoUnitario: costoUnitario,
                    costoTotal: costoTotal,
                    porcentajeDescuentoDelCosto: 0,
                    valorDescuentoDelCosto: 0,
                    valorImpuestoDelCosto: 0,
                    costoTotalSinImpuesto: costoTotal,
                    costoTotalIncluidoImpuesto: costoTotal,
                    costoTotalNiif: 0,
                    tipoNormaLocalNiif: "A",
                    cantidadUnidadMedidaMovimiento: 1,
                    mtoDetalladoClasificacion: [{
                        tipoDocumento: "PV",
                        prefijo: "CAN",
                        numero: 3000005504,
                        numeroItem: index + 1,
                        cantidad: cantidad,
                        cantidadAlterna: cantidad,
                        codigoClasificacion: "00",
                        mes: 6,
                        año: 2025,
                        producto: "V0001",
                        tipoProducto: ""
                    }]
                };
            });
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