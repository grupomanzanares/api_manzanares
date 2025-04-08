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
    try {
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
        
        console.log("🔍 Respuesta recibida:", JSON.stringify(response.data, null, 2));
        
        // Verificar la estructura correcta según Postman
        if (response.data && response.data.esExitoso === true) {
            const datos = response.data.datos;
            if (Array.isArray(datos)) {
                console.log(`✅ Se encontraron ${datos.length} registros`);
                return datos;
            } else {
                console.error("⚠️ datos no es un array:", datos);
                return [];
            }
        } else {
            console.error("⚠️ Respuesta con error o estructura inesperada:", response.data);
            throw new Error("La respuesta no indica éxito o tiene formato inesperado");
        }
    } catch (error) {
        console.error("❌ Error al consultar los centros de costo:", 
            error.response?.data || error.message);
        throw error;
    }
}


async function syncronizarCCostos() {
        try {
        console.log("🔑 Obteniendo token...");
        const token = await getToken();
        console.log("✅ Token obtenido correctamente");

        console.log("🔍 Consultando centros de costo...");
        const ccostosData = await fetchCCostos(token);
        if (!ccostosData || ccostosData.length === 0) {
            console.log("⚠️ No se encontraron datos de centros de costo");
            return;
        }
        console.log("📦 Centros de costo recibidos:", ccostosData.length);
        console.log("Muestra de datos recibidos:", JSON.stringify(ccostosData[0], null, 2));

        let insertados = 0;
        let errores = 0;

        for (const item of ccostosData) {
            try {
                // Intentar acceder a las propiedades usando múltiples formatos
                const nit = (item.empresaA_NIT || item.empresa_NIT || item.EMPRESA_NIT || "").toString().trim();
                const centro = (item.centro || item.CENTRO || "").toString().trim();
                const ncentro = (item.ncentro || item.NCENTRO || "").toString().trim();
                const estadoRaw = (item.estado || item.ESTADO || "").toString().trim();
                const estado = estadoRaw === "1" || estadoRaw === "A";
                
                if (!nit || !centro) {
                    console.warn("⚠️ Item sin NIT o centro válido:", JSON.stringify(item));
                    errores++;
                    continue;
                }
                
                const empresaDb = await empresa.findOne({ where: { nit } });
                if (!empresaDb) {
                    console.warn(`⚠️ Empresa con NIT ${nit} no encontrada`);
                    errores++;
                    continue;
                }
                
                await ccosto.upsert({
                    codigo: centro,
                    nombre: ncentro,
                    estado: estado,
                    empresaId: empresaDb.id
                });
                
                insertados++;
            } catch (itemError) {
                console.error("❌ Error procesando item:", itemError, "Datos:", JSON.stringify(item));
                errores++;
            }
        }
        
        console.log(`✅ Sincronización completada. Registros sincronizados: ${insertados}, Errores: ${errores}`);
    } catch (err) {
        console.error("❌ Error en sincronización:", err);
    }
}
    
        
export { syncronizarCCostos };

/** Instalar  npm install node-cron    npm install axios */