import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const ccosto = db.define('ccostos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    codigo: {
        type: DataTypes.STRING(10),
        allowNull: false
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

export default ccosto;

