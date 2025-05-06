import db from "../../../config/db.js"

const unidadmedida = db.define('unidadmedida', {
    codigo: {
        type: Datatypes.INTEGER,
        primaryKey: true
    },
    
    nombre: {
        type: Datatypes.STRING(30),
        allowNull: false
    },

    unidadInternacional: {
        type: Datatypes.STRING(5),
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
});

export default unidadmedida