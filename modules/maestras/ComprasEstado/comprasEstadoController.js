import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import compraEestado from "./comprasEstado.js";



const entity = "compraEestado"

const getComprasEstados = async (req, res) =>{
    try {
        const registros = await compraEestado.findAll({
            where: {state: true}
        });
        res.json(registros)
    }catch{
        handleHttpError(res, `No se pudo cargar ${entity} s` ); 
    }
}

const getComprasEstado = async(req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await compraEestado.findOne({
            where: {
                id: id,
                state: true
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



const createComprasEstado= async (req, res) => {

    try {
        const body = matchedData(req)
        const response = await compraEestado.create(body)
        res.send(response)
    } catch (error) {
        console.log(error)
        handleHttpError(res,  `No se pudo crear  ${entity} `)
    }
}


const updateComprasEstado = async (req, res) => {
    try {
        const { id } = req.params

        const body = req.body


        const response = await compraEestado.update(body, {
            where: { id }
        })

        if (response[0] === 0){
            return res.status(404).json({
                message: ` ${entity} No encontrado o No se realizaron cambios ` 
            })
        }

        const updateRegistro = await compraEestado.findByPk(id);

        res.status(200).json({
            message:  ` ${entity} actualizado correctamente `  ,
            data: updateRegistro
        }); 
    } catch (error) {
        handleHttpError(res,  `No se pudo actualizar ${entity} `)
        console.error(error)
    }
}


const deleteComprasEstado = async(req, res) =>{
    try {
        const { id } = req.params
        const response = await compraEestado.update({state: false}, {
            where: {id, state: true}
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
    getComprasEstados,
    getComprasEstado,
    createComprasEstado,
    deleteComprasEstado,
    updateComprasEstado
}