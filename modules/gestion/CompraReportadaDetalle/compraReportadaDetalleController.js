import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import CompraReportadaDetalle from "./compraReportadaDetalle.js";

const entity = "CompraReportadaDetalle";

// Obtener todos los detalles
const getDetalles = async (req, res) => {
    try {
        const registros = await CompraReportadaDetalle.findAll({
        
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
                id: id
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
                compraReportadaId: compraReportadaId
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
    const { compraReportadaId } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "No hay items para actualizar" });
    }

    try {
        // Validar que todos los items correspondan al compraReportadaId de la ruta
        const valid = items.every(item => item.compraReportadaId == compraReportadaId);
        if (!valid) {
            return res.status(400).json({ message: "Todos los items deben tener el mismo compraReportadaId que la URL" });
        }

        // Actualizar cada item en paralelo
        await Promise.all(items.map(async (item) => {
            const { id, CentroDeCosto } = item;
            if (!id || !CentroDeCosto) return;

            await CompraReportadaDetalle.update(
                { CentroDeCosto },
                { where: { id, compraReportadaId } }
            );
        }));

        return res.json({ message: "Centros de costo actualizados correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error actualizando centros de costo", error });
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