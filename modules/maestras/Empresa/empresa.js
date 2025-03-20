import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const empresa = db.define('empresas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nit: {
        type: DataTypes.STRING(20),
        unique: true,  // La identificación debe ser única
        allowNull: false
    },
    logo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    

    estado:{
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true 
    },
    user: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    userMod: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
},
{
    timestamps: true,
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

export default empresa;

