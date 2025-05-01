import { matchedData } from "express-validator";
import grupo from "./grupo"
import { handleHttpError } from "../../../helpers/httperror";

const entity = 'grupos'

const getGrupos = async (req, res) => {
    try {
        const registros = await grupo.findAll({
            where: { habilitado: true }
        })
    } catch (error) {
        console.error(error);
        handleHttpError(res, `No se pudo cargar ${entity}s`);
    }
}

const getGrupo = async (req, res) => {
    try {
        req = matchedData(req)
        const { codigo } = req
        const data = await grupo.findOne({
            where: {
                codigo: codigo,
                habilitado: true
            }
        })
        if (!data) {
            return res.status(404).json({
                messege: `${entity} no encontrado(a) ó inactivo (a)`
            })
        }

        res.status(200).json(data)
        console.log(data)
    } catch (error) {
        handleHttpError(res, `Error al traer ${entity}`)
        console.error(error)
    }
}

const createGrupos = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Archivos:', req.files);

    try {
        const body = matchedData(req)

        const nuevo = await grupo.create(body)
        console.log('Registro creado exitosamente:', nuevo.codigo)

        return res.status(201).json({
            messege: 'Grupo creada exitosamente',
            data: nuevo
        })
    } catch (error) {
        console.log(error)
        console.error('Error al crear el grupo', error)
        return res.status(500).json({
            error: 'Error al crear el grupo',
            detalle: error.messege,
            validaciones: error.errors ? error.errors.map(e => e.messege) : null
        });
    }
}

const updateGrupo = async (req, res) => {
    
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);
    try {
        const { codigo } = req.params
        const body = req.body

        const [updatedCount] = await grupo.findByPk(codigo)

        if (updatedCount === 0) {
            return res.status(404).json({
                message: `${entity} no encontrado o no se realizaron cambios`
            })
        }

        const grupoExistente = await grupo.findByPk(codigo)

        if (!grupoExistente || !grupoExistente.habilitado) {
            return res.status(404).json({
                message: `${entity} no encontrado o inactivo`
            })
        }

        await grupo.update(body, {
            where: { codigo }
        });

        const grupoActualizado = await grupo.findByPk(codigo)

        return res.status(200).json({
            message: `${entity} actualizado exitosamente`,
            data: grupoActualizado
        })
    } catch (error) {
        console.error('Error al actualizar el grupo', error)
        return res.status(500).json({
            error: 'Error al actualizar el grupo',
            detalle: error.message,
            validaciones: error.errors ? error.errors.map(e => e.message) : null
        })
    }
}

const deleteGrupo = async (req, res) => {
    try {
        const { codigo } = req.params
        const response = await grupo.update({ habilitado: false }, {
            where: { codigo, habilitado: true }
        })

        if (response === 0) {
            return res.status(404).json({
                message: `${entity} , no encontrado(a) y/o inactivo(a)`
            })
        }

        res.status(200).json({
            message: `${entity} , eliminado con exito`
        })
    } catch (error) {
        handleHttpError(res, `No se pudo eliminar ${entity} `)
        console.error(error)
    }
}

export {
    getGrupo,
    getGrupos,
    createGrupos,
    updateGrupo,
    deleteGrupo
}