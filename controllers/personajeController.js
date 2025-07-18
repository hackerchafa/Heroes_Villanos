const Personaje = require('../models/personaje');

function isValidString(str) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(str.trim());
}

exports.getAll = async (req, res) => {
  const personajes = await Personaje.find();
  res.json(personajes);
};

exports.getById = async (req, res) => {
  const personaje = await Personaje.findOne({ id: req.params.id });
  if (!personaje) return res.status(404).json({ error: 'Personaje no encontrado' });
  res.json(personaje);
};

exports.getByPage = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const personajes = await Personaje.find()
    .skip((page - 1) * pageSize)
    .limit(pageSize);
  res.json(personajes);
};

exports.getHeroes = async (req, res) => {
  const heroes = await Personaje.find({ rol: 'heroe' });
  res.json(heroes);
};

exports.getVillanos = async (req, res) => {
  const villanos = await Personaje.find({ rol: 'villano' });
  res.json(villanos);
};

exports.create = async (req, res) => {
  const { nombre, alias, ciudad, team, rol, defensa, poder, experiencia, golpeBasico, golpeEspecial, golpeCritico } = req.body;
  if (!nombre || !alias || !ciudad || !team || !rol)
    return res.status(400).json({ error: 'Todos los campos son obligatorios. Por favor, completa todos los datos requeridos para crear un personaje.' });
  if (!isValidString(nombre) || !isValidString(alias) || !isValidString(ciudad) || !isValidString(team))
    return res.status(400).json({ error: 'Nombre, alias, ciudad y team solo pueden contener letras y no pueden estar vacíos. Revisa que no hayas puesto números o símbolos.' });
  if (!['heroe', 'villano'].includes(rol))
    return res.status(400).json({ error: 'El rol debe ser "heroe" o "villano". Escribe uno de esos valores exactamente.' });
  if (await Personaje.findOne({ nombre }))
    return res.status(400).json({ error: 'Ya existe un personaje con ese nombre. Elige un nombre diferente.' });
  if (await Personaje.findOne({ alias }))
    return res.status(400).json({ error: 'Ya existe un personaje con ese alias. Elige un alias diferente.' });
  try {
    const personaje = new Personaje({ nombre, alias, ciudad, team, rol, defensa, poder, experiencia, golpeBasico, golpeEspecial, golpeCritico });
    await personaje.save();
    res.status(201).json(personaje);
  } catch (err) {
    res.status(400).json({ error: 'Ocurrió un error al crear el personaje. Intenta nuevamente o revisa los datos enviados.' });
  }
};

