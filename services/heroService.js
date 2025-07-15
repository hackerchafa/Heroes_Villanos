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
    const hero = new Hero({
      ...data,
      poder,
      defensa: 200,
      experiencia: 0
    });
    return HeroRepository.add(hero);
  }

  update(id, data) {
    // Obtener el héroe actual
    const current = HeroRepository.getById(id);
    if (!current) throw new Error('Héroe no encontrado');
    // Ignorar cambios en defensa, poder y experiencia
    const { defensa, poder, experiencia, ...rest } = data;
    // Actualizar solo los campos permitidos
    return HeroRepository.update(id, rest);
  }

  delete(id) {
    return HeroRepository.delete(id);
  }
}

module.exports = new HeroService(); 