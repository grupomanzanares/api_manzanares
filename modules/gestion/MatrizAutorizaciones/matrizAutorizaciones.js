import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const matrizAutorizaciones = db.define('matriz_autorizaciones', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    empresa: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    emisor: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    responsableId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fechaAutorizacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
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
    freezeTableName: true
});

export default matrizAutorizaciones; 