import { body, check, validationResult } from "express-validator";

const validateCreateRol = [
    body('name').exists().notEmpty().isLength({min: 5, max: 100}),



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



const validateGetRol = [
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
    validateCreateRol,
    validateGetRol
};
