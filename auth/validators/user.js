import { body, check, validationResult } from "express-validator";

const validateCreateUser = [
    body('identificacion').exists().notEmpty(),
    body('name').exists().notEmpty().isLength({min: 5, max: 100}),
    body('email').exists().notEmpty(),
    body('celphone').exists().notEmpty(),
    body('password').exists().notEmpty().isLength({min: 10, max: 18}),

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

const validateGetUser = [
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
    validateCreateUser,
    validateGetUser
};
