const mongoose = require('mongoose');

const personajeSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  nombre: {
    type: String,
    required: true,
    trim: true,
    match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/, 'El nombre solo puede contener letras, espacios y no puede estar vacío.']
  },
  alias: {
    type: String,
    required: true,
    trim: true,
    match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/, 'El alias solo puede contener letras, espacios y no puede estar vacío.']
  },
  ciudad: {
    type: String,
    required: true,
    trim: true,
    match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/, 'La ciudad solo puede contener letras, espacios y no puede estar vacía.']
  },
  team: {
    type: String,
    required: true,
    trim: true,
    match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/, 'El team solo puede contener letras, espacios y no puede estar vacío.']
  },
  rol: {
    type: String,
    required: true,
    enum: ['heroe', 'villano']
  },
  defensa: { type: Number, default: 200, min: 0 },
  poder: { type: Number, default: 1, min: 1 },
  experiencia: { type: Number, default: 0, min: 0 },
  golpeBasico: { type: Number, default: 20, min: 0 },
  golpeEspecial: { type: Number, default: 40, min: 0 },
  golpeCritico: { type: Number, default: 60, min: 0 }
});

// Autoincrementar id
personajeSchema.pre('save', async function(next) {
  if (this.isNew) {
    const last = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = last ? last.id + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Personaje', personajeSchema); 