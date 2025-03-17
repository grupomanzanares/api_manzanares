import jwt from 'jsonwebtoken'
import User from '../auth/models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
//No entiendo esto..
const tokenSign = async (user) => {
    const sign = await jwt.sign({
        _id : User.identificacion,
        name: User.name
    },
    JWT_SECRET,
    {
        expiresIn: "24h"
    }
)
return sign;
}


//mirar si esto lo podemos quitar
const verifyToken = async (jwtToken) => {
    try {
        await jwt.verify(jwtToken, JWT_SECRET)
    } catch (error) {
        return null
    }
}





export {
    tokenSign,
    verifyToken
}