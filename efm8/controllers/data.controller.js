import { Tablero, Lista, Tarjeta } from '../models/index.js';

export const exportData = async (req, res, next) => {
  try {
    const tableros = await Tablero.findAll({
      where: { usuarioId: req.usuario.id },
      include: [{ model: Lista, include: [Tarjeta] }]
    });

    const data = {
      boards: tableros.map(t => ({
        id: t.id,
        name: t.nombre,
        lists: (t.Listas || []).map(l => ({
          id: l.id,
          name: l.nombre,
          cards: (l.Tarjetas || []).map(c => ({
            id: c.id,
            titulo: c.titulo,
            descripcion: c.descripcion,
            prioridad: c.prioridad,
            tag: c.tag,
            estado: c.estado,
            fecha_inicio: c.fecha_inicio,
            fecha_fin: c.fecha_fin,
            autor: c.autor,
            responsable: c.responsable
          }))
        }))
      }))
    };

    res.setHeader('Content-Disposition', 'attachment; filename="kanbanpro-export.json"');
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const importData = async (req, res, next) => {
  try {
    const { boards } = req.body;
    if (!boards || !Array.isArray(boards)) {
      return res.status(400).json({ ok: false, error: 'Formato inválido: se esperaba { boards: [...] }' });
    }

    const tableros = await Tablero.findAll({ where: { usuarioId: req.usuario.id } });
    const tableroIds = tableros.map(t => t.id);

    if (tableroIds.length > 0) {
      const listas = await Lista.findAll({ where: { tableroId: tableroIds } });
      const listaIds = listas.map(l => l.id);
      if (listaIds.length > 0) await Tarjeta.destroy({ where: { listaId: listaIds } });
      await Lista.destroy({ where: { tableroId: tableroIds } });
      await Tablero.destroy({ where: { usuarioId: req.usuario.id } });
    }

    for (const board of boards) {
      const tablero = await Tablero.create({ nombre: board.name, usuarioId: req.usuario.id });
      for (const list of (board.lists || [])) {
        const lista = await Lista.create({ nombre: list.name, tableroId: tablero.id });
        for (const card of (list.cards || [])) {
          const { id, ...cardData } = card;
          await Tarjeta.create({ ...cardData, listaId: lista.id });
        }
      }
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
