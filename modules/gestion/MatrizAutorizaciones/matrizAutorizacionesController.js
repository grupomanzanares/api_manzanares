import matrizAutorizaciones from './matrizAutorizaciones.js';
import { User } from '../gestionRelations.js';

// Obtener todas las autorizaciones
export const getAutorizaciones = async (req, res) => {
    try {
        const autorizaciones = await matrizAutorizaciones.findAll();
        res.json(autorizaciones);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Obtener una autorización por ID
export const getAutorizacion = async (req, res) => {
    try {
        const autorizacion = await matrizAutorizaciones.findByPk(req.params.id);
        if (!autorizacion) {
            return res.status(404).json({ mensaje: 'Autorización no encontrada' });
        }
        res.json(autorizacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Crear una nueva autorización
export const crearAutorizacion = async (req, res) => {
    try {
        const nuevaAutorizacion = await matrizAutorizaciones.create(req.body);
        res.status(201).json(nuevaAutorizacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Actualizar una autorización
export const actualizarAutorizacion = async (req, res) => {
    try {
        const autorizacion = await matrizAutorizaciones.findByPk(req.params.id);
        if (!autorizacion) {
            return res.status(404).json({ mensaje: 'Autorización no encontrada' });
        }
        await autorizacion.update(req.body);
        res.json(autorizacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Eliminar una autorización
export const eliminarAutorizacion = async (req, res) => {
    try {
        const autorizacion = await matrizAutorizaciones.findByPk(req.params.id);
        if (!autorizacion) {
            return res.status(404).json({ mensaje: 'Autorización no encontrada' });
        }
        await autorizacion.destroy();
        res.json({ mensaje: 'Autorización eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Obtener el responsable para una empresa y emisor específicos
export const getResponsableAutorizacion = async (req, res) => {
    try {
        const { empresa, emisor } = req.query;

        if (!empresa || !emisor) {
            return res.status(400).json({ 
                mensaje: 'Se requieren los parámetros empresa y emisor' 
            });
        }

        const autorizacion = await matrizAutorizaciones.findOne({
            where: {
                empresa,
                emisor
            },
            include: [{
                model: User,
                as: 'responsable',
                attributes: ['id', 'name', 'email', 'celphone']
            }]
        });

        if (!autorizacion) {
            return res.status(404).json({ 
                mensaje: 'No se encontró un responsable asignado para esta combinación de empresa y emisor',
                empresa,
                emisor
            });
        }

        res.json({
            empresa: autorizacion.empresa,
            emisor: autorizacion.emisor,
            responsable: autorizacion.responsable,
            fechaAutorizacion: autorizacion.fechaAutorizacion
        });

    } catch (error) {
        console.error('Error al buscar responsable:', error);
        res.status(500).json({ 
            mensaje: 'Error al buscar el responsable',
            error: error.message 
        });
    }
}; 