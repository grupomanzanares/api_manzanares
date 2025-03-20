import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const comprasTipo = db.define('compras_tipos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    nombre: {
        type: DataTypes.STRING(30),
        allowNull: false
    },

    descripcion: {
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

export default comprasTipo;

