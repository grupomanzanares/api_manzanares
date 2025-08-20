import { body, validationResult } from "express-validator";

const validateCreateAuditoria = [
	body('compraReportadaId').exists().withMessage('compraReportadaId es obligatorio').isInt(),
	body('evento').exists().withMessage('evento es obligatorio').isString().isLength({ min: 3, max: 50 }),
	body('observacion').optional().isString().isLength({ max: 500 }),
	body('user').exists().withMessage('user es obligatorio').isString().isLength({ min: 1, max: 50 }),
	(req, res, next) => {
		try {
			validationResult(req).throw();
			return next();
		} catch (error) {
			res.status('403');
			res.send({ errors: error.array() });
		}
	}
];

export { validateCreateAuditoria };


