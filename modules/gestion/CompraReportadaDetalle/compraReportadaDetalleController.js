import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import CompraReportadaDetalle from "./compraReportadaDetalle.js";

const entity = "CompraReportadaDetalle";

// Obtener todos los detalles
const getDetalles = async (req, res) => {
    try {
        const registros = await CompraReportadaDetalle.findAll({
            where: { estado: true }
        });
        res.json(registros);
    } catch (error) {
        handleHttpError(res, `No se pudieron cargar los ${entity}s`);
    }
};

// Obtener un detalle específico
const getDetalle = async (req, res) => {
    try {
        req = matchedData(req);
        const { id } = req;
        const data = await CompraReportadaDetalle.findOne({
            where: {
                id: id,
                estado: true
            }
        });

        if (!data) {
            return res.status(404).json({
                message: `${entity} no encontrado(a) o inactivo(a)`
            });
        }

        res.status(200).json(data);
    } catch (error) {
        handleHttpError(res, `Error al traer ${entity}`);
    }
};

// Obtener detalles por compra reportada
const getDetallesByCompra = async (req, res) => {
    try {
        const { compraReportadaId } = req.params;
        
        if (!compraReportadaId) {
            return res.status(400).json({
                message: "El ID de la compra reportada es requerido"
            });
        }

        const detalles = await CompraReportadaDetalle.findAll({
            where: {
                compraReportadaId: compraReportadaId,
                estado: true
            }
        });

        res.status(200).json(detalles);
    } catch (error) {
        handleHttpError(res, `Error al traer los ${entity}s`);
    }
};

// Crear nuevo detalle
const createDetalle = async (req, res) => {
    try {
        const body = matchedData(req);
        const data = await CompraReportadaDetalle.create(body);
        res.status(201).json(data);
    } catch (error) {
        handleHttpError(res, `Error al crear ${entity}`);
    }
};

// Actualizar detalle
const updateDetalle = async (req, res) => {
    try {
        const { id, ...body } = matchedData(req);
        const data = await CompraReportadaDetalle.update(body, {
            where: { id }
        });

        if (data[0] === 0) {
            return res.status(404).json({
                message: `${entity} no encontrado(a)`
            });
        }

        res.status(200).json({
            message: `${entity} actualizado(a) correctamente`
        });
    } catch (error) {
        handleHttpError(res, `Error al actualizar ${entity}`);
    }
};

// Eliminar detalle (soft delete)
const deleteDetalle = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const data = await CompraReportadaDetalle.update(
            { estado: false },
            { where: { id } }
        );

        if (data[0] === 0) {
            return res.status(404).json({
                message: `${entity} no encontrado(a)`
            });
        }

        res.status(200).json({
            message: `${entity} eliminado(a) correctamente`
        });
    } catch (error) {
        handleHttpError(res, `Error al eliminar ${entity}`);
    }
};

export {
    getDetalles,
    getDetalle,
    getDetallesByCompra,
    createDetalle,
    updateDetalle,
    deleteDetalle
}; 