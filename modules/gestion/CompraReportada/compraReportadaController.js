import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import { compraReportada, comprasEstado, comprasTipo, empresa, User } from "../gestionRelations.js";
import { emailNotAutorizacion } from "../../../helpers/emails.js";
import { ccosto } from "../../maestras/masterRelations.js";
 
 


const entity = "compraReportada"

const getComprasReportadas = async (req, res) => {
    try {
        const registros = await compraReportada.findAll({
            where: { habilitado: true },
            include: [
                {
                    model: comprasTipo ,
                    attributes: ['id', 'nombre'], 
                },
                {
                    model: comprasEstado ,
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

        
 
        // Enriquecer con nombre del centro de costo
        const resultado = registros.map(registro => {
            const codigoCcosto = registro.ccosto;
            const empresaId = registro.empresaInfo?.id;

            // Buscar centro de costo relacionado
            const ccostoRelacionado = centrosCosto.find(c =>
                String(c.codigo) === String(codigoCcosto) && c.empresaId == empresaId
            );

            return {
                ...registro.toJSON(),
                ccostoNombre: ccostoRelacionado?.nombre || null
            };
        });


        

        res.json(registros)
    } catch {
        handleHttpError(res, `No se pudo cargar ${entity} s`);
    }
}

const getCompraReportada = async (req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await compraReportada.findOne({
            where: {
                id: id,
                habilitado: true
            }
        })
        if (!data) {
            return res.status(404).json({
                message: `${entity} no encontrado(a) ó inactivo (a) `
            })
        }
        res.status(200).json(data);
        console.log(data)
    } catch (error) {
        handleHttpError(res, `Error al traer ${entity}  `)
        console.error(error)
    }
}



const createCompraReportada = async (req, res) => {


    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Archivos:', req.files);


    try {
        const body = matchedData(req)

        // Verificar si hay un archivo de imagen y obtener su ruta
        const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

        const response = await compraReportada.create({
            ...body,
            logo: logoPath, // Guardar la ruta en la BD
        });
        res.send(response)
    } catch (error) {
        console.log(error)
        handleHttpError(res, `No se pudo crear . ${entity} `)
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
        if (req.file) {
            body.urlPdf = `/uploads/${req.file.filename}`;
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
            nombreResponsable: usuarioResponsable?.name
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




const bulkUpsertComprasReportadas_ = async (req, res) => {
    const registros = req.body;
    if (!Array.isArray(registros)) {
        return res.status(400).json({ error: 'El cuerpo debe ser un array de objetos.' });
    }
    const resultados = {
        creados: [],
        actualizados: [],
        errores: [],
    };

    for (const item of registros) {
        try {
            const { emisor, numero } = item;
            if (!emisor || !numero) {
                resultados.errores.push({ item, error: 'Faltan campos obligatorios: emisor o numero' });
                continue;
            }

            const existente = await compraReportada.findOne({
                where: { emisor, numero }
            });

            if (existente) {
                if (existente.estadoId === 1) {
                    await existente.update(item);
                    resultados.actualizados.push({ emisor, numero });
                } else {
                    resultados.errores.push({ emisor, numero, error: 'No se puede actualizar porque estadoId no es 1' });
                }
            } else {
                await compraReportada.create(item);
                resultados.creados.push({ emisor, numero });
            }

        } catch (error) {
            resultados.errores.push({ item, error: error.message });
        }
    }

    return res.status(200).json({
        mensaje: 'Proceso de inserción/actualización completado',
        resultados
    });
};



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
            console.log(`Procesando item ${i+1}/${registros.length}:`, item);
            
            // Validación de campos requeridos
            const { emisor, numero } = item;
            if (!emisor || !numero) {
                console.log(`Error en item ${i+1}: Faltan campos obligatorios`);
                resultados.errores.push({ 
                    item, 
                    error: 'Faltan campos obligatorios: emisor o numero' 
                });
                continue;
            }


            // Formatear el valor decimal correctamente
            if (item.valor) {
                // Eliminar todos los puntos de los separadores de miles y reemplazar la coma por punto si es necesario
                item.valor = item.valor.toString().replace(/\./g, '').replace(',', '.');
                            
                // Convertir a número para asegurarse de que es un valor numérico válido
                item.valor = parseFloat(item.valor);
                            
                // Verificar si es un número válido
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
            
            console.log(`Item ${i+1}: existente =`, existente ? 'Sí' : 'No');

            if (existente) {
                console.log(`Item ${i+1}: estadoId =`, existente.estadoId);
                if (existente.estadoId === 1) {
                    // Asegurarse de que todos los campos necesarios estén en item
                    console.log(`Item ${i+1}: Actualizando...`);
                    await existente.update(item);
                    resultados.actualizados.push({ emisor, numero });
                    console.log(`Item ${i+1}: Actualizado con éxito`);
                } else {
                    console.log(`Item ${i+1}: No actualizable por estadoId`);
                    resultados.errores.push({ 
                        emisor, 
                        numero, 
                        error: 'No se puede actualizar porque estadoId no es 1' 
                    });
                }
            } else {
                // Garantizar que todos los campos requeridos del modelo estén presentes
                console.log(`Item ${i+1}: Creando nuevo registro...`);
                try {
                    const nuevoRegistro = await compraReportada.create(item);
                    console.log(`Item ${i+1}: Creado con éxito, ID:`, nuevoRegistro.id);
                    resultados.creados.push({ emisor, numero, id: nuevoRegistro.id });
                } catch (creationError) {
                    console.error(`Item ${i+1}: Error al crear:`, creationError);
                    resultados.errores.push({ 
                        item, 
                        error: `Error al crear: ${creationError.message}`,
                        detalles: creationError.errors ? creationError.errors.map(e => e.message) : null
                    });
                }
            }
        } catch (error) {
            console.error(`Error general en item ${i+1}:`, error);
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

export {
    getComprasReportadas,
    getCompraReportada,
    createCompraReportada,
    deleteCompraReportada,
    updateCompraReportada,
    bulkUpsertComprasReportadas
}