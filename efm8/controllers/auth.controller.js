import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario, Tablero, Lista, Tarjeta } from '../models/index.js';

const SECRET = process.env.JWT_SECRET || 'super_secreto';

export const register = async (req, res, next) => {
  const { nombre, email, password } = req.body;

  try {
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ ok: false, error: 'Ya existe una cuenta con ese email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Usuario.create({ nombre, email, password: hashedPassword, rol: 'usuario' });

    const tablero = await Tablero.create({ nombre: 'Mi Primer Proyecto', usuarioId: newUser.id });
    const lista1 = await Lista.create({ nombre: 'Backlog', tableroId: tablero.id });
    await Lista.create({ nombre: 'En Progreso', tableroId: tablero.id });
    await Lista.create({ nombre: 'Finalizado', tableroId: tablero.id });

    await Tarjeta.create({
      titulo: 'Bienvenida a KanbanPro',
      descripcion: 'Edita esta tarjeta o muévela a otras listas.',
      prioridad: 'Feature',
      tag: 'Feature',
      estado: 'Backlog',
      listaId: lista1.id
    });

    console.log('\n--- Nuevo Usuario Registrado ---');
    console.table([{ ID: newUser.id, Nombre: newUser.nombre, Email: newUser.email, Rol: newUser.rol }]);

    res.status(201).json({ ok: true, message: 'Usuario registrado correctamente' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ ok: false, error: 'Usuario no encontrado o contraseña incorrecta' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Usuario no encontrado o contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000
    });

    console.log('\n--- Inicio de Sesión Exitoso ---');
    console.table([{ ID: user.id, Nombre: user.nombre, Email: user.email }]);

    res.json({ ok: true, message: 'Login exitoso', token });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true, message: 'Sesión cerrada correctamente' });
};
