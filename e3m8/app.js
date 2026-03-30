import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const SECRET_KEY = process.env.JWT_SECRET

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const users = []

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' })
    }

    const userExists = users.some(u => u.username === username)
    if (userExists) {
      return res.status(409).json({ error: 'El nombre de usuario ya está en uso' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      role: 'user'
    }

    users.push(newUser)

    res.status(201).json({ message: 'Usuario registrado correctamente' })

  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' })
    }

    const user = users.find(u => u.username === username)

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    }

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' })

    res.json({ token })

  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' })
  }
})

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decodedPayload = jwt.verify(token, SECRET_KEY)
    req.user = decodedPayload
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }
}

app.get('/perfil', verifyToken, (req, res) => {
  res.json({
    message: 'Acceso concedido al perfil',
    user: req.user
  })
})

app.get('/users', verifyToken, (req, res) => {
  res.json({
    user: req.user,
    users: users.map(u => ({ id: u.id, username: u.username, role: u.role }))
  })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
  console.log(`Servidor: http://localhost:${PORT}`)
  console.log(`Registro:  http://localhost:${PORT}/register.html`)
  console.log(`Login:     http://localhost:${PORT}/login.html`)
  console.log(`Perfil:    http://localhost:${PORT}/perfil (requiere token)`)
})
