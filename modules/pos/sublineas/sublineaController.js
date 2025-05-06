import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror";
import sublineas from "./sublinea";

const entity = 'sublineas'

const getSubLineas = async (req, res) => {
    try {
        const registros = await sublineas.findAll({
            where: { habilitado: true }
        })
    } catch (error) {
        console.error(error)
        handleHttpError(res, `No se pudo cargar ${entity}`)
    }
}

const getSubLinea = async (req, res) => {
    try {
        req = matchedData(req)
        const { codigo } = req
        const data = await sublineas.findOne({
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

const createSubLineas = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);

    try {
        const body = matchedData(req) 

        const nuevo = await sublineas.create(body)
        console.log('Registro creado exitosamente:', nuevo.codigo)

        return res.status(200).json({
            message: 'Sub linea creada exitosamente',
            data: nuevo
        })
    } catch (error) {
        console.log(error)
        console.error('Error al crear la Sub linea:', error)
        return res.status(500).json({
            error: 'Error al crear la sub linea',
            detalle: error.message,
            validaciones: error.errors ? error.errors.map(e => e.message) : null
        })
    }
}

const updateSubLineas = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);

    try {
        const { codigo } = req.params
        const body = req.body

        const [updatedCount] = await sublineas.findByPk(codigo)

        if (updatedCount === 0) {
            return res.status(404).json({
                message: `${entity} no encontrado o no se realizaron cambios`
            })
        }

        const sublineasExistente = await sublineas.findByPk(codigo)

        if (!sublineasExistente || !sublineasExistente.habilitado) {
            return res.status(404).json({
                message: `${entity} no encontrado o inactivo`
            })
        }

        await sublineas.update(body, {
            where: { codigo }
        })

        const sublineaActualizada = await sublineas.findByPk(codigo)

        return res.status(200).json({
            message: `${entity} actualizado exitosamente`,
            data: sublineaActualizada
        })
    } catch (error) {
        console.error('Error al actualizar la Sub linea', error)
        return res.status(500).json({
            error: 'Error al actualizar al actualizar la Sub linea',
            detalle: error.message,
            validaciones: error.errors ? error.errors.map(e => e.message) : null
        })
    }
}

const deleteSubLineas = async (req, res) => {
    try {
        const { codigo } = req.params
        const response = await sublineas.update({ habilitado: false }, {
            where: { codigo, habilitado: true }
        })

        if (response === 0) {
            return res.status(404).json({
                message: `${entity}, eliminado con exito`
            })
        }
    } catch (error) {
        handleHttpError(res, `No se pudo eliminar ${entity}`)
        console.error(error)
    }
}

export {
    getSubLinea,
    getSubLineas,
    createSubLineas,
    updateSubLineas,
    deleteSubLineas
}