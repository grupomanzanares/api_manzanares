import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import { ccosto } from "../masterRelations.js";



const entity = "ccosto"

const getCcostos = async (req, res) =>{
    try {
        const registros = await ccosto.findAll({
            where: {estado: true}
        });
        res.json(registros)
    }catch{
        handleHttpError(res, `No se pudo cargar ${entity} s` ); 
    }
}

const getCcosto = async(req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await ccosto.findOne({
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

const getCcostoxNit = async(req, res) => {
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


        const data = await ccosto.findOne({
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


const createCcosto = async (req, res) => {


    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Archivos:', req.files);


    try {
        const body = matchedData(req)

        // Verificar si hay un archivo de imagen y obtener su ruta
        const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

        const response = await ccosto.create({
            ...body,
            logo: logoPath, // Guardar la ruta en la BD
        });
        res.send(response)
    } catch (error) {
        console.log(error)
        handleHttpError(res,  `No se pudo crear . ${entity} `)
    }
}


const updateCcosto = async (req, res) => {
    try {
        const { id } = req.params

        const body = req.body


        const response = await ccosto.update(body, {
            where: { id }
        })

        if (response[0] === 0){
            return res.status(404).json({
                message: ` ${entity} No encontrado o No se realizaron cambios ` 
            })
        }

        const updateRegistro = await ccosto.findByPk(id);

        res.status(200).json({
            message:  ` ${entity} actualizado correctamente `  ,
            data: updateRegistro
        }); 
    } catch (error) {
        handleHttpError(res,  `No se pudo actualizar ${entity} `)
        console.error(error)
    }
}


const deleteCcosto = async(req, res) =>{
    try {
        const { id } = req.params
        const response = await ccosto.update({state: false}, {
            where: {id, estado: true}
        })

        if(response === 0) {
            return res.status(404).json({
                message: `${entity} , no encontrado(a) y/o inactivo(a)` 
            })
        }

        res.status(200).json({
            message: `${entity} , eliminada con exito` 
        })
    } catch (error) {
        handleHttpError(res, `No se pudo eliminar ${entity} `   )
        console.error(error)
    }
}

export{
    getCcostos,
    getCcostoxNit,
    getCcosto,
    createCcosto,
    deleteCcosto,
    updateCcosto
}