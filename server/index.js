const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDB, Reporte } = require('./models');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Inicializar BD
initDB();

// RUTAS

// 1. Obtener todos los reportes
app.get('/api/reportes', async (req, res) => {
  try {
    const reportes = await Reporte.findAll({ order: [['createdAt', 'DESC']] });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

// 2. Crear un nuevo reporte
app.post('/api/reportes', async (req, res) => {
  try {
    const { solicitante, categoria, componente, descripcion } = req.body;
    const nuevoReporte = await Reporte.create({
      solicitante,
      categoria,
      componente,
      descripcion
    });
    res.json(nuevoReporte);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el reporte' });
  }
});

// 3. Actualizar estado (Para los técnicos)
app.put('/api/reportes/:id', async (req, res) => {
  try {
    const { estado } = req.body;
    const reporte = await Reporte.findByPk(req.params.id);
    if (reporte) {
      reporte.estado = estado;
      await reporte.save();
      res.json(reporte);
    } else {
      res.status(404).json({ error: 'Reporte no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});