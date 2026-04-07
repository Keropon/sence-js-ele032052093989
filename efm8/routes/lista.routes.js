import express from 'express';
import { createLista, updateLista, deleteLista } from '../controllers/lista.controller.js';
import { validateLista } from '../middlewares/validate.middleware.js';
import { requireTableroOwnership } from '../middlewares/ownership.middleware.js';

// mergeParams: true gives this router access to :tableroId from the parent
const router = express.Router({ mergeParams: true });

router.use(requireTableroOwnership);

router.post('/', validateLista, createLista);
router.put('/:listaId', validateLista, updateLista);
router.delete('/:listaId', deleteLista);

export default router;
