const MAX_BOARDS = 20;
const MAX_LISTS = 30;
const MAX_CARDS = 100;

export const importLimit = (req, res, next) => {
  const { boards } = req.body;
  if (!boards) return next();

  if (boards.length > MAX_BOARDS) {
    return res.status(400).json({
      ok: false,
      error: `Demasiados tableros en el archivo (máx. ${MAX_BOARDS})`
    });
  }

  for (const board of boards) {
    const lists = board.lists || [];
    if (lists.length > MAX_LISTS) {
      return res.status(400).json({
        ok: false,
        error: `El tablero "${board.name || ''}" supera el límite de listas (máx. ${MAX_LISTS})`
      });
    }
    for (const list of lists) {
      if ((list.cards || []).length > MAX_CARDS) {
        return res.status(400).json({
          ok: false,
          error: `Una lista supera el límite de tarjetas (máx. ${MAX_CARDS})`
        });
      }
    }
  }

  next();
};
