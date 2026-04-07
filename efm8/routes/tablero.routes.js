import express from 'express';
import { getTableros, createTablero, updateTablero, deleteTablero } from '../controllers/tablero.controller.js';
import { validateTablero } from '../middlewares/validate.middleware.js';

const router = express.Router();

router.get('/', getTableros);
router.post('/', validateTablero, createTablero);
router.put('/:id', validateTablero, updateTablero);
router.delete('/:id', deleteTablero);

export default router;
