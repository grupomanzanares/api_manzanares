import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import { compraReportada, comprasEstado, comprasTipo, User } from "../gestionRelations.js";
 
 


const entity = "compraReportada"

const getComprasReportadas = async (req, res) => {
    try {
        const registros = await compraReportada.findAll({
            where: { habilitado: true },
            include: [
                {
                    model: comprasTipo ,
                    attributes: ["nombre"]
                },
                ,
                {
                    model: comprasEstado,
                    attributes: ["nombre"]
                }
            ]
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
    try {
        const { id } = req.params

        const body = req.body


        const response = await compraReportada.update(body, {
            where: { id }
        })

        if (response[0] === 0) {
            return res.status(404).json({
                message: ` ${entity} No encontrado o No se realizaron cambios `
            })
        }

        const updateRegistro = await compraReportada.findByPk(id);

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
                await existente.update(item);
                resultados.actualizados.push({ emisor, numero });
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

export {
    getComprasReportadas,
    getCompraReportada,
    createCompraReportada,
    deleteCompraReportada,
    updateCompraReportada,
    bulkUpsertComprasReportadas
}