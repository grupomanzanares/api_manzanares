import { Sequelize } from "sequelize";
import dotenv from "dotenv";  //importar modulo dotenv para llamar las variables de entorno


dotenv.config({ path: '.env' });



const db = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD ?? '', {
    host: process.env.DB_SERVER,
    dialect: 'mysql',
    port: 3306,
    define: { timestamps: true },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
})

db.authenticate()
    .then(() => {
        console.log("Conexión a la base de datos exitosa");
    })
    .catch((error) => {
        console.error("Error al conectar a la base de datos:", error);
    });

export default db


// acquire:30000   30 segundos de espera para conectarse a la base de datos
// idle:10000     tiempo que debe pasar para que cierre la conexion si no hay movimientos en la base de datos