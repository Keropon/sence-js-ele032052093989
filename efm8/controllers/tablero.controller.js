import { Tablero, Lista, Tarjeta } from '../models/index.js';

export const getTableros = async (req, res, next) => {
  try {
    const tableros = await Tablero.findAll({
      where: { usuarioId: req.usuario.id },
      include: [{ model: Lista, include: [Tarjeta], order: [['id', 'ASC']] }],
      order: [['id', 'ASC']]
    });
    res.json(tableros);
  } catch (err) {
    next(err);
  }
};

export const createTablero = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const nuevoTablero = await Tablero.create({ nombre, usuarioId: req.usuario.id });
    res.status(201).json(nuevoTablero);
  } catch (err) {
    next(err);
  }
};

export const updateTablero = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const tablero = await Tablero.findOne({ where: { id, usuarioId: req.usuario.id } });
    if (!tablero) return res.status(404).json({ ok: false, error: 'Tablero no encontrado' });

    tablero.nombre = nombre || tablero.nombre;
    await tablero.save();
    res.json(tablero);
  } catch (err) {
    next(err);
  }
};

export const deleteTablero = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tablero = await Tablero.findOne({ where: { id, usuarioId: req.usuario.id } });
    if (!tablero) return res.status(404).json({ ok: false, error: 'Tablero no encontrado' });

    await tablero.destroy();
    res.json({ ok: true, message: 'Tablero eliminado' });
  } catch (err) {
    next(err);
  }
};
