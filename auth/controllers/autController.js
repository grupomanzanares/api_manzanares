import { matchedData } from "express-validator"

import User from "../models/User.js"
import { handleHttpError } from "../../helpers/httperror.js"
import jwt from 'jsonwebtoken'; // Importa jsonwebtoken
import { encrypt, compare } from "../helpers/password.js"
import { tokenSign } from "../../helpers/jwt.js"
import { emailRecoverPassword } from "../../helpers/emails.js";
import { check, validationResult } from "express-validator";
import { generatorId } from "../helpers/token.js";

const login = async (req, res) => {
    try {
        // Validar y sanitizar los datos de entrada
        req = matchedData(req);

        // Buscar al usuario por identificación
        const user = await User.findOne({ where: { identificacion: req.identificacion } });

        if (!user) {
            // Mensaje genérico para evitar filtrado de información
            return handleHttpError(res, 'Credenciales inválidas');
        }

        // Comparar la contraseña
        const hashPassword = user.password;
        const isPasswordValid = await compare(req.password, hashPassword);

        if (!isPasswordValid) {
            return handleHttpError(res, 'Credenciales inválidas');
        }

        // Eliminar la contraseña del objeto de usuario antes de enviar
        user.set("password", undefined, { strict: false });

        // Generar token JWT
        const token = await tokenSign(user);

        // Preparar los datos de respuesta
        const data = {
            token,
            user
        };

        // Enviar respuesta
        res.send(data);
    } catch (error) {
        console.error("Error en login:", error);
        handleHttpError(res, 'Error de login');
    }
};


const register = async (req, res) => {

    try {

        req = matchedData(req)

        const passwordHash = await encrypt(req.password)
        const body = { ...req, password: passwordHash }
        const response = await User.create(body)

        response.set("password", undefined, { strict: false })

        const data = {
            token: await tokenSign(response),
            user: response
        }

        // res.send({data})
        res.status(201).send({ data });

    } catch (error) {
        console.error("Error al registrar usuario:", error);

        // Manejar errores de clave única
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).send({
                message: "El usuario ya se encuentra registrado con esa identificación.",
                field: error.errors[0].path, // Campo que causó el error
            });
        }
        // Manejar otros errores
        res.status(500).send({
            message: "Ocurrió un error al registrar el usuario.",
            error: error.message,
        });
    }
}

const generateToken = async (req, res) => {
    try {
        const { identificacion, password } = req.body;

        // Buscar usuario únicamente por identificación
        const user = await User.findOne({
            where: { identificacion },
        });

        if (!user) {
            return res.status(401).send({ error: "Credenciales inválidas" });
        }

        // Comparar la contraseña proporcionada con la almacenada
        const isPasswordValid = await compare(password, user.password); // compare es una función que usa bcrypt

        if (!isPasswordValid) {
            return res.status(401).send({ error: "Credenciales inválidas" });
        }
        // Generar token JWT válido por 24 horas
        const token = jwt.sign(
            { id: user.identificacion, name: user.name },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h", // Tiempo de expiración
            }
        );

        res.send({ token });
    } catch (error) {
        console.error("Error al generar token:", error.message);
        res.status(500).send({ error: "Error interno del servidor" });
    }
};


/** Paso 1:  Solicitar recuperacion de contraseña cuando hay olvido */
const forgotPassword = async(req, res) => {

        /** Imprimir en consola lo recibido */
        console.log(req);


        /**  Extraer datos o desestructurar */ 
        const {identificacion,name, email } = req.body;

        /**  Validar que vengan los datos requeridos */ 
        await check("identificacion").notEmpty().withMessage("La cédula es obligatoria").run(req);
        await check('email').isEmail().withMessage('No cumple con las características de un correo ').run(req)
        let result = validationResult(req)
    
        /** verificar que no hay errores  */
        if(!result.isEmpty()){
            return res.status(400).json({ errors: result.array() });
        }

        /** Buscar en la base de datos el usuario por identificacion y email */
        const user = await User.findOne({ where: {identificacion, email }})
        if(!user){
            return res.status(404).json({ message: "No se encontró un usuario con estos datos" });
        }
        console.log ("Usuario encontrado,  se procede a generar token para enviar en correo")


        /** Generar Nuevo token y enviar correo  */
        user.token= generatorId();
        await user.save();


    
        /** Enviar email:  deben estar configurados en el .env las variables para el envio de correo */ 
        emailRecoverPassword({
            name: user.name,
            email: user.email,
            token: user.token
        });

        return res.json({ message: "Hemos enviado un correo con las instrucciones para recuperar la contraseña" });

}

/** Paso2 :  Validar si el token es correcto o no:   
 * Debio llegar un email al usuario donde hay un link: ejemplo
 * https://gmanzanares.com.co/auth/forgot-password/1ijvt4hlv9cd7ll3vp2
 * Esta uncion recibe el token y valida que este guardado en la base de datos
 */
const recoverTokenConfirm = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({ where: { token } });

    if (!user) {
        return res.status(400).json({ message: "Token inválido o expirado" });
    }

    return res.json({ message: "Token válido", token });
};





/** Paso 3: Cambiar contraseña,  se solicita nuevo password y token */
const recover = async (req, res) => {

    /*** Desestructurar datos */    
    const { password, token } = req.body
    
    /** Encriptar Contraseña */
    const passwordHash = await encrypt(password)

 
    
    /** Chequear que el password cumpla con la */
    await check("password").isLength({ min: 10 }).withMessage("La contraseña debe tener al menos 6 caracteres").run(req);
    let result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }

    const user = await User.findOne({ where: { token } });
    if (!user) {
        return res.status(400).json({ message: "Token inválido o expirado" });
    }

    user.token = null;
    user.password = passwordHash
    await user.save();

    return res.json({ message: "Contraseña actualizada correctamente" });
};


export {
    login,
    register,
    generateToken,
    forgotPassword,recoverTokenConfirm, recover
}