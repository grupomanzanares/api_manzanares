import express from "express";
import cors from "cors";
import { db, dbComercial } from "./config/db.js";

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

/*** Rutas del módulo Comercial */
import lotteryParticipationsRoutes from './modules/comercial/LotteryParticipations/lotteryParticipationsRoutes.js';

/*** Crear app   */
const app = express();

app.use('/api_manzanares', express.static('public'));

/*** Habilitar CORS para todas las rutas   */
app.use(cors());

// Habilitar express.json para parsear JSON
app.use(express.json());

// Variable para controlar si la DB comercial está disponible
let comercialDbAvailable = false;

/*** Función para conectar a las bases de datos */
async function connectDatabases() {
    // Conexión a la base de datos Manzanares (OBLIGATORIA)
    try {
        await db.authenticate();
        console.info('✅ Conexión exitosa a la base de datos Manzanares');

        await db.sync({ alter: false });
        console.info('✅ Sincronización completada - Base de datos Manzanares');
    } catch (error) {
        console.error('❌ Error conexión Manzanares:', error);
        throw error; // Si falla Manzanares, no continuar
    }

    // Conexión a la base de datos Comercial (OPCIONAL)
    try {
        await dbComercial.authenticate();
        console.info('✅ Conexión exitosa a la base de datos Comercial');

        await dbComercial.sync({ alter: false });
        console.info('✅ Sincronización completada - Base de datos Comercial');
        comercialDbAvailable = true;
    } catch (error) {
        console.warn('⚠️  Advertencia - No se pudo conectar a la base de datos Comercial:', error.message);
        console.warn('⚠️  El módulo comercial estará deshabilitado');
        comercialDbAvailable = false;
        // NO detener la aplicación, continuar sin el módulo comercial
    }
}

/*** Configurar rutas después de establecer conexiones */
function setupRoutes() {
    /*** Rutas Autenticacion */
    app.use('/api_manzanares/users', userRoutes);
    app.use('/api_manzanares/auth', authRoutes);
    app.use('/api_manzanares/roles', rolRoutes);

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

    /*** Rutas del módulo Comercial - SOLO si está disponible */
    if (comercialDbAvailable) {
        app.use('/api_comercial/lottery-participations', lotteryParticipationsRoutes);
        console.info('✅ Rutas del módulo comercial habilitadas');
    } else {
        // Ruta de fallback para comercial
        app.get('/api_comercial/*', (req, res) => {
            res.status(503).json({
                success: false,
                message: "Módulo comercial temporalmente no disponible",
                error: "Database connection failed"
            });
        });
    }

    /*** Rutas principales */
    app.get('/api_manzanares', (req, res) => {
        res.send("Hola api_manzanares te encuentras ON");
    });

    app.get('/api_comercial', (req, res) => {
        if (comercialDbAvailable) {
            res.json({
                success: true,
                message: "API Comercial funcionando correctamente",
                version: "1.0.0"
            });
        } else {
            res.status(503).json({
                success: false,
                message: "API Comercial temporalmente no disponible",
                error: "Database connection failed"
            });
        }
    });

    // Endpoint de estado general
    app.get('/api_manzanares/status', (req, res) => {
        res.json({
            success: true,
            services: {
                manzanares: "✅ Disponible",
                comercial: comercialDbAvailable ? "✅ Disponible" : "❌ No disponible"
            }
        });
    });
}

/*** Inicializar aplicación */
async function startServer() {
    try {
        // Conectar a las bases de datos
        await connectDatabases();

        // Configurar rutas después de las conexiones
        setupRoutes();

        // Levantar servidor
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`🚀 Servidor corriendo en puerto ${port}`);
            console.log(`📊 Estado de servicios:`);
            console.log(`   - Manzanares: ✅ Disponible`);
            console.log(`   - Comercial: ${comercialDbAvailable ? '✅ Disponible' : '❌ No disponible'}`);
        });

    } catch (error) {
        console.error('💥 Error crítico al inicializar la aplicación:', error);
        process.exit(1);
    }
}

// Iniciar la aplicación
startServer();