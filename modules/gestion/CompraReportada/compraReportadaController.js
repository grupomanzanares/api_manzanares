import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import { compraReportada, comprasEstado, comprasTipo, empresa, User, matrizAutorizaciones } from "../gestionRelations.js";
import { emailNotAutorizacion, emailCompraAutorizada } from "../../../helpers/emails.js";
import { ccosto } from "../../maestras/masterRelations.js";
import registroDian from "../RegistroDian/registroDian.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import CompraReportadaDetalle from "../CompraReportadaDetalle/compraReportadaDetalle.js";
import { Op } from 'sequelize';
import { emailComprasPorAutorizar } from '../../../helpers/emails.js'; // Ajusta la ruta si es necesario


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entity = "compraReportada"

const getComprasReportadas = async (req, res) => {
    try {
        const registros = await compraReportada.findAll({
            where: { habilitado: true },
            include: [
                {
                    model: comprasTipo,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: comprasEstado,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: User, as: 'responsable',
                    attributes: ["name"]
                },
                {
                    model: empresa,
                    as: 'empresaInfo',
                    attributes: ['id', 'nombre', 'nit'],
                }
            ]
        });


        // 2. Cargar todas las empresas y centros de costo
        const [empresas, centrosCosto] = await Promise.all([
            empresa.findAll({ attributes: ['id', 'nit'] }),
            ccosto.findAll({ attributes: ['codigo', 'nombre', 'empresaId'] })
        ]);

        // 3. Armar un resultado enriquecido con nombre del centro de costo
        const resultado = registros.map(registro => {
            const empresaNit = registro.empresa;
            const codigoCcosto = registro.ccosto;

            // Buscar el ID de la empresa a partir del NIT
            const empresaEncontrada = empresas.find(e => e.nit === empresaNit);
            const empresaId = empresaEncontrada?.id;

            // Buscar el nombre del centro de costo por código y empresaId
            const ccostoEncontrado = centrosCosto.find(c =>
                c.codigo === codigoCcosto && c.empresaId === empresaId
            );

            return {
                ...registro.toJSON(),
                ccostoNombre: ccostoEncontrado?.nombre || null
            };
        });

        res.json(resultado);
    } catch (error) {
        console.error(error);
        handleHttpError(res, `No se pudo cargar ${entity}s`);
    }
};

const getCompraReportadaJson = async (req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await compraReportada.findOne({
            where: {
                id: id,
                habilitado: true
            },
            include: [
                {
                    model: comprasTipo,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: comprasEstado,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: User, 
                    as: 'responsable',
                    attributes: ["name", "email", "celphone"]
                },
                {
                    model: empresa,
                    as: 'empresaInfo',
                    attributes: ['id', 'nombre', 'nit'],
                }
            ]
        })
        if (!data) {
            return res.status(404).json({
                message: `${entity} no encontrado(a) ó inactivo (a) `
            })
        }

        // Cargar empresas y centros de costo
        const [empresas, centrosCosto] = await Promise.all([
            empresa.findAll({ attributes: ['id', 'nit'] }),
            ccosto.findAll({ attributes: ['codigo', 'nombre', 'empresaId'] })
        ]);

        // Buscar el ID de la empresa a partir del NIT
        const empresaEncontrada = empresas.find(e => e.nit === data.empresa);
        const empresaId = empresaEncontrada?.id;

        // Buscar el nombre del centro de costo por código y empresaId
        const ccostoEncontrado = centrosCosto.find(c =>
            c.codigo === data.ccosto && c.empresaId === empresaId
        );

        // Construir la ruta del archivo JSON
        const jsonPath = data.urlPdf ? data.urlPdf.replace('.pdf', '.json') : null;
        let jsonContent = null;

        // Si existe la ruta del JSON, intentar leer el archivo
        if (jsonPath) {
            try {
                // Construir la ruta completa al archivo JSON incluyendo la carpeta public
                const fullPath = path.join(process.cwd(), 'public', 'uploads', path.basename(jsonPath));
                console.log('Intentando leer archivo JSON desde:', fullPath);
                
                const jsonData = await fs.readFile(fullPath, 'utf8');
                jsonContent = JSON.parse(jsonData);
                console.log('Archivo JSON leído exitosamente');
            } catch (error) {
                console.error('Error al leer el archivo JSON:', error);
                // Si hay error al leer el archivo, continuamos sin el contenido JSON
            }
        }

        // Crear el resultado enriquecido
        const resultado = {
            ...data.toJSON(),
            ccostoNombre: ccostoEncontrado?.nombre || null,
            urlJson: jsonPath,
            jsonContent: jsonContent // Incluir el contenido del JSON en la respuesta
        };

        res.status(200).json(resultado);
    } catch (error) {
        handleHttpError(res, `Error al traer ${entity}  `)
        console.error(error)
    }
}


