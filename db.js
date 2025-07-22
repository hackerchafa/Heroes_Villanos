const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log('MongoDB conectado');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de conexión a MongoDB:', err);
});

module.exports = mongoose; 