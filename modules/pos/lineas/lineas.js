import db from "../../../config/db.js"

const lineas = db.define('lineas', {
    codigo: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },

    nombre: {
        type: DataTypes.STRING(30),
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

export default lineas;