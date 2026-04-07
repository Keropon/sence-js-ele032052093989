import express from 'express';
import { engine } from 'express-handlebars';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes/api.routes.js';
import { verificarToken } from './middlewares/auth.middleware.js';
import { redirectIfAuthenticated } from './middlewares/redirectIfAuth.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { Tablero, Lista, Tarjeta, Usuario } from './models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/sequelize.js';
import swaggerDefinition from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const port = process.env.PORT || 3000;

// ── Security headers (CSP disabled — inline styles are used throughout) ──
app.use(helmet({ contentSecurityPolicy: false }));

// ── Body / cookie parsing ─────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.static('public'));

// ── Inject user into res.locals for all views ─────────
app.use((req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) res.locals.user = jwt.verify(token, process.env.JWT_SECRET || 'super_secreto');
  } catch { /* invalid or absent token — no action needed */ }
  next();
});

// ── API routes ────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Swagger docs ──────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

// ── GSAP from node_modules ────────────────────────────
app.use('/gsap', express.static(path.join(__dirname, 'node_modules', 'gsap')));

// ── Handlebars engine ─────────────────────────────────
app.engine('hbs', engine({
  extname:       '.hbs',
  defaultLayout: 'main',
  layoutsDir:    path.join(__dirname, 'views/layouts'),
  partialsDir:   path.join(__dirname, 'views/partials'),
  helpers: {
    length:     arr => Array.isArray(arr) ? arr.length : 0,
    eq:         (a, b) => a === b,
    formatDate: s => s ? s.split('-').reverse().join('/') : ''
  }
}));
app.set('view engine', 'hbs');

// ── View routes ───────────────────────────────────────
app.get('/', (req, res) => res.render('home'));

app.get('/register', redirectIfAuthenticated, (req, res) => res.render('register'));
app.get('/login',    redirectIfAuthenticated, (req, res) => res.render('login'));

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

app.get('/dashboard', verificarToken, async (req, res, next) => {
  try {
    const tablerosDB = await Tablero.findAll({
      where:   { usuarioId: req.usuario.id },
      include: [{ model: Lista, include: [{ model: Tarjeta }] }]
    });

    const boards = tablerosDB.map(t => {
      const tab = t.get({ plain: true });
      return {
        id:    tab.id,
        name:  tab.nombre,
        lists: tab.Listas ? tab.Listas.map(l => ({
          id:    l.id,
          name:  l.nombre,
          cards: l.Tarjetas || []
        })) : []
      };
    });

    res.render('dashboard', { boards, user: req.usuario });
  } catch (err) {
    next(err);
  }
});

// ── 404 catch-all ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', { code: '404', message: 'Página no encontrada' });
});

// ── Central error handler ─────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────
sequelize.sync({ alter: true }).then(() => {
  console.log('Base de Datos MySQL Sincronizada y Alterada.');
  app.listen(port, () => console.log(`KanbanPro escuchando en http://localhost:${port}`));
}).catch(err => console.error('Error sincronizando BD:', err));
