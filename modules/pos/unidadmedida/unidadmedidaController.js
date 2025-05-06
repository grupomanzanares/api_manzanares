import { matchedData } from "express-validator";
import unidadmedida from "./unidadmedida";
import { handleHttpError } from "../../../helpers/httperror";

const entity = 'unidadMedida'

const getUnidadesmedida = async (req, res) => {
    try {
        const registros = await unidadmedida.findAll({
            where: { habilitado: true }
        })
    } catch (error) {
        console.error(error)
        handleHttpError(res, `No se pudo cargar ${entity}`)
    }
}

const getUnidadmedida = async (req, res) => {
    try {
        req = matchedData(req)
        const data = await unidadmedida.findOne({
            where: {
                codigo: codigo,
                habilitado: true
            }
        })
        if (!data) {
            return res.status(404).json({
                message: `${entity} no encontrado o inactivo`
            })
        }

        res.status(200).json(data)
        console.log(data)
    } catch (error) {
        handleHttpError(res, `Error al traer ${entity}`)
        console.error(error)
    }
}

const createUnidadmedida = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);

    try {
        const body = matchedData(req)

        const nuevo = await unidadmedida.create(body)
        console.log('Registro creado exitosamente:', nuevo.codigo)

        return res.status(201).json({
            message: 'Unidad de medida creada exitosamente',
            data: nuevo
        })
    } catch (error) {
        console.log(error)
        console.error('Error al crear la unidad de medida', error)
        return res.status(500).json({
            error: 'Error al crear la unidad de medida',
            detalle: error.message,
            validaciones: error.errors ? error.errors.map(e => e.message) : null
        })
    }
}

const updateUnidadmedida = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);

    try {
        const { codigo } = req.params
        const body = req.body

        const [updatedCount] = await unidadmedida.findByPk(codigo)

        if (updatedCount === 0) {
            return res.status(404).json({
                message: `${entity} no encontrado o no se realizaron cambios`
            })
        }

        const unidadmedidaExistente = await unidadmedida.findByPk(codigo)

        if (!unidadmedidaExistente || !unidadmedidaExistente.habilitado) {
            return res.status(404).json({
                message: `${entity} no encontrado o inactivo`
            })
        }

        await unidadmedida.update(body, {
            where: { codigo }
        })

        const unidadActualizada = await unidadmedida.findByPk(codigo)

        return res.status(200).json({
            message: `${entity} actualizado exitosamente`,
            data: unidadActualizada
        })
    } catch (error) {
        console.error('Error al actualizar la Unidad de medida', error)
        return res.status(500).json({
            error: 'Error al actualizar la unidad de medida',
            detalle: error.message,
            validaciones: error.errors ? error.errors.map(e => e.message) : null
        })
    }
}

const deleteUnidadmedida = async (req, res) => {
    try {
        const { codigo } = req.params
        const response = await unidadmedida.update({ habilitado: false }, {
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
    getUnidadesmedida,
    getUnidadmedida,
    createUnidadmedida,
    updateUnidadmedida,
    deleteUnidadmedida
}