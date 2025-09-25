import { Sequelize } from "sequelize";
import dotenv from "dotenv";  //importar modulo dotenv para llamar las variables de entorno

dotenv.config({ path: '.env' });

// Configuración común para ambas conexiones
const dbConfig = {
    host: process.env.DB_SERVER,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    define: { timestamps: true },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
};

// Conexión a base de datos Manzanares (principal)
const db = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD ?? '',
    dbConfig
);

// Conexión a base de datos Comercial
const dbComercial = new Sequelize(
    process.env.DB_COMERCIAL_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD ?? '',
    dbConfig
);

// Función para autenticar ambas conexiones
const authenticateConnections = async () => {
    try {
        // Autenticar conexión Manzanares
        await db.authenticate();
        console.log("✅ Conexión a base de datos Manzanares exitosa");
        
        // Autenticar conexión Comercial
        await dbComercial.authenticate();
        console.log("✅ Conexión a base de datos Comercial exitosa");
    } catch (error) {
        console.error("❌ Error al conectar a las bases de datos:", error);
    }
};

// Ejecutar autenticación
authenticateConnections();

// Exportar ambas conexiones
export { db, dbComercial };
export default db; // Mantener compatibilidad con código existente


// acquire:30000   30 segundos de espera para conectarse a la base de datos
//    idle:10000     tiempo que debe pasar para que cierre la conexion si no hay movimientos en la base de datos