import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const registroDian = db.define('registros_dian', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    emisor: {
        type: DataTypes.STRING(20),
        allowNull: false
    },

    nombreEmisor: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    empresa: {
        type: DataTypes.STRING(20),
        allowNull: false
    },

    tipo: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    numero: {
        type: DataTypes.STRING(15),
        allowNull: false
    },

    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    cufe: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    valor: {
        type: DataTypes.DECIMAL(17, 4), 
        allowNull: false,  
    },
    habilitado:{
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true 
    },
    conciliado:{
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: false 
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

export default registroDian;

