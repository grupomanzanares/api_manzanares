import jwt from 'jsonwebtoken';

/** Se genera token para enviar a correo y validar recuperacion de contraseña */
const generatorId = () => Date.now().toString(32) + Math.random().toString(32).substring(2);

export{
    generatorId
}