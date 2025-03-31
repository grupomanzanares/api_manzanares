import { matchedData } from "express-validator";
import { handleHttpError } from "../../helpers/httperror.js";
import rol from "../models/Rol.js";



const entity = "rol"

const getRoles = async (req, res) =>{
    try {
        const registros = await rol.findAll({
            where: {state: true}
        });
        res.json(registros)
    }catch{
        handleHttpError(res, `No se pudo cargar ${entity} s` ); 
    }
}

const getRol = async(req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await rol.findOne({
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



const createRol = async (req, res) => {


    try {
        const body = matchedData(req)
        const response = await rol.create(body)
        res.send(response)
    } catch (error) {
        console.log(error)
        handleHttpError(res,  `No se pudo crear  ${entity} `)
    }
}


const updateRol = async (req, res) => {
    try {
        const { id } = req.params

        const body = req.body


        const response = await rol.update(body, {
            where: { id }
        })

        if (response[0] === 0){
            return res.status(404).json({
                message: ` ${entity} No encontrado o No se realizaron cambios ` 
            })
        }

        const updateRegistro = await rol.findByPk(id);

        res.status(200).json({
            message:  ` ${entity} actualizado correctamente `  ,
            data: updateRegistro
        }); 
    } catch (error) {
        handleHttpError(res,  `No se pudo actualizar ${entity} `)
        console.error(error)
    }
}


const deleteRol = async(req, res) =>{
    try {
        const { id } = req.params
        const response = await rol.update({state: false}, {
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
    getRoles,
    getRol,
    createRol,
    deleteRol,
    updateRol
}