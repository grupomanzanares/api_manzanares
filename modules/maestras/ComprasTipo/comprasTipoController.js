import { matchedData } from "express-validator";
import { handleHttpError } from "../../../helpers/httperror.js";
import comprasTipo from "./comprasTipo.js";



const entity = "comprasTipo"

const getComprasTipos = async (req, res) =>{
    try {
        const registros = await comprasTipo.findAll({
            where: {estado: true}
        });
        res.json(registros)
    }catch{
        handleHttpError(res, `No se pudo cargar ${entity} s` ); 
    }
}

const getComprasTipo = async(req, res) => {
    try {
        req = matchedData(req)
        const { id } = req
        const data = await comprasTipo.findOne({
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



const createComprasTipo = async (req, res) => {


    try {
        const body = matchedData(req)
        const response = await comprasTipo.create(body)
        res.send(response)
    } catch (error) {
        console.log(error)
        handleHttpError(res,  `No se pudo crear  ${entity} `)
    }
}


const updateComprasTipo = async (req, res) => {
    try {
        const { id } = req.params

        const body = req.body


        const response = await comprasTipo.update(body, {
            where: { id }
        })

        if (response[0] === 0){
            return res.status(404).json({
                message: ` ${entity} No encontrado o No se realizaron cambios ` 
            })
        }

        const updateRegistro = await comprasTipo.findByPk(id);

        res.status(200).json({
            message:  ` ${entity} actualizado correctamente `  ,
            data: updateRegistro
        }); 
    } catch (error) {
        handleHttpError(res,  `No se pudo actualizar ${entity} `)
        console.error(error)
    }
}


const deleteComprasTipo = async(req, res) =>{
    try {
        const { id } = req.params
        const response = await comprasTipo.update({state: false}, {
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
    getComprasTipos,
    getComprasTipo,
    createComprasTipo,
    deleteComprasTipo,
    updateComprasTipo
}