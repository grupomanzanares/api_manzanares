import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const compraReportadaAuditoria = db.define('compras_reportadas_auditoria', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	
	compraReportadaId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},

	evento: {
		type: DataTypes.STRING(50),
		allowNull: false
	},

	observacion: {
		type: DataTypes.STRING(500),
		allowNull: false
	},

	user: {
		type: DataTypes.STRING(50),
		allowNull: false
	}
},
{
	timestamps: true,
	freezeTableName: true
});

export default compraReportadaAuditoria;


