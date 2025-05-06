import { body, check, validationResult } from "express-validator";

const validateCreateProducto = [
    body('codigo').exists().withMessage("El codigo es obligatorio").notEmpty().isLength({ min: 5, max: 100 }),
    body('descripcion').exists().withMessage("El nombre es obligatorio").notEmpty().isLength({ min: 3, max: 100 }),

    (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            res.status('403')
            res.send({ errors: error.array() })
        }
    }
]

const validateGetProducto = [
    check('codigo').exists().notEmpty(),

    (req, res, next) => {
        try {
            validationResult(req).throw
            return next()
        } catch (error) {
            res.status('403')
            res.send({ errors: error.array() })
        }
    }
]

export {
    validateCreateProducto,
    validateGetProducto
}