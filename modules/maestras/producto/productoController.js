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
        req = matchedData(req)
        const { nit } = req
        console.log("NIT recibido:", nit); // 👈 VERIFICACIÓN


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


        const data = await ccosto.findAll({
            where: {
                empresaId: empresaData.id,
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
        console.error("Error específico:", error); // 👈 VER ERROR REAL
    }
}





export{
    getProductos,
    getProducto,
    getProductoxNit
}