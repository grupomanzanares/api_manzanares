import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });

// DEBUG: Mostrar variables de entorno
console.log('🔍 DEBUG - Variables de DB Comercial:');
console.log('   DB_COMERCIAL_DATABASE:', process.env.DB_COMERCIAL_DATABASE);
console.log('   DB_COMERCIAL_SERVER:', process.env.DB_COMERCIAL_SERVER || process.env.DB_SERVER);
console.log('   DB_COMERCIAL_PORT:', process.env.DB_COMERCIAL_PORT || process.env.DB_PORT);
console.log('   DB_COMERCIAL_USER:', process.env.DB_COMERCIAL_USER || process.env.DB_USER);

const manzanaresConfig = {
    host: process.env.DB_SERVER,
    dialect: 'mysql',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_DATABASE,
    define: {
        timestamps: true,
        schema: process.env.DB_DATABASE
    },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
        multipleStatements: true
    },
    logging: false // Deshabilitar logs SQL en producción
};

const comercialConfig = {
    host: process.env.DB_COMERCIAL_SERVER || process.env.DB_SERVER,
    dialect: 'mysql',
    port: Number(process.env.DB_COMERCIAL_PORT || process.env.DB_PORT) || 3306,
    database: process.env.DB_COMERCIAL_DATABASE,
    define: {
        timestamps: true,
        schema: process.env.DB_COMERCIAL_DATABASE
    },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
        multipleStatements: true
    },
    logging: false
};

const db = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD ?? '',
    manzanaresConfig
);

const dbComercial = new Sequelize(
    process.env.DB_COMERCIAL_DATABASE,
    process.env.DB_COMERCIAL_USER || process.env.DB_USER,
    process.env.DB_COMERCIAL_PASSWORD ?? process.env.DB_PASSWORD ?? '',
    comercialConfig
);

export { db, dbComercial };
export default db;