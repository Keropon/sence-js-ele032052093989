export const errorHandler = (err, req, res, _next) => {
  console.error('[error]', err);

  const status  = err.status || err.statusCode || 500;
  const message = err.userMessage || err.message || 'Error interno del servidor';

  if (req.path.startsWith('/api')) {
    return res.status(status).json({ ok: false, error: message });
  }

  res.status(status).render('error', {
    code:    String(status),
    message: status === 404 ? 'Página no encontrada' : 'Error interno del servidor',
    detail:  status !== 404 ? 'Algo salió mal. Por favor intenta de nuevo más tarde.' : undefined
  });
};
