import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const compraReportada = db.define('compras_reportadas', {
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

    factura: {
        type: DataTypes.STRING(20),
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

    urlPdf: {
        type: DataTypes.STRING(150),
        allowNull: false
    },

    ccosto: {
        type: DataTypes.STRING(20),
        allowNull: false
    },

    valor: {
        type: DataTypes.DECIMAL(17, 2), 
        allowNull: false,  
    },

    observacionResponsable: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    observacionContable: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    habilitado:{
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true 
    },

    conciliado:{
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

export default compraReportada;

