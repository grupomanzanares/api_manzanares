import express from "express";
import cors from "cors";
import db from "./config/db.js";

/***
 * Rutas 
 */
import userRoutes from './auth/routes/userRoutes.js';
import authRoutes from './auth/routes/authRoutes.js';


/***  Rutas Maestros del sistema */





/*** Crear app   */
const app = express();

app.use('/api_manzanares', express.static('public'));

/*** Habilitar CORS para todas las rutas   */
app.use(cors()); 


// Habilitar express.json para parsear JSON
/*** Conexión a la base de datos y eliminación de índices duplicados  */
app.use(express.json());


/*** Conexión a la base de datos y eliminación de índices duplicados  */
//Conexion a la base de datos
try {
    await db.authenticate();
    db.sync();
    console.info('Conexion exitosa a la base de datos')
} catch (error) {
    console.log(error)
}

/*** Rutas Autenticacion */
app.use('/api_manzanares/users', userRoutes);
app.use('/api_manzanares/auth', authRoutes);

/***  Rutas del sistema */


// hola
/***
 * Configurar puerto y levantar servidor
 */  
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});

/***
 * Ruta principal
 */
app.get('/api_manzanares', (req, res) => {
    res.send("Hola api_manzanares te encuentras ON");
});
