import { body, check, validationResult } from "express-validator";

const validateRegister = [
    body('identificacion').exists().notEmpty().isLength({min: 5, max:12}),
    body('name').exists().notEmpty().isLength({min: 5, max: 30}),
    body('celphone').exists().notEmpty(),
    body('email').exists().notEmpty().isEmail(),
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

const validateLogin = [
    body('identificacion').exists().notEmpty(),
    body('password').exists().notEmpty(),

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



const validateRecover = [
    body('token').exists().notEmpty(),
    body('password').exists().notEmpty(),

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

export {
    validateRegister,
    validateLogin,
    validateRecover
};
