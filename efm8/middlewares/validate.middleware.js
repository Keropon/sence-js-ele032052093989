import { body, validationResult } from 'express-validator';

const PRIORIDADES = ['Feature', 'Task', 'Bug', 'Improvement'];
const TAGS = ['Feature', 'Bug', 'Hotfix'];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, error: errors.array()[0].msg });
  }
  next();
};

export const validateRegister = [
  body('nombre')
    .trim().notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('email')
    .trim().isEmail().withMessage('El email no es válido'),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

export const validateLogin = [
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  handleValidationErrors
];

export const validateTablero = [
  body('nombre')
    .trim().notEmpty().withMessage('El nombre del tablero es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  handleValidationErrors
];

export const validateLista = [
  body('nombre')
    .trim().notEmpty().withMessage('El nombre de la lista es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  handleValidationErrors
];

export const validateTarjeta = [
  body('titulo')
    .trim().notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 200 }).withMessage('El título no puede superar 200 caracteres'),
  body('prioridad').optional().isIn(PRIORIDADES)
    .withMessage(`La prioridad debe ser: ${PRIORIDADES.join(', ')}`),
  body('tag').optional().isIn(TAGS)
    .withMessage(`El tag debe ser: ${TAGS.join(', ')}`),
  handleValidationErrors
];

export const validateTarjetaUpdate = [
  body('titulo').optional()
    .trim().notEmpty().withMessage('El título no puede estar vacío')
    .isLength({ max: 200 }).withMessage('El título no puede superar 200 caracteres'),
  body('prioridad').optional().isIn(PRIORIDADES)
    .withMessage(`La prioridad debe ser: ${PRIORIDADES.join(', ')}`),
  body('tag').optional().isIn(TAGS)
    .withMessage(`El tag debe ser: ${TAGS.join(', ')}`),
  handleValidationErrors
];
