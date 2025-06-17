import Fundacion from '../../models/Fundacion.model.js';
import Proveedor from '../../models/Proveedor.model.js';
import Usuario from '../../models/Usuario.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalFundaciones = await Fundacion.countDocuments();
    const totalProveedores = await Proveedor.countDocuments();
    const totalUsuarios = await Usuario.countDocuments();

    // Calcular el crecimiento (ejemplo: comparar con el mes anterior)
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    
    const newFundaciones = await Fundacion.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    const newProveedores = await Proveedor.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    const newUsuarios = await Usuario.countDocuments({
      createdAt: { $gte: lastMonth }
    });

    const stats = {
      totalFundaciones,
      totalProveedores,
      totalUsuarios,
      newFundaciones,
      newProveedores,
      newUsuarios
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const recentFundaciones = await Fundacion.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nombre createdAt');

    const recentProveedores = await Proveedor.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nombre createdAt');

    const recentUsuarios = await Usuario.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nombre createdAt');

    const activities = [
      ...recentFundaciones.map(f => ({
        type: 'fundacion',
        message: `Nueva fundación registrada: ${f.nombre}`,
        time: f.createdAt
      })),
      ...recentProveedores.map(p => ({
        type: 'proveedor',
        message: `Nuevo proveedor registrado: ${p.nombre}`,
        time: p.createdAt
      })),
      ...recentUsuarios.map(u => ({
        type: 'usuario',
        message: `Nuevo usuario registrado: ${u.nombre}`,
        time: u.createdAt
      }))
    ].sort((a, b) => b.time - a.time)
     .slice(0, 10);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 