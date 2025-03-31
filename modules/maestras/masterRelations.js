import ccosto from "./ccosto/ccosto.js"; 
import empresa from "./Empresa/empresa.js";  

empresa.hasMany(ccosto, { foreignKey: "ccostoId" }); 
ccosto.belongsTo(empresa, { foreignKey: "ccostoId" });  

export { ccosto, empresa };