import { DataTypes } from "sequelize";
import db from "../../../config/db.js";

const CompraReportadaDetalle = db.define("compraReportadaDetalle", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.STRING,
        allowNull: false
    },

    numeroItem: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    ProductoProveedor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombreProductoProveedor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    producto: {
        type: DataTypes.INTEGER,
        allowNull: true // Puede ser null inicialmente
    },
    nombreProducto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    CentroDeCosto: {
        type: DataTypes.INTEGER,
        allowNull: true // Puede ser null inicialmente
    },
    cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    costoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    poriva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    costoTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    compraReportadaId: {
        type: DataTypes.INTEGER,
        allowNull: true // Puede ser null inicialmente
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userMod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    archivo: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "compraReportadaDetalle",
    timestamps: true,
    freezeTableName: true 
});

export default CompraReportadaDetalle; 