const getCompraReportada = async (req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await compraReportada.findOne({
            where: { id: id, habilitado: true },
            include: [
                {
                    model: comprasTipo,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: comprasEstado,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: User, 
                    as: 'responsable',
                    attributes: ["name", "email", "celphone"]
                },
                {
                    model: empresa,
                    as: 'empresaInfo',
                    attributes: ['id', 'nombre', 'nit'],
                }
            ]
        })
        if (!data) {
            return res.status(404).json({ message: `${entity} no encontrado(a) ó inactivo (a)` });
        }


         // Cargar empresas y centros de costo
         const [empresas, centrosCosto] = await Promise.all([
            empresa.findAll({ attributes: ['id', 'nit'] }),
            ccosto.findAll({ attributes: ['codigo', 'nombre', 'empresaId'] })
        ]);

        // Buscar el ID de la empresa a partir del NIT
        const empresaEncontrada = empresas.find(e => e.nit === data.empresa);
        const empresaId = empresaEncontrada?.id;

        // Buscar el nombre del centro de costo por código y empresaId
        const ccostoEncontrado = centrosCosto.find(c =>
            c.codigo === data.ccosto && c.empresaId === empresaId
        );
        
        // Buscar detalles por numeroFactura
        const detalles = await CompraReportadaDetalle.findAll({
            where: { numeroFactura: data.numero }
        });

        // Actualizar los detalles que tengan compraReportadaId en null
        const detallesSinId = detalles.filter(det => !det.compraReportadaId);
        if (detallesSinId.length > 0) {
            await Promise.all(detallesSinId.map(det =>
                det.update({ compraReportadaId: data.id })
            ));
        }

        // Puedes volver a consultar los detalles si quieres asegurarte de tener los datos actualizados
        // const detallesActualizados = await CompraReportadaDetalle.findAll({ where: { numeroFactura: data.numero } });

        // Armar la respuesta
        const resultado = {
            ...data.toJSON(),
            items: detalles.map(det => det.toJSON())
        };

        res.status(200).json(resultado);
    } catch (error) {
        handleHttpError(res, `Error al traer ${entity}`);
        console.error(error);
    }
}


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createCompraReportada = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Archivos:', req.files);

    try {
        const body = matchedData(req);

        // Verificar si hay archivos y obtener sus rutas
        const pdfPath = req.files?.pdf ? `/uploads/${req.files.pdf[0].filename}` : null;
        const jsonPath = req.files?.json ? `/uploads/${req.files.json[0].filename}` : null;

        const nuevo = await compraReportada.create({
            ...body,
            urlPdf: pdfPath,
            urlJson: jsonPath
        });
        console.log('Registro creado exitosamente:', nuevo.id);

        return res.status(201).json({
            mensaje: 'Compra reportada creada exitosamente',
            data: nuevo
        });

    } catch (error) {
        console.log(error)
        console.error('Error al crear compra reportada:', error);
        return res.status(500).json({
            error: 'Error al crear la compra reportada',
            detalle: error.message,
            validaciones: error.errors ? error.errors.map(e => e.message) : null
        });
    }
}


