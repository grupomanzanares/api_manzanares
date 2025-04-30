import { body, check, validationResult } from "express-validator";

const validateCreateUnidadMedida = [
    body('codiigo').exists().withMessage("El codigo es obligatorio").notEmpty().isLength({ min: 5, max: 100 }),
    body('nombre').exists().withMessage("El nombre es obligatorio").notEmpty().isLength({ min: 3, max: 30 }),
    body('unidadInternacional').exists().withMessage("La Unidad Internacional de medida es obligatoria").notEmpty().isLength({ min:2, max: 5 }),

    (req, res, next) => {
        try {
            validationResult(req).throw();
            return next()
        } catch (error) {
            res.status('403')
            res.send({ errors: error.array() })
        }
    }
]

const validateGetUnidadMedida = [
    check('codigo').exists().notEmpty(),

    (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            res.status('403')
            req.send({ errors: error.array() })
        }
    }
]

export {
    validateCreateUnidadMedida,
    validateGetUnidadMedida
}