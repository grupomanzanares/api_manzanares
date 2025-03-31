import { body, check, validationResult } from "express-validator";
 
const validateCreateCcosto = [
    body('codigo').exists().notEmpty().isLength({min: 1, max: 10}),
    body('nombre').exists().notEmpty().isLength({min: 4, max: 100}),
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

const validateGetCcosto = [
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
    validateCreateCcosto,
    validateGetCcosto
};
