import compraAutorizada from './compraAutorizada.js';

// Obtener todas las autorizaciones
export const getAutorizaciones = async (req, res) => {
    try {
        const autorizaciones = await compraAutorizada.findAll();
        res.json(autorizaciones);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Obtener una autorización por ID
export const getAutorizacion = async (req, res) => {
    try {
        const autorizacion = await compraAutorizada.findByPk(req.params.id);
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
        const nuevaAutorizacion = await compraAutorizada.create(req.body);
        res.status(201).json(nuevaAutorizacion);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Actualizar una autorización
export const actualizarAutorizacion = async (req, res) => {
    try {
        const autorizacion = await compraAutorizada.findByPk(req.params.id);
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
        const autorizacion = await compraAutorizada.findByPk(req.params.id);
        if (!autorizacion) {
            return res.status(404).json({ mensaje: 'Autorización no encontrada' });
        }
        await autorizacion.destroy();
        res.json({ mensaje: 'Autorización eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
}; 