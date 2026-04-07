import express from 'express';
import { createTarjeta, updateTarjeta, deleteTarjeta, moveTarjeta } from '../controllers/tarjeta.controller.js';
import { validateTarjeta, validateTarjetaUpdate } from '../middlewares/validate.middleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', validateTarjeta, createTarjeta);
router.put('/:tarjetaId', validateTarjetaUpdate, updateTarjeta);
router.put('/:tarjetaId/move', moveTarjeta);
router.delete('/:tarjetaId', deleteTarjeta);

export default router;
