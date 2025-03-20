import { matchedData } from "express-validator";
import User from "../models/User.js"
import { handleHttpError } from '../../helpers/httperror.js'
import { encrypt } from "../helpers/password.js"
import { tokenSign } from "../../helpers/jwt.js"


const getUsers = async (req, res)=>{
    try {
        const users = await User.findAll({
            where: { state: true }
        });
        res.json(users);
    } catch (error) {
        handleHttpError(res, 'No se pudo cargar los usuarios')
    }
}

const getUser = async(req, res) =>{
    try {
        req = matchedData(req)
        const { id } = req
        const data = await User.findOne({
            where: {
                id: id,
                state: true
            }
        })
        if (!data) {
            return res.status(404).json({
                message: 'Usuario no encontrado o eliminado'
            });
        }

        res.status(200).json(data);
        console.log(data);

    } catch (error) {
        handleHttpError(res, 'Error al traer al usuario')
        console.error(error)
    }
}

const createUser = async(req, res) =>{
    try {
        const body = matchedData(req)
        const response = await User.create(body)
        res.send(response)
    } catch (error) {
        handleHttpError(res, 'No se pudo crear al usuario, intenta otra vez')
    }
}

const deleteUser = async(req, res) =>{
    try {
        const { id } = req.params// Estraemos el Id 
        console.log(id)

        // Eliminamos el usuario
        const response = await User.update({state: false}, {
            where: { id, state: true } // Con el id que estraemos eliminamos al usuario
        })

        if (response === 0) {
            return res.status(404).json({
                message: 'Usuario no encontrado y/o eliminado'
            })
        }

        res.status(200).json({
            message: 'Usuario eliminado con exito'
        })
    } catch (error) {
        handleHttpError(res, 'No se pudo eliminar al usuario, intenta otra vez')
        console.error(error)
    }
}

const updateUser = async(req, res) =>{
    try {
        // const {id, ...body} = matchedData(req)

        const { id, password, ...rest } = matchedData(req);
        const body = { ...rest };

        // Si se envía una nueva contraseña, se encripta
        if (password) {
            body.password = await encrypt(password);
        }

        
        const response = await User.update(body, { where: { id }})
        if (response[0] === 0) {
            return res.status(404).json({
                message: 'Usuario no encontrado o sin cambios'
            });
        }

        const updatedUser = await User.findByPk(id);
        const data = {
            token: await tokenSign(updatedUser),
            user: updatedUser
        }

        res.status(200).json({
            message: 'Usuario actualizado correctamente',
            data

        }); 
    } catch (error) {
        handleHttpError(res, 'No se pudo actualizar usuario, intenta otra vez')
        console.error(error)
    }
}


export { 
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
};