import ccosto from "./ccosto/ccosto.js"; 
import empresa from "./Empresa/empresa.js";  

empresa.hasMany(ccosto, { foreignKey: "empresaId" }); 
ccosto.belongsTo(empresa, { foreignKey: "empresaId" });  

export { ccosto, empresa };