import { Sequelize } from "sequelize";
import dotenv from "dotenv";  //importar modulo dotenv para llamar las variables de entorno

dotenv.config({ path: '.env' });

// Configuraciones independientes por conexión (permiten diferentes hosts/puertos/credenciales)
const manzanaresConfig = {
    host: process.env.DB_SERVER,
    dialect: 'mysql',
    port: Number(process.env.DB_PORT) || 3306,
    define: { timestamps: true },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
};

const comercialConfig = {
    host: process.env.DB_COMERCIAL_SERVER || process.env.DB_SERVER,
    dialect: 'mysql',
    port: Number(process.env.DB_COMERCIAL_PORT || process.env.DB_PORT) || 3306,
    define: { timestamps: true },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
};

// Conexión a base de datos Manzanares (principal)
const db = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD ?? '',
    manzanaresConfig
);

// Conexión a base de datos Comercial
const dbComercial = new Sequelize(
    process.env.DB_COMERCIAL_DATABASE,
    process.env.DB_COMERCIAL_USER || process.env.DB_USER,
    process.env.DB_COMERCIAL_PASSWORD ?? process.env.DB_PASSWORD ?? '',
    comercialConfig
);

// Exportar ambas conexiones sin autenticar aquí (la app las autentica)
export { db, dbComercial };
export default db; // Mantener compatibilidad con código existente

// acquire:30000   30 segundos de espera para conectarse a la base de datos
// idle:10000     tiempo que debe pasar para que cierre la conexion si no hay movimientos en la base de datos