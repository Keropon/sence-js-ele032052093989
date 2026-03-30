import 'dotenv/config'
import express from 'express'
import { Task } from './models/index.js'
import { buildTaskLinks } from './helpers/hateoas.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/tareas', async (req, res) => {
  try {
    const tasks = await Task.findAll()

    const tasksWithLinks = tasks.map(task => ({
      ...task.toJSON(),
      links: buildTaskLinks(task.id)
    }))

    res.json(tasksWithLinks)

  } catch (error) {
    res.status(500).json({ error: error.message || 'Error del servidor' })
  }
})

app.get('/tareas/:id', async (req, res) => {
  try {
    if (isNaN(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido, debe ser un número' })
    }

    const task = await Task.findByPk(req.params.id)

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    res.json({
      ...task.toJSON(),
      links: buildTaskLinks(task.id)
    })

  } catch (error) {
    res.status(500).json({ error: error.message || 'Error del servidor' })
  }
})

app.post('/tareas', async (req, res) => {
  try {
    const newTask = await Task.create(req.body)

    res.status(201).json({
      ...newTask.toJSON(),
      links: buildTaskLinks(newTask.id)
    })

  } catch (error) {
    res.status(400).json({ error: error.message || 'Petición inválida' })
  }
})

app.put('/tareas/:id', async (req, res) => {
  try {
    const [updated] = await Task.update(req.body, {
      where: { id: req.params.id }
    })

    if (updated === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    const updatedTask = await Task.findByPk(req.params.id)

    res.json({
      message: 'Tarea actualizada correctamente',
      data: updatedTask
    })

  } catch (error) {
    res.status(400).json({ error: error.message || 'Petición inválida' })
  }
})

app.delete('/tareas/:id', async (req, res) => {
  try {
    const deleted = await Task.destroy({
      where: { id: req.params.id }
    })

    if (deleted === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    res.status(204).send()

  } catch (error) {
    res.status(500).json({ error: error.message || 'Error del servidor' })
  }
})

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.listen(PORT, async () => {
  try {
    await Task.sync({ alter: true })
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
    console.log('Base de datos conectada correctamente')
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error)
  }
})

export default app
