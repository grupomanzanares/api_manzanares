
import  jwt  from "jsonwebtoken";
import { handleHttpError } from '../../helpers/httperror.js';

const apiAuth = (req, res, next) =>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ error: 'No se proporcionó un token.' });
    }
    const token = authHeader.split(' ')[1];
try { 
        const decoded = jwt.verify(token,  process.env.JWT_SECRET) 
        req.user = decoded; // Adjunta datos decodificados al request


                // // Verificar si el usuario tiene permisos (ejemplo)
                // if (req.user.role !== 'admin') {
                //     return res.status(403).json({ error: 'No tienes permisos para esta acción.' }); // 403
                // }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return handleHttpError(res, 'El token ha expirado.', 401);
        } else if (error.name === 'JsonWebTokenError') {
            return handleHttpError(res, 'Token inválido.', 401);
        } else {
            return handleHttpError(res, 'Error al procesar el token.', 500);
        }
    }
}

export{
    apiAuth
}