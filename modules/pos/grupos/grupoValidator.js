import { body, check, validationResult } from "express-validator";

const validateCreateGrupo = [
    body('codiigo').exists().withMessage("El codigo es obligatorio").notEmpty().isLength({ min: 5, max: 100 }),
    body('nombre').exists().withMessage("El nombre es obligatorio").notEmpty().isLength({ min: 3, max: 30 }),
    
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

const validateGetGrupo = [
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
    validateCreateGrupo,
    validateGetGrupo
}