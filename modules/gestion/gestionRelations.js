import User from "../../auth/models/User.js";
import comprasEstado from "../maestras/ComprasEstado/comprasEstado.js";
import comprasTipo from "../maestras/ComprasTipo/comprasTipo.js";
import empresa from "../maestras/Empresa/empresa.js";
import compraAutorizada from "./CompraAutorizada/compraAutorizada.js";
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


  User.hasMany(compraAutorizada, { foreignKey: "responsableId" });
  compraAutorizada.belongsTo(User, { foreignKey: "responsableId", as: "responsable" });

compraAutorizada.belongsTo(empresa, {
    foreignKey: 'empresa',
    targetKey: 'nit',
    as: 'empresaInfo'
});


export { compraReportada, compraAutorizada, empresa, User, comprasEstado, comprasTipo };
