require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { initDB, Reporte, Admin } = require('./models');

const app = express();
const PORT = 3001;
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Inicializar BD
initDB();

// --- CONFIGURACIÓN EMAIL ---
const transporter = nodemailer.createTransport({
  service: 'gmail', // O tu servicio de preferencia
  auth: {
    user: process.env.EMAIL_USER || 'tu_correo@gmail.com',
    pass: process.env.EMAIL_PASS || 'tu_contraseña_app'
  }
});

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// --- RUTAS DE AUTENTICACIÓN ---

// Registro (Para crear el primer admin)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.create({ username, password });
    res.json({ message: 'Admin creado',  adminId: admin.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar admin' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ where: { username } });

    if (!admin) return res.status(404).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ token, username: admin.username });
  } catch (error) {
    res.status(500).json({ error: 'Error en login' });
  }
});

// --- RUTAS DE REPORTES ---

// 1. Obtener todos los reportes (Público o Privado? Dejémoslo público por ahora, o verifique requirement. 
// User said "Login funcional de Admin". Usually reports are private. Let's protect it? 
// The prompt implies "cuando usuario rellene el formulario" -> Public POST.
// Admin login -> implies Admin features like viewing/managing.
// So GET /api/reportes shoudl be PROTECTED? 
// In the current App.jsx, the main view fetches reportes. If we protect it, the public page breaks.
// Let's protect it fully? Or maybe just 'PUT/DELETE'. The prompt: "Login funcional de Admin".
// Usually lists are for admins. Users just submit.
// I will PROTECT GET /api/reportes. Public users don't need to see all reports (privacy).
// But existing app shows history. Maybe I should leave GET public but restricted details?
// I'll PROTECT GET, PUT, DELETE. Public can only POST.

app.get('/api/reportes', verifyToken, async (req, res) => {
  try {
    const reportes = await Reporte.findAll({ order: [['createdAt', 'DESC']] });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

// 2. Crear un nuevo reporte (PÚBLICO) + ENVÍO DE CORREO
app.post('/api/reportes', async (req, res) => {
  try {
    const { solicitante, categoria, componente, descripcion } = req.body;
    
    // Guardar en BD
    const nuevoReporte = await Reporte.create({
      solicitante,
      categoria,
      componente,
      descripcion
    });

    // Enviar Correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_DESTINO || process.env.EMAIL_USER, // Se envía al admin
      subject: `Nuevo Reporte de Falla: ${categoria} - ${componente}`,
      text: `
        Nuevo reporte recibido:
        -----------------------
        Solicitante: ${solicitante}
        Categoría: ${categoria}
        Componente: ${componente}
        Descripción: ${descripcion}
        
        Fecha: ${new Date().toLocaleString()}
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error enviando correo:', error);
      } else {
        console.log('Correo enviado: ' + info.response);
      }
    });

    res.json(nuevoReporte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el reporte' });
  }
});

// 3. Actualizar estado (PROTEGIDO)
app.put('/api/reportes/:id', verifyToken, async (req, res) => {
  try {
    const { estado, solicitante, categoria, componente, descripcion } = req.body; // Added other fields for update
    const reporte = await Reporte.findByPk(req.params.id);
    if (reporte) {
        if(estado) reporte.estado = estado;
        if(solicitante) reporte.solicitante = solicitante;
        if(categoria) reporte.categoria = categoria;
        if(componente) reporte.componente = componente;
        if(descripcion) reporte.descripcion = descripcion;
        
      await reporte.save();
      res.json(reporte);
    } else {
      res.status(404).json({ error: 'Reporte no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

// 4. Eliminar reporte (PROTEGIDO)
app.delete('/api/reportes/:id', verifyToken, async (req, res) => {
    try {
        const reporte = await Reporte.findByPk(req.params.id);
        if (reporte) {
            await reporte.destroy();
            res.json({ message: 'Reporte eliminado' });
        } else {
            res.status(404).json({ error: 'Reporte no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});