import { body, check, validationResult } from "express-validator";

const validateCreateRegistroDian = [

    body('emisor').exists().withMessage("El emisor  es obligatorio").notEmpty().isLength({ min: 5, max: 15 }),
    body('nombreEmisor').exists().notEmpty().isLength({ min: 4, max: 100 }),
    body('empresa').exists().withMessage("La empresa es obligatorio").notEmpty().isLength({ min: 5, max: 15 }),
    body('tipo').exists().withMessage("El tipo de documento de compra es obligatorio").notEmpty().isLength({ min: 1, max: 30 }),
    body('numero').exists().withMessage("La factura es obligatorio").notEmpty().isLength({ min: 1, max: 15 }),
    body('fecha').exists().withMessage('La fecha es obligatoria'),
    body('cufe').exists().withMessage('La fecha es obligatoria'),
    body('valor').exists().withMessage('El valor es obligatorio').isNumeric().withMessage('El valor debe ser un número válido').custom(value => value > 0).withMessage('El valor debe ser mayor a cero'),
    body('user').optional().isString().withMessage('El usuario debe ser una cadena de texto'),
    body('userMod').optional().isString().withMessage('El usuarioMod debe ser una cadena de texto'),


    (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            res.status('403')
            res.send({ errors: error.array() })
        }
    }
];

const validateGetRegistroDian = [
    check('id').exists().notEmpty(),

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

export {
    validateCreateRegistroDian,
    validateGetRegistroDian
};
