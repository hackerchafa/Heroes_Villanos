const VillainService = require('../services/villainService');

const getAll = (req, res) => {
  res.json(VillainService.getAll());
};

const getById = (req, res) => {
  const villain = VillainService.getById(req.params.id);
  if (!villain) return res.status(404).json({ error: 'Villano no encontrado' });
  res.json(villain);
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
  res.json(VillainService.getByPage(page, pageSize));
};

const create = (req, res) => {
  try {
    const villain = VillainService.create(req.body);
    res.status(201).json(villain);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update = (req, res) => {
  const villain = VillainService.update(req.params.id, req.body);
  if (!villain) return res.status(404).json({ error: 'Villano no encontrado' });
  res.json(villain);
};

const remove = (req, res) => {
  const deleted = VillainService.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Villano no encontrado' });
  res.json({ success: true });
};

module.exports = { getAll, getById, getByPage, create, update, remove }; 