const updateCompraReportada = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Archivos:', req.files);

    try {
        const { id } = req.params
        const body = req.body

        // Si se subió un archivo PDF, agrégalo al body
        if (req.files && req.files['archivo'] && req.files['archivo'][0]) {
            //body.urlPdf = `/uploads/${req.file.filename}`;
            body.urlPdf = `/uploads/${req.files['archivo'][0].filename}`;
        }

        // Ejecuta la actualización
        const [updatedCount] = await compraReportada.update(body, {
            where: { id }
        });

        if (updatedCount === 0) {
            return res.status(404).json({
                message: `${entity} no encontrado o no se realizaron cambios`
            });
        }

        const updateRegistro = await compraReportada.findByPk(id);

        // Si el estado es 3 (autorizado), guardar en matrizAutorizaciones
        if (updateRegistro.estadoId === 3) {
            // Verificar si ya existe en matrizAutorizaciones
            const existeAutorizacion = await matrizAutorizaciones.findOne({
                where: {
                    empresa: updateRegistro.empresa,
                    emisor: updateRegistro.emisor,
                    responsableId: updateRegistro.responsableId
                }
            });

            // Si no existe, crear nueva autorización
            if (!existeAutorizacion) {
                await matrizAutorizaciones.create({
                    empresa: updateRegistro.empresa,
                    emisor: updateRegistro.emisor,
                    responsableId: updateRegistro.responsableId,
                    fechaAutorizacion: new Date(),
                    user: updateRegistro.userMod,
                    userMod: updateRegistro.userMod
                });
            }

            // --- Lógica adicional solicitada ---.....
            // Actualizar CentroDeCosto en detalles si es null
            await CompraReportadaDetalle.update(
                { CentroDeCosto: updateRegistro.ccosto },
                {
                    where: {
                        compraReportadaId: updateRegistro.id,
                        CentroDeCosto: null
                    }
                }
            );
            // --- Fin lógica adicional ---
        }

        // ✅ Enviar correo solo si estadoId es 2
        if (updateRegistro.estadoId == 2) {
            // ✅ Buscar correos de userMod y responsableId
            const [usuarioModifico, usuarioResponsable] = await Promise.all([
                User.findOne({ where: { identificacion: updateRegistro.userMod }, attributes: ['email', 'name'] }),
                User.findByPk(updateRegistro.responsableId, { attributes: ['email', 'name'] })
            ]);

            // Validar si se encontró la información
            if (!usuarioModifico || !usuarioResponsable) {
                return res.status(500).json({
                    message: 'No se pudo encontrar la información de los usuarios para el envío de correo.'
                });
            }

            emailNotAutorizacion({
                tipo: updateRegistro.tipo,
                numero: updateRegistro.numero,
                valor: updateRegistro.valor,
                cufe: updateRegistro.cufe,
                urlpdf: updateRegistro.urlPdf,
                responsableId: updateRegistro.responsableId,
                userMod: updateRegistro.userMod,
                correoSolicitante: usuarioModifico?.email,
                nombreSolicitante: usuarioModifico?.name,
                correoResponsable: usuarioResponsable?.email,
                nombreResponsable: usuarioResponsable?.name,
                asignacionAutomatica: false
            });
        }


        // ✅ Enviar correo solo si fue autorizado
        if (updateRegistro.estadoId == 3) {
            // Buscar el usuario que autorizó (solicitante)
            const usuarioModifico = await User.findOne({ where: { identificacion: updateRegistro.userMod }, attributes: ['email', 'name'] });
            // Buscar el usuario con rolId 2 (recepción)
            const usuarioRecepcion = await User.findOne({ where: { rolId: 2 }, attributes: ['email', 'name'] });

            // Validar si se encontró la información
            if (!usuarioModifico || !usuarioRecepcion) {
                return res.status(500).json({
                    message: 'No se pudo encontrar la información de los usuarios para el envío de correo.'
                });
            }

            emailCompraAutorizada({
                tipo: updateRegistro.tipo,
                numero: updateRegistro.numero,
                valor: updateRegistro.valor,
                cufe: updateRegistro.cufe,
                urlpdf: updateRegistro.urlPdf,
                responsableId: usuarioRecepcion.id,
                userMod: updateRegistro.userMod,
                correoSolicitante: usuarioModifico?.email,
                nombreSolicitante: usuarioModifico?.name,
                correoResponsable: usuarioRecepcion?.email,
                nombreResponsable: usuarioRecepcion?.name
            });
        }


        res.status(200).json({
            message: ` ${entity} actualizado correctamente `,
            data: updateRegistro
        });

    } catch (error) {
        handleHttpError(res, `No se pudo actualizar ${entity} `)
        console.error(error)
    }
}


