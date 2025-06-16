import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const producto = db.define('productos', {
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
    

    und: {
        type: DataTypes.STRING(5),
        allowNull: false
    },

    
    grupo: {
        type: DataTypes.STRING(5),
        allowNull: false
    },

   
    subgrupo: {
        type: DataTypes.STRING(5),
        allowNull: false
    },
    estado:{
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true 
    },
    user: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    userMod: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
},

{
    timestamps: true,
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

export default producto;

