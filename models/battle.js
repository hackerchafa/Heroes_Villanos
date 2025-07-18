const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, // autoincremental
  owner: { type: String, required: true }, // username del creador
  usuarios: [{ type: String, required: true }], // usernames autorizados
  equipos: {
    type: Map, // { username: [idPersonaje, ...] }
    of: [Number],
    default: {}
  },
  orden: {
    type: Object, // { username: [idPersonaje, ...] }
    default: {}
  },
  roles: {
    type: Object,
    default: {}
  },
  rounds: {
    type: Object,
    default: {}
  },
  resultados: {
    type: [
      new mongoose.Schema({
        round: Number,
        ganador: String,
        perdedor: String,
        vidaGanador: Number,
        golpesUtilizados: Number,
        estado: String
      }, { _id: false })
    ],
    default: []
  },
  currentRound: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

// Autoincrementar id
battleSchema.pre('save', async function(next) {
  if (this.isNew) {
    const last = await this.constructor.findOne({}, {}, { sort: { id: -1 } });
    this.id = last ? last.id + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Battle', battleSchema); 