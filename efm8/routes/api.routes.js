import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { importLimit } from '../middlewares/importLimit.middleware.js';
import authRoutes from './auth.route.js';
import tableroRoutes from './tablero.routes.js';
import listaRoutes from './lista.routes.js';
import tarjetaRoutes from './tarjeta.routes.js';
import { exportData, importData } from '../controllers/data.controller.js';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/tableros', verificarToken, tableroRoutes);
router.use('/tableros/:tableroId/listas', verificarToken, listaRoutes);
router.use('/listas/:listaId/tarjetas', verificarToken, tarjetaRoutes);

router.get('/export', verificarToken, exportData);
router.post('/import', verificarToken, importLimit, importData);

export default router;
