import { body, check, validationResult } from "express-validator";

const validateCreateCompraReportada = [

    body('emisor').exists().withMessage("El emisor  es obligatorio")
        .notEmpty().isLength({ min: 5, max: 15 }),
    body('nombreEmisor').exists().notEmpty().isLength({ min: 4, max: 100 }),
    body('empresa').exists().withMessage("La empresa es obligatorio")
        .notEmpty().isLength({ min: 5, max: 15 }),
    body('tipo').exists().withMessage("El tipo de documento de compra es obligatorio")
        .notEmpty().isLength({ min: 1, max: 30 }),
    body('numero').exists().withMessage("La factura es obligatorio")
        .notEmpty().isLength({ min: 1, max: 15 }),
    body('fecha')
        .exists().withMessage('La fecha es obligatoria'),
    body('cufe')
        .exists().withMessage('El cufe es obligatorio'),

    body('valor')
        .exists().withMessage('El valor es obligatorio'),


    body('observacionResponsable').optional(),
    body('ccosto').optional(),
    body('estadoId').optional(),
    body('observacionContable').optional(),
    body('observacionTesoreria').optional(),
    body('recibido').optional(),




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

const validateGetCompraReportada = [
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
    validateCreateCompraReportada,
    validateGetCompraReportada,
    validateUpdateImpresion
};

// Validador mínimo para actualización de impresión
const validateUpdateImpresion = [
    check('id').exists().notEmpty(),
    // Acepta booleano real o strings/números '1'/'0'
    body('impreso')
        .optional()
        .custom((value) => {
            const validValues = [true, false, 'true', 'false', 1, 0, '1', '0'];
            if (validValues.includes(value)) return true;
            throw new Error('impreso debe ser booleano o 1/0');
        }),
    // Acepta ISO8601, null, string vacío
    body('fechaImpresion')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === '' || value === null) return true;
            return !isNaN(new Date(value).getTime());
        })
        .withMessage('fechaImpresion debe ser una fecha válida'),
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