const deleteCompraReportada = async (req, res) => {
    try {
        const { id } = req.params
        const response = await compraReportada.update({ habilitado: false }, {
            where: { id, habilitado: true }
        })

        if (response === 0) {
            return res.status(404).json({
                message: `${entity} , no encontrado(a) y/o inactivo(a)`
            })
        }

        res.status(200).json({
            message: `${entity} , eliminada con exito`
        })
    } catch (error) {
        handleHttpError(res, `No se pudo eliminar ${entity} `)
        console.error(error)
    }
}



const bulkUpsertComprasReportadas = async (req, res) => {
    const registros = req.body;
    console.log('Recibidos para procesar:', registros.length, 'registros');

    if (!Array.isArray(registros)) {
        return res.status(400).json({ error: 'El cuerpo debe ser un array de objetos.' });
    }

    const resultados = {
        creados: [],
        actualizados: [],
        errores: [],
    };

    for (let i = 0; i < registros.length; i++) {
        const item = registros[i];
        try {
            console.log(`Procesando item ${i + 1}/${registros.length}:`, item);

            // Validación de campos requeridos
            const { emisor, numero, empresa } = item;
            if (!emisor || !numero || !empresa) {
                console.log(`Error en item ${i + 1}: Faltan campos obligatorios`);
                resultados.errores.push({
                    item,
                    error: 'Faltan campos obligatorios: emisor, numero o empresa'
                });
                continue;
            }

            // Formatear el valor decimal correctamente
            if (item.valor) {
                item.valor = item.valor.toString().replace(/\./g, '').replace(',', '.');
                item.valor = parseFloat(item.valor);

                if (isNaN(item.valor)) {
                    resultados.errores.push({
                        item,
                        error: `Valor inválido: "${item.valor}" no es un número decimal válido`
                    });
                    continue;
                }
            }

            // Buscar existente
            const existente = await compraReportada.findOne({
                where: { emisor, numero }
            });

            console.log(`Item ${i + 1}: existente =`, existente ? 'Sí' : 'No');

            if (existente) {
                console.log(`Item ${i + 1}: estadoId =`, existente.estadoId);
                if (existente.estadoId === 1) {
     
                    console.log(`Item ${i + 1}: Actualizando...`);
                    await existente.update(item);
                    resultados.actualizados.push({ emisor, numero });

      

                    console.log(`Item ${i + 1}: Actualizado con éxito`);
                } else {
                    console.log(`Item ${i + 1}: No actualizable por estadoId`);
                    resultados.errores.push({
                        emisor,
                        numero,
                        error: 'No se puede actualizar porque estadoId no es 1'
                    });
                }
            } else {
                // Para registros nuevos, generar URL del PDF
                item.urlPdf = `/uploads/${emisor}${numero}.pdf`;

                // Para registros nuevos, buscar responsable en matriz_autorizaciones
                const autorizacion = await matrizAutorizaciones.findOne({
                    where: {
                        empresa: empresa,
                        emisor: emisor
                    },
                    include: [{
                        model: User,
                        as: 'responsable',
                        attributes: ['id', 'email', 'name']
                    }]
                });

                // Si se encuentra un responsable, asignarlo al item
                if (autorizacion && autorizacion.responsable) {
                    item.responsableId = autorizacion.responsable.id;
                    item.estadoId = 2; // Estado por autorizar
                     // Bandera para indicar asignación automática
                }

                console.log(`Item ${i + 1}: Creando nuevo registro...`);
                try {
                    const nuevoRegistro = await compraReportada.create(item);
                    console.log(`Item ${i + 1}: Creado con éxito, ID:`, nuevoRegistro.id);
                    resultados.creados.push({ emisor, numero, id: nuevoRegistro.id });

                    // Si se asignó un responsable, enviar correo
                    if (item.responsableId && item.estadoId === 2) {
                        const [usuarioModifico, usuarioResponsable] = await Promise.all([
                            User.findOne({ where: { identificacion: item.userMod }, attributes: ['email', 'name'] }),
                            User.findByPk(item.responsableId, { attributes: ['email', 'name'] })
                        ]);

                        if (usuarioModifico && usuarioResponsable) {
                            console.log('🔍 Enviando correo con asignacionAutomatica:', true);
                            emailNotAutorizacion({
                                tipo: item.tipo,
                                numero: item.numero,
                                valor: item.valor,
                                cufe: item.cufe,
                                urlpdf: item.urlPdf,
                                responsableId: item.responsableId,
                                userMod: item.userMod,
                                correoSolicitante: usuarioModifico.email,
                                nombreSolicitante: usuarioModifico.name,
                                correoResponsable: usuarioResponsable.email,
                                nombreResponsable: usuarioResponsable.name,
                                asignacionAutomatica: true
                            });
                        }
                    }
                } catch (creationError) {
                    console.error(`Item ${i + 1}: Error al crear:`, creationError);
                    resultados.errores.push({
                        item,
                        error: `Error al crear: ${creationError.message}`,
                        detalles: creationError.errors ? creationError.errors.map(e => e.message) : null
                    });
                }
            }
        } catch (error) {
            console.error(`Error general en item ${i + 1}:`, error);
            resultados.errores.push({
                item,
                error: error.message,
                stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
            });
        }
    }

    console.log('Resumen del proceso:');
    console.log('- Creados:', resultados.creados.length);
    console.log('- Actualizados:', resultados.actualizados.length);
    console.log('- Errores:', resultados.errores.length);

    return res.status(200).json({
        mensaje: 'Proceso de inserción/actualización completado',
        total: registros.length,
        resumen: {
            creados: resultados.creados.length,
            actualizados: resultados.actualizados.length,
            errores: resultados.errores.length
        },
        resultados
    });
};



