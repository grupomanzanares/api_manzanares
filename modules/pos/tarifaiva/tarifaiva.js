import db from "../../../config/db.js"

const tarifasIVA = db.define('tarifasIVA', {
    codigo: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },

    nombre: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    
    iva: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    habilitado:{
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true 
    }
},
{
    timestamps: true,
    freezeTableName: true
})

export default tarifasIVA