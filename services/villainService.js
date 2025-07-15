const VillainRepository = require('../repositories/villainRepository');
const Villain = require('../models/villain');

class VillainService {
  getAll() {
    return VillainRepository.getAll();
  }

  getById(id) {
    return VillainRepository.getById(id);
  }

  getByPage(page = 1, pageSize = 10) {
    page = Number(page) || 1;
    pageSize = Number(pageSize) || 10;
    const all = VillainRepository.getAll();
    const start = (page - 1) * pageSize;
    return all.slice(start, start + pageSize);
  }

  create(data) {
    // Validaciones
    if (!data.id || isNaN(Number(data.id))) {
      throw new Error('El ID debe ser un número.');
    }
    const all = VillainRepository.getAll();
    if (all.find(v => Number(v.id) === Number(data.id))) {
      throw new Error('Ya existe un villano con ese ID.');
    }
    if (all.find(v => v.nombre === data.nombre)) {
      throw new Error('Ya existe un villano con ese nombre.');
    }
    if (all.find(v => v.alias === data.alias)) {
      throw new Error('Ya existe un villano con ese alias.');
    }
    // Validar que vida, golpes sean números positivos
    if (data.vida && (isNaN(Number(data.vida)) || Number(data.vida) <= 0)) {
      throw new Error('La vida debe ser un número positivo.');
    }
    if (data.golpeEspecial && (isNaN(Number(data.golpeEspecial)) || Number(data.golpeEspecial) <= 0)) {
      throw new Error('El golpe especial debe ser un número positivo.');
    }
    if (data.golpeCritico && (isNaN(Number(data.golpeCritico)) || Number(data.golpeCritico) <= 0)) {
      throw new Error('El golpe crítico debe ser un número positivo.');
    }
    if (data.golpeBasico && (isNaN(Number(data.golpeBasico)) || Number(data.golpeBasico) <= 0)) {
      throw new Error('El golpe básico debe ser un número positivo.');
    }
    // Limitar poder inicial
    let poder = 1;
    if (data.poder !== undefined) {
      poder = Math.max(1, Math.min(100, Number(data.poder)));
    }
    const villain = new Villain({
      ...data,
      poder,
      defensa: 200,
      experiencia: 0
    });
    return VillainRepository.add(villain);
  }

  update(id, data) {
    // Obtener el villano actual
    const current = VillainRepository.getById(id);
    if (!current) throw new Error('Villano no encontrado');
    // Ignorar cambios en defensa, poder y experiencia
    const { defensa, poder, experiencia, ...rest } = data;
    // Actualizar solo los campos permitidos
    return VillainRepository.update(id, rest);
  }

  delete(id) {
    return VillainRepository.delete(id);
  }
}

module.exports = new VillainService(); 