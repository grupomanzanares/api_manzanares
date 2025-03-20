import { body, check, validationResult } from "express-validator";

const validateCreateCompraReportada = [
    
    body('nit').exists().withMessage("La identificación es obligatorio")
        .notEmpty().isLength({min: 5, max: 15}),
    body("logo").optional(),
    body('nombre').exists().notEmpty().isLength({min: 4, max: 30}),
    body('user').optional().isString().withMessage('El usuario debe ser una cadena de texto'),
    body('userMod').optional().isString().withMessage('El usuarioMod debe ser una cadena de texto'),


    (req, res, next) =>{
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            res.status('403')
            res.send({errors : error.array()}) 
        } 
    }
];

const validateGetCompraReportada = [
    check('id').exists().notEmpty(),

    (req, res, next) =>{
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            res.status('403')
            res.send({errors : error.array()}) 
        } 
    }
]

export {
    validateCreateCompraReportada,
    validateGetCompraReportada
};
