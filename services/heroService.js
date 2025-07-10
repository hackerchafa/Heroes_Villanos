const HeroRepository = require('../repositories/heroRepository');
const Hero = require('../models/hero');

class HeroService {
  getAll() {
    return HeroRepository.getAll();
  }

  getById(id) {
    return HeroRepository.getById(id);
  }

  getByPage(page = 1, pageSize = 10) {
    page = Number(page) || 1;
    pageSize = Number(pageSize) || 10;
    const all = HeroRepository.getAll();
    const start = (page - 1) * pageSize;
    return all.slice(start, start + pageSize);
  }

  create(data) {
    // Validaciones
    if (!data.id || isNaN(Number(data.id))) {
      throw new Error('El ID debe ser un número.');
    }
    const all = HeroRepository.getAll();
    if (all.find(h => Number(h.id) === Number(data.id))) {
      throw new Error('Ya existe un héroe con ese ID.');
    }
    if (all.find(h => h.nombre === data.nombre)) {
      throw new Error('Ya existe un héroe con ese nombre.');
    }
    if (all.find(h => h.alias === data.alias)) {
      throw new Error('Ya existe un héroe con ese alias.');
    }
    const hero = new Hero(data);
    return HeroRepository.add(hero);
  }

  update(id, data) {
    return HeroRepository.update(id, data);
  }

  delete(id) {
    return HeroRepository.delete(id);
  }
}

module.exports = new HeroService(); 