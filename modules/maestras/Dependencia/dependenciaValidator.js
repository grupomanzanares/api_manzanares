import { body, check, validationResult } from "express-validator";

const validateCreateDependencia = [
    body('nombre').exists().notEmpty().isLength({min: 4, max: 30}),
    body('descripcion').exists().notEmpty().isLength({min: 0, max: 100}),
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

const validateGetDependencia = [
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
    validateCreateDependencia,
    validateGetDependencia
};
