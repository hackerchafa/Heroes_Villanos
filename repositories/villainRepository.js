const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'villains.json');

function loadVillains() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveVillains(villains) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(villains, null, 2));
}

module.exports = {
  getAll: () => loadVillains(),
  getById: (id) => loadVillains().find(v => Number(v.id) === Number(id)),
  add: (villain) => {
    const villains = loadVillains();
    villains.push(villain);
    saveVillains(villains);
    return villain;
  },
  // Puedes agregar más métodos según lo necesites
}; 