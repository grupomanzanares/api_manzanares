import { body, check, validationResult } from "express-validator";

const validateCreateProducto = [
    body('codigo').exists().withMessage("El codigo es obligatorio").notEmpty().isLength({ min: 5, max: 100 }),
    
]