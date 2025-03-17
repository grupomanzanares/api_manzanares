
import bcrypt from 'bcryptjs'

const encrypt = async (pass) =>{    
    if (!pass) {
        throw new Error("La contraseña no puede estar vacía");
    }
    const hash = await bcrypt.hash(pass, 10)
    return  hash;
}

const compare = async (pass, hashPassword) => {
    const resp = await bcrypt.compare(pass, hashPassword)
    return resp;

}

export{
    encrypt,
    compare
}