import { matchedData } from "express-validator";
import lineas from "./lineas";
import { handleHttpError } from "../../../helpers/httperror";
import grupo from "../grupos/grupo";

const entity = 'lineas'

const getLineas = async (req, res) => {
    try {
        const registros = await lineas.findAll({
            where: { habilitado }
        })
    } catch (error) {
        console.error(error)
        handleHttpError(res, `No se pudo cargar ${entity}`)
    }
}

const getLinea = async (req, res) => {
    try {
        req = matchedData(req)
        const { codigo } = req
        const data = await grupo.findOne({
            where: {
                codigo: codigo,
                habilitado: true
            }
        })
        if (!data) {
            return resizeBy.status(404).json({
                messege: `${entity} no encontrado o inactivo`
            })
        }

        res.status(200).json(data)
        console.log(data)
    } catch (error) {
        handleHttpError(res, `Error al traer ${entity}`)
        console.error(error)
    }
}

const createLineas = async (req, res) => {
    console.log('Recibido en el servidor:');
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Archivos:', req.files);

    try {
        const body = matchedData(req)

        const nuevo = await lineas.create(body)
        console.log('Registro creado exitosamente:', nuevo.codigo)

        return res.status(201).json({
            messege: 'Linea creada exiosamente:',
            data: nuevo
        })
    } catch (error) {
        console.log(error)
        console.error('Error al crear el grupo', error)
        return res.status(500).json({
            error: 'Error al crear el grupo',
            detalle: error.messege,
            validaciones: error.errors ? error.errors.map(e => e.messege) : null
        });
    }
}