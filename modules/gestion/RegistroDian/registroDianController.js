import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import registroDian from "./registroDian.js";
import { empresa } from "../gestionRelations.js";


 

const entity = "registroDian"

const getRegistrosDian = async (req, res) =>{
        try {
            const registros = await registroDian.findAll({
                where: {habilitado: true}
            });
            res.json(registros)
        }catch{
            handleHttpError(res, `No se pudo cargar ${entity} s` ); 
        }
    }

const getRegistroDian = async (req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await registroDian.findOne({
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



const createRegistroDian = async (req, res) => {


    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);



    try {
        const body = matchedData(req)

        // Verificar si hay un archivo de imagen y obtener su ruta
        const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

        const response = await registroDian.create({
            ...body,
            logo: logoPath, // Guardar la ruta en la BD
        });
        res.send(response)
    } catch (error) {
        console.log(error)
        handleHttpError(res, `No se pudo crear . ${entity} `)
    }
}


const updateRegistroDian = async (req, res) => {


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
        const [updatedCount] = await registroDian.update(body, {
            where: { id }
        });

        if (updatedCount === 0) {
            return res.status(404).json({
                message: `${entity} no encontrado o no se realizaron cambios`
            });
        }

        const updateRegistro = await registroDian.findByPk(id);


        res.status(200).json({
            message: ` ${entity} actualizado correctamente `,
            data: updateRegistro
        });






    } catch (error) {
        handleHttpError(res, `No se pudo actualizar ${entity} `)
        console.error(error)
    }
}


const deleteRegistroDian = async (req, res) => {
    try {
        const { id } = req.params
        const response = await registroDian.update({ habilitado: false }, {
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


const bulkUpsertRegistrosDian = async (req, res) => {
    const registros = req.body;

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
            const { emisor, numero } = item;

            if (!emisor || !numero) {
                resultados.errores.push({ 
                    item, 
                    error: 'Faltan campos obligatorios: emisor o numero' 
                });
                continue;
            }

            const existente = await registroDian.findOne({ where: { emisor, numero } });

            if (existente) {
                // Ejemplo si deseas permitir actualización con alguna condición
                if (existente.habilitado === true) {
                    await existente.update(item);
                    resultados.actualizados.push({ emisor, numero });
                } else {
                    resultados.errores.push({ 
                        emisor, 
                        numero, 
                        error: 'No se puede actualizar porque el registro no está habilitado' 
                    });
                }
            } else {
                try {
                    const nuevo = await registroDian.create(item);
                    resultados.creados.push({ emisor, numero, id: nuevo.id });
                } catch (creationError) {
                    resultados.errores.push({ 
                        item, 
                        error: `Error al crear: ${creationError.message}`,
                        detalles: creationError.errors ? creationError.errors.map(e => e.message) : null
                    });
                }
            }
        } catch (error) {
            resultados.errores.push({ 
                item, 
                error: error.message,
                stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
            });
        }
    }

    return res.status(200).json({
        mensaje: 'Proceso completado',
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
    getRegistrosDian,
    getRegistroDian,
    createRegistroDian,
    deleteRegistroDian,
    updateRegistroDian,
    bulkUpsertRegistrosDian
}