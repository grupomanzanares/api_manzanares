import { matchedData } from "express-validator";
import tarifasIVA from "./tarifaiva";
import { handleHttpError } from "../../../helpers/httperror";

const entity = 'tarifasIVA'

const getTarifasIva = async (req, res) => {
    try {
        const registros = await tarifasIVA.findAll({
            where: { habilitado: true }
        })
    } catch (error) {
        console.error(error)
        handleHttpError(res, `No se pudo cargar ${entity}`)
    }
}

const getTarifaIva = async (req, res) => {
    try {
        req = matchedData(req)
        const { codigo } = req
        const data = await tarifasIVA.findOne({
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

const createTarifaIva = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);

    try {
        const body = matchedData(req)

        const nuevo = await tarifasIVA.create(body)
        console.log('Registro creado exisamente:', nuevo.codigo)

        return res.status(202).json({
            message: 'Tarifa IVA creada exitosamente',
            data: nuevo
        })
    } catch (error) {
        console.log(error)
        console.error('Error al crear la Tarifa IVA', error)
        return res.status(500).json({
            error: 'Error al crear la Tarifa IVA',
            datalle: error.message,
            validaciones: error.errors ? error.errors.map(e => e.message) : null
        })
    }
}

const updateTarifaIva = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);

    try {
        const { codigo } = req.params
        const body = req.body

        const [updatedCount] = await tarifasIVA.findByPk(codigo)

        if (updatedCount === 0) {
            return res.status(404).json({
                message: `${entity} no encontrado o no se realizaron cambios`
            })
        }

        const tarifaivaExistente = await tarifasIVA.findByPk(codigo)

        if (!tarifaivaExistente || !tarifaivaExistente.habilitado) {
            return res.status(404).json({
                message: `${entity} no encontrado o inactivo`
            })
        }

        await tarifasIVA.update(body, {
            where: { codigo }
        })

        const tarifaivaActualizada = await tarifasIVA.findByPk(codigo)

        return res.status(200).json({
            message: `${entity} actualizado exitosamente`,
            data: tarifaivaActualizada
        })
    } catch (error) {
        console.error('Error al actualizar la tarifa IVA', error)
        return res.status(500).json({
            error: 'Error al actualizar la tarifa IVA',
            detalle: error.message,
            validaciones: error.errors ? error.errors.map(e => e.message) : null
        })
    }
}

const deleteTarifaIva = async (req, res) => {
    try {
        const { codigo } = req.params
        const response = await tarifasIVA.update({ habilitado: false }, {
            where: { codigo, habilitado: true }
        })

        if (response === 0) {
            return res.status(404).json({
                message: `${entity}, no encontrado y/o inactivo `
            })
        }

        res.status().json({
            message: `${entity}, elimminados con exito`
        })
    } catch (error) {
        handleHttpError(res, `No se pudo eliminar ${entity}`)
        console.error(error)
    }    
}

export {
    getTarifaIva,
    getTarifasIva,
    createTarifaIva,
    updateTarifaIva,
    deleteTarifaIva
}