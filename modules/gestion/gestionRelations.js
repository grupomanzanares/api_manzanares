import User from "../../auth/models/User.js";
import comprasEstado from "../maestras/ComprasEstado/comprasEstado.js";
import comprasTipo from "../maestras/ComprasTipo/comprasTipo.js";
import empresa from "../maestras/Empresa/empresa.js";
import matrizAutorizaciones from "./MatrizAutorizaciones/matrizAutorizaciones.js";
import compraReportada from "./CompraReportada/compraReportada.js";
import compraReportadaAuditoria from "./CompraReportadaAuditoria/compraReportadaAuditoria.js";


// Relaciones para compraReportada
comprasTipo.hasMany(compraReportada, { foreignKey: "tipoCompraId" });
compraReportada.belongsTo(comprasTipo, { foreignKey: "tipoCompraId" });

comprasEstado.hasMany(compraReportada, { foreignKey: "estadoId" });
compraReportada.belongsTo(comprasEstado, { foreignKey: "estadoId" });

User.hasMany(compraReportada, { foreignKey: "responsableId" });
compraReportada.belongsTo(User, { foreignKey: "responsableId", as: "responsable" });

compraReportada.belongsTo(empresa, {
    foreignKey: 'empresa',
    targetKey: 'nit',
    as: 'empresaInfo'
});

// Relaciones para compras_reportadas_auditoria
compraReportada.hasMany(compraReportadaAuditoria, { foreignKey: 'compraReportadaId', as: 'auditorias' });
compraReportadaAuditoria.belongsTo(compraReportada, { foreignKey: 'compraReportadaId' });

// Relación con User para auditoría
compraReportadaAuditoria.belongsTo(User, { 
    foreignKey: 'user', 
    targetKey: 'identificacion',
    as: 'usuario' 
});

// Relaciones para matrizAutorizaciones
User.hasMany(matrizAutorizaciones, { foreignKey: "responsableId" });
matrizAutorizaciones.belongsTo(User, { foreignKey: "responsableId", as: "responsable" });

matrizAutorizaciones.belongsTo(empresa, {
    foreignKey: 'empresa',
    targetKey: 'nit',
    as: 'empresaInfo'
});

export { compraReportada, compraReportadaAuditoria, matrizAutorizaciones, empresa, User, comprasEstado, comprasTipo };
