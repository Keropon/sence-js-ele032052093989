import { Tarjeta, Lista, Tablero } from '../models/index.js';

const checkUserAccess = async (listaId, usuarioId) => {
  const lista = await Lista.findByPk(listaId, { include: Tablero });
  if (!lista || lista.Tablero.usuarioId !== usuarioId) return null;
  return lista;
};

export const createTarjeta = async (req, res, next) => {
  try {
    const { listaId } = req.params;
    const { titulo, descripcion, prioridad, tag, estado, fecha_inicio, fecha_fin, autor, responsable } = req.body;

    const lista = await checkUserAccess(listaId, req.usuario.id);
    if (!lista) return res.status(404).json({ ok: false, error: 'Lista no encontrada o sin acceso' });

    const nuevaTarjeta = await Tarjeta.create({
      titulo, descripcion, prioridad, tag,
      estado: estado || lista.estado,
      fecha_creacion: new Date(),
      fecha_inicio, fecha_fin, autor, responsable, listaId
    });

    res.status(201).json(nuevaTarjeta);
  } catch (err) {
    next(err);
  }
};

export const updateTarjeta = async (req, res, next) => {
  try {
    const { listaId, tarjetaId } = req.params;
    const { titulo, descripcion, prioridad, tag, estado, fecha_inicio, fecha_fin, autor, responsable } = req.body;

    const lista = await checkUserAccess(listaId, req.usuario.id);
    if (!lista) return res.status(404).json({ ok: false, error: 'No autorizado' });

    const tarjeta = await Tarjeta.findOne({ where: { id: tarjetaId, listaId } });
    if (!tarjeta) return res.status(404).json({ ok: false, error: 'Tarjeta no encontrada' });

    await tarjeta.update({ titulo, descripcion, prioridad, tag, estado, fecha_inicio, fecha_fin, autor, responsable });
    res.json(tarjeta);
  } catch (err) {
    next(err);
  }
};

export const moveTarjeta = async (req, res, next) => {
  try {
    const { listaId: toListId, tarjetaId } = req.params;

    const listaDestino = await checkUserAccess(toListId, req.usuario.id);
    if (!listaDestino) return res.status(404).json({ ok: false, error: 'Lista destino no autorizada' });

    const tarjeta = await Tarjeta.findOne({
      where: { id: tarjetaId },
      include: { model: Lista, include: { model: Tablero, where: { usuarioId: req.usuario.id } } }
    });
    if (!tarjeta) return res.status(404).json({ ok: false, error: 'Tarjeta no encontrada' });

    await tarjeta.update({ listaId: toListId, estado: listaDestino.estado });
    res.json({ ok: true, message: 'Movimiento exitoso', tarjeta });
  } catch (err) {
    next(err);
  }
};

export const deleteTarjeta = async (req, res, next) => {
  try {
    const { listaId, tarjetaId } = req.params;

    const lista = await checkUserAccess(listaId, req.usuario.id);
    if (!lista) return res.status(404).json({ ok: false, error: 'No autorizado' });

    const tarjeta = await Tarjeta.findOne({ where: { id: tarjetaId, listaId } });
    if (!tarjeta) return res.status(404).json({ ok: false, error: 'Tarjeta no encontrada' });

    await tarjeta.destroy();
    res.json({ ok: true, message: 'Tarjeta eliminada' });
  } catch (err) {
    next(err);
  }
};
