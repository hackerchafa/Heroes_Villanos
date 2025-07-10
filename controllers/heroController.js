const HeroService = require('../services/heroService');

const getAll = (req, res) => {
  res.json(HeroService.getAll());
};

const getById = (req, res) => {
  const hero = HeroService.getById(req.params.id);
  if (!hero) return res.status(404).json({ error: 'Héroe no encontrado' });
  res.json(hero);
};

const getByPage = (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const pageSizeRaw = req.query.pageSize;
  if (pageSizeRaw === undefined || pageSizeRaw === "") {
    return res.status(400).json({ error: 'El parámetro pageSize es obligatorio y debe ser un número entero positivo.' });
  }
  const pageSize = parseInt(pageSizeRaw);
  if (isNaN(pageSize) || pageSize <= 0 || !Number.isInteger(pageSize)) {
    return res.status(400).json({ error: 'El parámetro pageSize debe ser un número entero positivo.' });
  }
  res.json(HeroService.getByPage(page, pageSize));
};

const create = (req, res) => {
  try {
    const hero = HeroService.create(req.body);
    res.status(201).json(hero);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update = (req, res) => {
  const hero = HeroService.update(req.params.id, req.body);
  if (!hero) return res.status(404).json({ error: 'Héroe no encontrado' });
  res.json(hero);
};

const remove = (req, res) => {
  const deleted = HeroService.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Héroe no encontrado' });
  res.json({ success: true });
};

module.exports = { getAll, getById, getByPage, create, update, remove }; 