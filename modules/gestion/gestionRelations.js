import User from "../../auth/models/User.js";
import comprasEstado from "../maestras/ComprasEstado/comprasEstado.js";
import comprasTipo from "../maestras/ComprasTipo/comprasTipo.js";
import empresa from "../maestras/Empresa/empresa.js";
import compraReportada from "./CompraReportada/compraReportada.js";



comprasTipo.hasMany(compraReportada, { foreignKey: "tipoCompraId" });
compraReportada.belongsTo(comprasTipo, { foreignKey: "tipoCompraId" });


comprasEstado.hasMany(compraReportada, { foreignKey: "estadoId" });
compraReportada.belongsTo(comprasEstado, { foreignKey: "estadoId" });


User.hasMany(compraReportada, { foreignKey: "responsableId" });
compraReportada.belongsTo(User, { foreignKey: "responsableId", as: "responsable" });

compraReportada.belongsTo(empresa, {
    foreignKey: 'empresa', // campo de la tabla compraReportada
    targetKey: 'nit',      // campo en la tabla empresas
    as: 'empresaInfo'
  });


export { compraReportada, comprasTipo, comprasEstado,User,empresa};