const conciliarCompras = async (req, res) => {
    try {
        const registrosDian = await registroDian.findAll({
            where: {
                habilitado: true,
                conciliado: false
            }
        });

        let totalConciliados = 0;
        let noConciliados = [];

        for (const dian of registrosDian) {
            const compra = await compraReportada.findOne({
                where: {
                    cufe: dian.cufe,
                    numero: dian.numero,
                    emisor: dian.emisor,
                    habilitado: true,
                    conciliado: false
                }
            });

            if (compra) {
                await Promise.all([
                    compra.update({ conciliado: true }),
                    dian.update({ conciliado: true })
                ]);
                totalConciliados++;
            } else {
                noConciliados.push({
                    cufe: dian.cufe,
                    emisor: dian.emisor,
                    nombreEmisor: dian.nombreEmisor,
                    empresa: dian.empresa,
                    tipo: dian.tipo,
                    valor: dian.valor,
                    numero: dian.numero,
                    fecha: dian.fecha,
                    motivo: 'No se encontró compra reportada coincidente',
                    conciliado: 0
                });
            }
        }

        res.status(200).json({
            mensaje: 'Proceso de conciliación finalizado',
            totalConciliados,
            noConciliados
        });

    } catch (error) {
        console.error("Error en conciliación:", error);
        handleHttpError(res, 'Error durante la conciliación de compras');
    }
};

