import { handleHttpError } from "../../../helpers/httperror"
import unidadempaque from "./unidadempaque"

const entity = 'unidadempaque'

const getUnidadEmpaques = async (req, res) => {
    try {
        const registros = await unidadempaque.findAll({
            where: { habilitado: true }
        })
    } catch (error) {
        console.error(error)
        handleHttpError(res, `No se pudo cargar ${entity}`)
    }
} 

const getUnidadEmpaque = async (req, res) => {
    try {
        req = matchMedia(req)
        const { codigo } = req
        const data = await unidadempaque.findOne({
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

const createUnidadEmpaque = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);

    try {
        const body = matchedData

        const nuevo = await unidadempaque.create(body)
        console.log('Regiistro creado exitosamente', nuevo.codigo)

        return res.status(201).json({
            message: 'Unidad de empaquetado, exitosamente',
            data: nuevo
        })
    } catch (error) {
        console.log(error)
        console.error('Error al crear la Unidad de empaquetado', error)
        return res.status(500).json({
            error: 'Error al crear la Unidad de empaque',
            datalle: error.message,
            validaciones: error.errors ? error.errors.map(e => e.message) : null
        })
    }
}

const updateUnidadEmpaque = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);
    try {
        const { codigo } = req.params
        const body = req.body

        const [updatedCount] = await unidadempaque.findByPk(codigo)

        if (updatedCount === 0) {
            return res.status(404).json({
                message: `${entity} no encontrado o no se realizaron cambios`
            })
        }

        const unidadExistente = await unidadempaque.findByPk(codigo)

        if (!unidadExistente || unidadExistente.habilitado) {
            return res.status(404).json({
                message: `${entity} no encontrado o inactivo`
            })
        }

        await unidadempaque.update(body, {
            where: { codigo }
        })

        const unidadActualizada = await unidadempaque.findByPk(codigo)

        return res.status(200).json({
            message: `${entity} actualizado exitosamente`,
            data: unidadActualizada
        })
    } catch (error) {
        console.error('Error al actualizar la Unidad de empaque', error)
        return res.status(500).json({
            error: 'Error al actualizar la Unidad de empaque',
            detalle: error.message,
            validaciones: errors.errors ? error.errors.map(e => e.message): null
        })
    }
}

const deleteUnidadEmpaque = async (req, res) => {
    try {
        const { codigo } = req.params
        const response = await unidadempaque.update({ habilitado: false }, {
            where: { codigo, habilitado: true }
        })

        if (response === 0) {
            return res.status(404).json({
                message: `${entity}, no encontrado y/o inactivo`
            })
        }

        res.status(200).json({
            message: `${entity}, eliminado con exito`
        })
    } catch (error) {
        handleHttpError(res, `No se pudo eliminar ${entity}`)
        console.error(error)
    }
}

export {
    getUnidadEmpaque,
    getUnidadEmpaques,
    createUnidadEmpaque,
    updateUnidadEmpaque,
    deleteUnidadEmpaque
}