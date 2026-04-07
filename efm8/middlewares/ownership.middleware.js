import { Tablero } from '../models/index.js';

export const requireTableroOwnership = async (req, res, next) => {
  try {
    const { tableroId } = req.params;
    const tablero = await Tablero.findOne({
      where: { id: tableroId, usuarioId: req.usuario.id }
    });
    if (!tablero) {
      return res.status(404).json({ ok: false, error: 'Tablero no encontrado o no autorizado' });
    }
    req.tablero = tablero;
    next();
  } catch (err) {
    next(err);
  }
};
