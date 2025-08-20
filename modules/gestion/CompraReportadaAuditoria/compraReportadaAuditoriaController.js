import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import compraReportadaAuditoria from "./compraReportadaAuditoria.js";
import { compraReportada } from "../gestionRelations.js";

const entity = 'compraReportadaAuditoria';

const createAuditoria = async (req, res) => {

	console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);
	
	try {
		const body = matchedData(req);
		let { compraReportadaId, evento, observacion, user } = body;

		// Normalizar evento (e.g., "Asignado" -> "asignado")
		if (typeof evento === 'string') {
			evento = evento.trim().toLowerCase();
		}

		// Verificar que exista la compra reportada
		const existente = await compraReportada.findByPk(compraReportadaId);
		if (!existente) {
			return res.status(404).json({ message: 'compraReportada no encontrada' });
		}

		// No restringir eventos: se confía en el valor enviado por el cliente

		const registro = await compraReportadaAuditoria.create({
			compraReportadaId,
			evento,
			observacion: observacion || null,
			user
		});

		return res.status(201).json({
			message: `${entity} creada correctamente`,
			data: registro
		});
	} catch (error) {
		console.error(error);
		handleHttpError(res, `No se pudo crear ${entity}`);
	}
};

export { createAuditoria };

const getAuditoriaByCompra = async (req, res) => {
	try {
		const reqData = matchedData(req);
		const { compraReportadaId } = reqData;

		// Verificar existencia de la compra
		const existente = await compraReportada.findByPk(compraReportadaId);
		if (!existente) {
			return res.status(404).json({ message: 'compraReportada no encontrada' });
		}

		const auditoria = await compraReportadaAuditoria.findAll({
			where: { compraReportadaId },
			order: [['createdAt', 'ASC']]
		});

		return res.status(200).json({
			success: true,
			data: auditoria
		});
	} catch (error) {
		console.error(error);
		handleHttpError(res, `No se pudo consultar ${entity}`);
	}
};

export { getAuditoriaByCompra };


