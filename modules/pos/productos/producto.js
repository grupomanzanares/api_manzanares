import { DataTypes } from "sequelize"
import db from "../../../config/db.js"

const producto = db.define('productos', {
    codigo: {
        type: DataTypes.STRING(30),
        primaryKey: true
    },

    descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    
})