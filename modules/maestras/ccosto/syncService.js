import axios from 'axios';
import db from '../../../config/db.js';

import dotenv from "dotenv";  //importar modulo dotenv para llamar las variables de entorno
import { ccosto,  empresa }  from "../masterRelations.js";



dotenv.config();

const externalBaseUrl = process.env.YEMINUS_URL
const externalUsername = process.env.YEMINUS_USER
const externalPassword = process.env.YEMINUS_PASSWORD


async function getToken() {
    const params = new URLSearchParams();
    params.append('userName', externalUsername);
    params.append('password', externalPassword);
    params.append('grant_type', 'password');

        try {
        const response = await axios.post(`${externalBaseUrl}/token`, params, {
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    
        return response.data.access_token;
        } catch (error) {
        console.error("❌ Error al obtener el token:", error.response?.data || error.message);
        throw error;
        }
}

async function fetchCCostos(token) {
        const response = await axios.post(
        `${externalBaseUrl}/app/informes/informespersonalizados/ejecutarconsultainforme`,
        {
            crearArchivo: false,
            idInforme: 53
        },
        {
            headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "id_empresa": "03",
            "usuario": externalUsername
            }
        }
        );
    
        if (response.data?.esExitosa && Array.isArray(response.data.datos)) {
        return response.data.datos;
        } else {
        throw new Error("❌ La respuesta no contiene datos válidos.");
        }
}

async function syncronizarCCostos() {
    try {
        const token = await getToken();
        const ccostosData = await fetchCCostos(token);
        console.log("📦 Centros de costo recibidos:", ccostosData.length);

        for (const item of ccostosData) {
            const nit = item.EMPRESA_NIT.trim();;
            const centro = item.CENTRO.trim();;
            const ncentro = item.NCENTRO.trim();;
            const estadoRaw = item.ESTADO.trim();;
            const estado = estadoRaw === "A" ? true : false;

        const empresaDb  = await empresa.findOne({ where: { nit } });
        if (!empresaDb) {
            console.warn(`Empresa con NIT ${nit} no encontrada`);
            continue;
        }

        await ccosto.upsert({
            codigo: centro,
            nombre: ncentro,
            estado: estado === "1",
            empresaId: empresaDb.id
        });
        }

        console.log("Sincronización completada correctamente.");
    } catch (err) {
        console.error("Error en sincronización:...", err);
    }
}

export { syncronizarCCostos };

/** Instalar  npm install node-cron    npm install axios */