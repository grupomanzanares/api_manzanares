import { body } from 'express-validator';

export const validarCrearAutorizacion = [
    body('empresa')
        .notEmpty().withMessage('La empresa es obligatoria')
        .isString().withMessage('La empresa debe ser texto')
        .isLength({ max: 20 }).withMessage('La empresa no puede tener más de 20 caracteres'),
    
    body('emisor')
        .notEmpty().withMessage('El emisor es obligatorio')
        .isString().withMessage('El emisor debe ser texto')
        .isLength({ max: 20 }).withMessage('El emisor no puede tener más de 20 caracteres'),
    
    body('responsableId')
        .notEmpty().withMessage('El ID del responsable es obligatorio')
        .isInt().withMessage('El ID del responsable debe ser un número entero'),
    
    body('user')
        .notEmpty().withMessage('El usuario es obligatorio')
        .isString().withMessage('El usuario debe ser texto')
        .isLength({ max: 50 }).withMessage('El usuario no puede tener más de 50 caracteres'),
    
    body('userMod')
        .notEmpty().withMessage('El usuario modificador es obligatorio')
        .isString().withMessage('El usuario modificador debe ser texto')
        .isLength({ max: 50 }).withMessage('El usuario modificador no puede tener más de 50 caracteres')
];

export const validarActualizarAutorizacion = [
    body('empresa')
        .optional()
        .isString().withMessage('La empresa debe ser texto')
        .isLength({ max: 20 }).withMessage('La empresa no puede tener más de 20 caracteres'),
    
    body('emisor')
        .optional()
        .isString().withMessage('El emisor debe ser texto')
        .isLength({ max: 20 }).withMessage('El emisor no puede tener más de 20 caracteres'),
    
    body('responsableId')
        .optional()
        .isInt().withMessage('El ID del responsable debe ser un número entero'),
    
    body('userMod')
        .notEmpty().withMessage('El usuario modificador es obligatorio')
        .isString().withMessage('El usuario modificador debe ser texto')
        .isLength({ max: 50 }).withMessage('El usuario modificador no puede tener más de 50 caracteres')
]; 