exports.update = async (req, res) => {
  const { nombre, alias, ciudad, team, rol, defensa, poder, experiencia, golpeBasico, golpeEspecial, golpeCritico } = req.body;
  const personaje = await Personaje.findOne({ id: req.params.id });
  if (!personaje) return res.status(404).json({ error: 'Personaje no encontrado. Verifica el ID proporcionado.' });
  if (!nombre || !alias || !ciudad || !team || !rol)
    return res.status(400).json({ error: 'Todos los campos son obligatorios. Por favor, completa todos los datos requeridos para actualizar el personaje.' });
  if (!isValidString(nombre) || !isValidString(alias) || !isValidString(ciudad) || !isValidString(team))
    return res.status(400).json({ error: 'Nombre, alias, ciudad y team solo pueden contener letras y no pueden estar vacíos. Revisa que no hayas puesto números o símbolos.' });
  if (!['heroe', 'villano'].includes(rol))
    return res.status(400).json({ error: 'El rol debe ser "heroe" o "villano". Escribe uno de esos valores exactamente.' });
  if (await Personaje.findOne({ nombre, _id: { $ne: personaje._id } }))
    return res.status(400).json({ error: 'Ya existe un personaje con ese nombre. Elige un nombre diferente.' });
  if (await Personaje.findOne({ alias, _id: { $ne: personaje._id } }))
    return res.status(400).json({ error: 'Ya existe un personaje con ese alias. Elige un alias diferente.' });
  try {
    personaje.nombre = nombre;
    personaje.alias = alias;
    personaje.ciudad = ciudad;
    personaje.team = team;
    personaje.rol = rol;
    personaje.defensa = defensa;
    personaje.poder = poder;
    personaje.experiencia = experiencia;
    personaje.golpeBasico = golpeBasico;
    personaje.golpeEspecial = golpeEspecial;
    personaje.golpeCritico = golpeCritico;
    await personaje.save();
    res.json(personaje);
  } catch (err) {
    res.status(400).json({ error: 'Ocurrió un error al actualizar el personaje. Intenta nuevamente o revisa los datos enviados.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const personaje = await Personaje.findOneAndDelete({ id: req.params.id });
    if (!personaje) return res.status(404).json({ error: 'Personaje no encontrado. Verifica el ID proporcionado.' });
    res.json({ message: 'Personaje eliminado correctamente.' });
  } catch (err) {
    res.status(400).json({ error: 'Ocurrió un error al eliminar el personaje. Intenta nuevamente.' });
  }
};

// Endpoint temporal para poblar la base de datos con 20 personajes
exports.seed = async (req, res) => {
  const personajes = [
    // 10 héroes
    { nombre: 'Clark', alias: 'Superman', ciudad: 'Metropolis', team: 'Justice', rol: 'heroe' },
    { nombre: 'Bruce', alias: 'Batman', ciudad: 'Gotham', team: 'Justice', rol: 'heroe' },
    { nombre: 'Diana', alias: 'Wonderwoman', ciudad: 'Themyscira', team: 'Justice', rol: 'heroe' },
    { nombre: 'Barry', alias: 'Flash', ciudad: 'Central', team: 'Justice', rol: 'heroe' },
    { nombre: 'Hal', alias: 'Lantern', ciudad: 'Coast', team: 'Justice', rol: 'heroe' },
    { nombre: 'Arthur', alias: 'Aquaman', ciudad: 'Atlantis', team: 'Justice', rol: 'heroe' },
    { nombre: 'Victor', alias: 'Cyborg', ciudad: 'Detroit', team: 'Justice', rol: 'heroe' },
    { nombre: 'Oliver', alias: 'Arrow', ciudad: 'Star', team: 'Justice', rol: 'heroe' },
    { nombre: 'Kara', alias: 'Supergirl', ciudad: 'National', team: 'Justice', rol: 'heroe' },
    { nombre: 'Billy', alias: 'Shazam', ciudad: 'Fawcett', team: 'Justice', rol: 'heroe' },
    // 10 villanos
    { nombre: 'Lex', alias: 'Luthor', ciudad: 'Metropolis', team: 'Injustice', rol: 'villano' },
    { nombre: 'Joker', alias: 'Joker', ciudad: 'Gotham', team: 'Injustice', rol: 'villano' },
    { nombre: 'Cheetah', alias: 'Cheetah', ciudad: 'Themyscira', team: 'Injustice', rol: 'villano' },
    { nombre: 'Reverse', alias: 'Zoom', ciudad: 'Central', team: 'Injustice', rol: 'villano' },
    { nombre: 'Sinestro', alias: 'Sinestro', ciudad: 'Korugar', team: 'Injustice', rol: 'villano' },
    { nombre: 'Black', alias: 'Manta', ciudad: 'Atlantis', team: 'Injustice', rol: 'villano' },
    { nombre: 'Deathstroke', alias: 'Slade', ciudad: 'Star', team: 'Injustice', rol: 'villano' },
    { nombre: 'Darkseid', alias: 'Darkseid', ciudad: 'Apokolips', team: 'Injustice', rol: 'villano' },
    { nombre: 'Harley', alias: 'Harley', ciudad: 'Gotham', team: 'Injustice', rol: 'villano' },
    { nombre: 'Black', alias: 'Adam', ciudad: 'Kahndaq', team: 'Injustice', rol: 'villano' }
  ];
  try {
    for (const p of personajes) {
      if (!(await Personaje.findOne({ nombre: p.nombre, alias: p.alias }))) {
        await new Personaje(p).save();
      }
    }
    res.json({ message: 'Base de datos poblada con 20 personajes.' });
  } catch (err) {
    res.status(400).json({ error: 'Ocurrió un error al poblar los personajes. Intenta nuevamente.' });
  }
}; 