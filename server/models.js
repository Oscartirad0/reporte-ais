const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');

// Conexión a SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false // Para limpiar la consola
});

// Definición del Modelo de Reporte
const Reporte = sequelize.define('Reporte', {
  solicitante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING, // 'Hardware' o 'Software'
    allowNull: false
  },
  componente: {
    type: DataTypes.STRING, // Ej: 'Disco Duro', 'Windows'
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'Pendiente' // Pendiente, En Revisión, Solucionado
  }
});

// Definición del Modelo de Admin
const Admin = sequelize.define('Admin', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
      }
    }
  }
});

const initDB = async () => {
  try {
    await sequelize.sync(); // Crea la tabla si no existe
    console.log('Base de datos SQLite sincronizada correctamente.');
    
    const adminExists = await Admin.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      await Admin.create({ username: 'admin', password: 'admin123' });
      console.log('Usuario admin creado por defecto.');
    }

  } catch (error) {
    console.error('Error al conectar con la BD:', error);
  }
};

module.exports = { sequelize, Reporte, Admin, initDB };