import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import { producto, empresa } from "../masterRelations.js";



const entity = "producto"

const getProductos = async (req, res) =>{
    try {
        const registros = await producto.findAll({
            where: {estado: true}
        });
        res.json(registros)
    }catch{
        handleHttpError(res, `No se pudo cargar ${entity} s` ); 
    }
}

const getProducto= async(req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await producto.findOne({
            where: {
                id: id,
                estado: true
            }
        })
        if (!data){
            return res.status(404).json({
                message:  `${entity} no encontrado(a) ó inactivo (a) ` 
            })
        }
        res.status(200).json(data);
        console.log(data)
    } catch (error) {
        handleHttpError(res, `Error al traer ${entity}  ` )
        console.error(error)
    }
}


const getProductoxNit = async(req, res) => {
    try {
        // Verificar si el nit viene en los parámetros de la URL
        const nit = req.params.nit || req.query.nit;
        
        if (!nit) {
            return res.status(400).json({
                message: "El parámetro NIT es requerido"
            });
        }

        console.log("NIT recibido:", nit);

        // Paso 1: Buscar la empresa por nit
        const empresaData = await empresa.findOne({
            where: {
                nit: nit,
                estado: true
            }
        });
    
        if (!empresaData) {
            return res.status(404).json({
                message: `Empresa con NIT ${nit} no encontrada o inactiva`
            });
        }

        const data = await producto.findAll({
            where: {
                empresaId: empresaData.id,
                estado: true
            }
        });

        if (!data || data.length === 0) {
            return res.status(404).json({
                message: `No se encontraron productos para la empresa con NIT ${nit}`
            });
        }

        res.status(200).json(data);
        console.log("Productos encontrados:", data.length);
    } catch (error) {
        console.error("Error específico:", error);
        handleHttpError(res, `Error al traer ${entity}`);
    }
}





export{
    getProductos,
    getProducto,
    getProductoxNit
}