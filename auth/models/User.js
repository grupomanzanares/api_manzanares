import { DataTypes, INTEGER } from "sequelize";
import db from "../../config/db.js";
import Rol from "./Rol.js"; // Importar el modelo de roles



const User = db.define('users', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    identificacion: {
        type: DataTypes.STRING, // Define el tipo de dato para identificacion si es requerido
        allowNull: true, // O 'false' si es obligatorio
        unique: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,

    },

    celphone: {
        type: DataTypes.STRING

    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: 1  
    },
    token: DataTypes.STRING,
    confirmed: DataTypes.BOOLEAN

}, {
    timestamps: true
});


// Relación con Role
User.belongsTo(Rol, { foreignKey: 'rolId', as: 'rol' }); // Un usuario tiene un rol
Rol.hasMany(User, { foreignKey: 'rolId', as: 'users' }); // Un rol puede tener muchos usuarios


export default User;
