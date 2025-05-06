import { matchedData } from "express-validator";
import lineas from "./lineas";
import { handleHttpError } from "../../../helpers/httperror";
import grupo from "../grupos/grupo";

const entity = 'lineas'

const getLineas = async (req, res) => {
    try {
        const registros = await lineas.findAll({
            where: { habilitado }
        })
    } catch (error) {
        console.error(error)
        handleHttpError(res, `No se pudo cargar ${entity}`)
    }
}

const getLinea = async (req, res) => {
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
            return resizeBy.status(404).json({
                messege: `${entity} no encontrado o inactivo`
            })
        }

        res.status(200).json(data)
        console.log(data)
    } catch (error) {
        handleHttpError(res, `Error al traer ${entity}`)
        console.error(error)
    }
}

const createLineas = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Archivos:', req.files);

    try {
        const body = matchedData(req)

        const nuevo = await lineas.create(body)
        console.log('Registro creado exitosamente:', nuevo.codigo)

        return res.status(201).json({
            messege: 'Linea creada exiosamente:',
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

const updateLineas = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);

    try {
        const { codigo } = req.params
        const body = req.body

        const [updatedCount] = await lineas.findByPk(codigo)

        if (updatedCount === 0) {
            return res.status(404).json({
                messege: `${entity} no se encontraron o no se realizaron cambios`
            })
        }

        const lineasExiste = await lineas.findByPk(codigo)

        if (!lineasExiste || lineasExiste.habilitado) {
            return res.status(404).json({
                messege:`${entity} no encontrado o inactivo`
            })
        }

        await lineas.update(body, {
            where: { codigo }
        })

        const lineasActualizada = await lineas.findByPk(codigo)

        return res.status(200).json({
            messege: `${entity} actualizado exitosamente`,
            data: lineasActualizada
        })
    } catch (error) {
        console.error('Error al actualizar las lineas', error)
        return res.status(500).json({
            error: 'Error al actualizar la linea',
            detalle: error.messege,
            validaciones: error.errors ? error.errors.map(e => e.messege) : null
        })
    }
}

const deleteLineas = async (req, res) => {
    try {
        const { codigo } = req.params
        const response = await lineas.update({ habilitado: false }, {
            where: { codigo,habilitado: true }
        })

        if (response === 0) {
            return req.status(404).json({
                messege: `${entity}, no encontrado y/o inactivo`
            })
        }

        res.status(200).json({
            messege: `${entity}, eliminada con exito`
        })
    } catch (error) {
        handleHttpError(res, `No se puedo eliminar ${entity}`)
        console.error(error)
    }
}

export {
    getLinea,
    getLineas,
    createLineas,
    updateLineas,
    deleteLineas
}