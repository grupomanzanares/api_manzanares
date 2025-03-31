import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const Rol = db.define('roles', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    state: {
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: 1  
    },
}, {
    timestamps: true,
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

export default Rol;