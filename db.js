const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('MongoDB conectado');
})
.catch((err) => {
  console.error('Error de conexión a MongoDB:', err);
});

module.exports = mongoose;