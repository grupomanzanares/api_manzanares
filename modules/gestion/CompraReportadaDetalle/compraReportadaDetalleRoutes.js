
import express from 'express';

import { body, param } from "express-validator";
//import { validateRequest } from "../../../middlewares/validateRequest.js";
import {
    getDetalles,
    getDetalle,
    getDetallesByCompra,
    createDetalle,
    updateDetalle,
    deleteDetalle
} from "./compraReportadaDetalleController.js";

const router = express.Router();

// Validaciones
const createValidation = [
    body("numero").notEmpty().withMessage("El número es requerido"),
    body("numeroItem").isNumeric().withMessage("El número de item debe ser un número"),
    body("ProductoProveedor").notEmpty().withMessage("El producto del proveedor es requerido"),
    body("nombreProductoProveedor").notEmpty().withMessage("El nombre del producto del proveedor es requerido"),
    body("nombreProducto").notEmpty().withMessage("El nombre del producto es requerido"),
    body("cantidad").isNumeric().withMessage("La cantidad debe ser un número"),
    body("costoUnitario").isNumeric().withMessage("El costo unitario debe ser un número"),
    body("poriva").isNumeric().withMessage("El porcentaje de IVA debe ser un número"),
    body("costoTotal").isNumeric().withMessage("El costo total debe ser un número"),
    body("user").notEmpty().withMessage("El usuario es requerido"),
    validateRequest
];

const updateValidation = [
    param("id").isNumeric().withMessage("ID inválido"),
    body("numero").optional(),
    body("numeroItem").optional().isNumeric(),
    body("ProductoProveedor").optional(),
    body("nombreProductoProveedor").optional(),
    body("nombreProducto").optional(),
    body("producto").optional(),
    body("CentroDeCosto").optional(),
    body("cantidad").optional().isNumeric(),
    body("costoUnitario").optional().isNumeric(),
    body("poriva").optional().isNumeric(),
    body("costoTotal").optional().isNumeric(),
    body("userMod").notEmpty().withMessage("El usuario modificador es requerido"),
    validateRequest
];

// Rutas
router.get("/", apiAuth, getDetalles);
router.get("/:id", apiAuth, getDetalle);
router.get("/compra/:compraReportadaId", apiAuth,getDetallesByCompra);
router.post("/", apiAuth, createDetalle);
router.put("/:id", apiAuth,updateValidation, updateDetalle);
//router.delete("/:id", apiAuth, validateRequest, deleteDetalle);

export default router; 