import { body, check, validationResult } from "express-validator";

const validateCreateUser = [
    body('identificacion').exists().notEmpty().isLength({min: 5, max:12}),
    body('name').exists().notEmpty().isLength({min: 5, max: 100}),
    body('email').exists().notEmpty().isEmail(),
    body('celphone').exists().notEmpty(),

    // y el rol?
    // y si el usuario quiere cambiar el password

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


const validateUpdateUser = [
    body('rolId')
        .optional()
        .isInt().withMessage("El rol debe ser un número entero"),

    body('name')
        .exists().withMessage("El nombre es obligatorio")
        .notEmpty().withMessage("El nombre no puede estar vacío")
        .isLength({ min: 5, max: 100 }).withMessage("El nombre debe tener entre 5 y 100 caracteres"),

    body('email')
        .exists().withMessage("El correo es obligatorio")
        .notEmpty().withMessage("El correo no puede estar vacío")
        .isEmail().withMessage("Debe ser un correo electrónico válido"),

    body('celphone')
        .optional()
        .isString().withMessage("El celular debe ser una cadena de texto")
        .isLength({ min: 10, max: 10 }).withMessage("El número de celular debe tener exactamente 10 dígitos"),

    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
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
    validateUpdateUser,
    validateGetUser
};
