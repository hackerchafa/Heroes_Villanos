// repositories/heroRepository.js
// Repositorio básico para héroes

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'heroes.json');

function loadHeroes() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveHeroes(heroes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(heroes, null, 2));
}

module.exports = {
  getAll: () => loadHeroes(),
  getById: (id) => loadHeroes().find(h => Number(h.id) === Number(id)),
  add: (hero) => {
    const heroes = loadHeroes();
    heroes.push(hero);
    saveHeroes(heroes);
    return hero;
  },
  delete: (id) => {
    const heroes = loadHeroes();
    const idx = heroes.findIndex(h => Number(h.id) === Number(id));
    if (idx === -1) return false;
    heroes.splice(idx, 1);
    saveHeroes(heroes);
    return true;
  },
  // Puedes agregar más métodos según lo necesites
}; 