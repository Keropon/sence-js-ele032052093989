import express from 'express'
import fileUpload from 'express-fileupload'
import fs from 'fs'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 3000

app.use(fileUpload())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

const UPLOAD_DIR = 'uploads/avatar'
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

app.post('/upload/avatar/:userId', (req, res) => {
  const userId = req.params.userId

  if (!req.files || !req.files.avatar || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      msg: 'Debe enviar un archivo de imagen en el campo "avatar"',
    })
  }

  const avatar = req.files.avatar
  const extension = avatar.name.split('.').pop().toLowerCase()
  const allowedImg = ['jpg', 'jpeg', 'png', 'tiff', 'bmp', 'gif']

  if (!allowedImg.includes(extension)) {
    return res.status(400).json({
      ok: false,
      msg: `Formato no permitido. Use: ${allowedImg.join(', ')}`,
    })
  }

  const avatarName = `${userId}.${extension}`
  const avatarPath = path.join(UPLOAD_DIR, avatarName)

  deleteIfExists(UPLOAD_DIR, userId)

  avatar.mv(avatarPath, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        msg: 'Error al guardar el avatar',
      })
    }

    return res.json({
      ok: true,
      msg: 'Avatar subido correctamente',
      data: {
        userId,
        url: `/uploads/avatar/${avatarName}`,
      },
    })
  })
})

app.get('/avatar/:userId', (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR)
  const file = files.find(f => f.startsWith(req.params.userId + '.'))

  if (!file) {
    return res.status(404).json({
      ok: false,
      msg: 'Avatar no encontrado',
    })
  }

  res.sendFile(path.resolve(path.join(UPLOAD_DIR, file)))
})

function deleteIfExists(folder, userId) {
  if (!fs.existsSync(folder)) return

  const files = fs.readdirSync(folder)

  files.forEach((file) => {
    if (file.startsWith(userId.toString() + '.')) {
      fs.unlinkSync(path.join(folder, file))
    }
  })
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
