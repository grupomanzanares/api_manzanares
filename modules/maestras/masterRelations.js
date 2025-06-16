import ccosto from "./ccosto/ccosto.js"; 
import producto from "./producto/producto.js"; 
import empresa from "./Empresa/empresa.js";  

empresa.hasMany(ccosto, { foreignKey: "empresaId" }); 
ccosto.belongsTo(empresa, { foreignKey: "empresaId" });  

empresa.hasMany(producto, { foreignKey: "empresaId" }); 
producto.belongsTo(empresa, { foreignKey: "empresaId" });  



export { ccosto, empresa,producto};