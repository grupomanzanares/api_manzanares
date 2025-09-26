import express from "express";
import cors from "cors";
import db from "./config/db.js";

/***
 * Rutas ....  sandra v
 */
import userRoutes from './auth/routes/userRoutes.js';
import authRoutes from './auth/routes/authRoutes.js';
import rolRoutes from './auth/routes/rolRoutes.js';


/***  Rutas Maestros del sistema */
import dependenciaRoutes from './modules/maestras/Dependencia/dependenciaRoutes.js';
import empresaRoutes from './modules/maestras/Empresa/empresaRoutes.js';
import ccostosRoutes from './modules/maestras/ccosto/ccostoRoutes.js';
import productosRoutes from './modules/maestras/producto/productoRoutes.js';
import comprasEstadoRoutes from './modules/maestras/ComprasEstado/comprasEstadoRoutes.js';
import comprasTipoRoutes from './modules/maestras/ComprasTipo/comprasTipoRoutes.js';
import compraReportadaRoutes from './modules/gestion/CompraReportada/compraReportadaRoutes.js';
import compraReportadaAuditoriaRoutes from './modules/gestion/CompraReportadaAuditoria/compraReportadaAuditoriaRoutes.js';
import matrizAutorizacionesRoutes from './modules/gestion/MatrizAutorizaciones/matrizAutorizacionesRoutes.js';
import registroDianRoutes from './modules/gestion/RegistroDian/registroDianRoutes.js';
import fileUploadRoutes from './modules/gestion/FileUpload/fileUploadRoutes.js';
import compraReportadaDetalleRoutes from './modules/gestion/CompraReportadaDetalle/compraReportadaDetalleRoutes.js';


/*** Crear app   */
const app = express();

app.use('/api_manzanares', express.static('public'));

/*** Habilitar CORS para todas las rutas   */
app.use(cors());


// Habilitar express.json para parsear JSON
/*** Conexión a la base de datos y eliminación de índices duplicados  */
app.use(express.json());



/*** Conexión a las bases de datos */
//Conexion a la base de datos Manzanares
try {
    await db.authenticate();
    db.sync();
    console.info('✅ Conexión exitosa a la base de datos Manzanares')
} catch (error) {
    console.error('❌ Error conexión Manzanares:', error)
}



/*** Rutas Autenticacion */
app.use('/api_manzanares/users', userRoutes);
app.use('/api_manzanares/auth', authRoutes);



/***  Rutas del sistema */
app.use('/api_manzanares/dependencias', dependenciaRoutes);
app.use('/api_manzanares/empresas', empresaRoutes);
app.use('/api_manzanares/ccostos', ccostosRoutes);
app.use('/api_manzanares/productos', productosRoutes);
app.use('/api_manzanares/compras_estados', comprasEstadoRoutes);
app.use('/api_manzanares/compras_tipos', comprasTipoRoutes);
app.use('/api_manzanares/compras_reportadas', compraReportadaRoutes);
app.use('/api_manzanares/compras_reportadas_auditoria', compraReportadaAuditoriaRoutes);
app.use('/api_manzanares/matriz_autorizaciones', matrizAutorizacionesRoutes);
app.use('/api_manzanares/registros_dian', registroDianRoutes);
app.use('/api_manzanares/files', fileUploadRoutes);
app.use('/api_manzanares/compras_reportadas_detalle', compraReportadaDetalleRoutes);


// hola
/***
 * Configurar puerto y levantar servidor
 */
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});

/***
 * Rutas principales
 */
app.get('/api_manzanares', (req, res) => {
    res.send("Hola api_manzanares te encuentras ON");
});
