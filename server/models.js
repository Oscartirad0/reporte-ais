const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

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

const initDB = async () => {
  try {
    await sequelize.sync(); // Crea la tabla si no existe
    console.log('Base de datos SQLite sincronizada correctamente.');
  } catch (error) {
    console.error('Error al conectar con la BD:', error);
  }
};

module.exports = { sequelize, Reporte, initDB };