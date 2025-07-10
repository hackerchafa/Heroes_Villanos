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
    const villain = new Villain(data);
    return VillainRepository.add(villain);
  }

  update(id, data) {
    return VillainRepository.update(id, data);
  }

  delete(id) {
    return VillainRepository.delete(id);
  }
}

module.exports = new VillainService(); 