const getComprasPorAutorizar = async (req, res) => {
    try {
        const registros = await compraReportada.findAll({
            where: { 
                habilitado: true,
                estadoId: 2,
                responsableId: { [Op.ne]: null }
            },
            include: [
                {
                    model: User, 
                    as: 'responsable',
                    attributes: ["id", "name", "celphone", "email"] // <-- Agrega email aquí
                }
            ]
        });

        // Agrupar por responsableId
        const resumen = {};
        registros.forEach(registro => {
            const responsable = registro.responsable;
            if (!responsable) return;

            const key = responsable.id;
            if (!resumen[key]) {
                resumen[key] = {
                    name: responsable.name,
                    celphone: responsable.celphone,
                    email: responsable.email,
                    cantidad: 0
                };
            }
            resumen[key].cantidad += 1;
        });

        const resultado = Object.values(resumen);

        // Enviar correo a cada responsable
        //for (const responsable of resultado) {
          //  if (responsable.email) {
            //    await emailRecordatorioComprasPorAutorizar({
              //      correoResponsable: responsable.email,
                //    nombreResponsable: responsable.name,
                  //  CantidadFacturasPendientes: responsable.cantidad
                //});
            //}
        //}

        res.json(resultado);
    } catch (error) {
        console.error(error);
        handleHttpError(res, `No se pudieron cargar las compras por autorizar`);
    }
};

const ejecutarEnvioCorreosProgramados = async (req, res) => {
    try {
        console.log('🚀 Ejecutando envío manual de correos programados...');
        
        // Importar las funciones necesarias
        const { Op } = await import('sequelize');
        
        // Consulta para obtener compras pendientes por autorizar
        const registros = await compraReportada.findAll({
            where: {
                habilitado: true,
                estadoId: 2,
                responsableId: { [Op.ne]: null }
            },
            include: [
                {
                    model: User,
                    as: 'responsable',
                    attributes: ['id', 'name', 'celphone', 'email']
                }
            ]
        });

        console.log(`📊 Total de registros encontrados: ${registros.length}`);

        // Agrupar por responsableId
        const resumen = {};
        registros.forEach(registro => {
            const responsable = registro.responsable;
            if (!responsable) return;
            const key = responsable.id;
            if (!resumen[key]) {
                resumen[key] = {
                    name: responsable.name,
                    celphone: responsable.celphone,
                    email: responsable.email,
                    cantidad: 0
                };
            }
            resumen[key].cantidad += 1;
        });

        const resultado = Object.values(resumen);
        console.log(`👥 Total de responsables con pendientes: ${resultado.length}`);

        let correosEnviados = 0;
        const errores = [];

        for (const responsable of resultado) {
            if (responsable.email) {
                try {
                    const { emailRecordatorioComprasPorAutorizar } = await import('../../../helpers/emails.js');
                    await emailRecordatorioComprasPorAutorizar({
                        correoResponsable: responsable.email,
                        nombreResponsable: responsable.name,
                        CantidadFacturasPendientes: responsable.cantidad
                    });
                    console.log(`✅ Correo enviado a ${responsable.email} - ${responsable.cantidad} pendientes`);
                    correosEnviados++;
                } catch (error) {
                    console.error(`❌ Error enviando correo a ${responsable.email}:`, error.message);
                    errores.push({
                        email: responsable.email,
                        error: error.message
                    });
                }
            } else {
                console.log(`⚠️ Responsable ${responsable.name} no tiene email configurado`);
            }
        }

        console.log(`📧 Resumen: ${correosEnviados} correos enviados de ${resultado.length} responsables`);

        res.status(200).json({
            message: 'Envío de correos programados ejecutado',
            resumen: {
                totalResponsables: resultado.length,
                correosEnviados,
                errores: errores.length
            },
            detalles: {
                responsables: resultado.map(r => ({
                    name: r.name,
                    email: r.email,
                    cantidad: r.cantidad
                })),
                errores
            }
        });

    } catch (error) {
        console.error('❌ Error en ejecutarEnvioCorreosProgramados:', error);
        handleHttpError(res, 'Error ejecutando envío de correos programados');
    }
};

export {
    getComprasReportadas,
    getCompraReportadaJson,
    getCompraReportada,
    createCompraReportada,
    updateCompraReportada,
    deleteCompraReportada,
    bulkUpsertComprasReportadas,
    conciliarCompras,
    getComprasPorAutorizar,
    ejecutarEnvioCorreosProgramados
}