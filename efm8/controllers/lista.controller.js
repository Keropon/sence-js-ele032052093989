import { Lista } from '../models/index.js';

export const createLista = async (req, res, next) => {
  try {
    const { tableroId } = req.params;
    const { nombre } = req.body;

    const nuevaLista = await Lista.create({ nombre, tableroId });
    res.status(201).json(nuevaLista);
  } catch (err) {
    next(err);
  }
};

export const updateLista = async (req, res, next) => {
  try {
    const { tableroId, listaId } = req.params;
    const { nombre } = req.body;

    const lista = await Lista.findOne({ where: { id: listaId, tableroId } });
    if (!lista) return res.status(404).json({ ok: false, error: 'Lista no encontrada' });

    lista.nombre = nombre || lista.nombre;
    await lista.save();
    res.json(lista);
  } catch (err) {
    next(err);
  }
};

export const deleteLista = async (req, res, next) => {
  try {
    const { tableroId, listaId } = req.params;

    const lista = await Lista.findOne({ where: { id: listaId, tableroId } });
    if (!lista) return res.status(404).json({ ok: false, error: 'Lista no encontrada' });

    await lista.destroy();
    res.json({ ok: true, message: 'Lista eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};
