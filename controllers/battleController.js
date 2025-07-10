const BattleService = require('../services/battleService');

const battle = (req, res) => {
  const { heroId, villainId } = req.body;
  if (!heroId || isNaN(Number(heroId)) || !Number.isInteger(Number(heroId))) {
    return res.status(400).json({ error: 'El ID del héroe debe ser un número entero.' });
  }
  if (!villainId || isNaN(Number(villainId)) || !Number.isInteger(Number(villainId))) {
    return res.status(400).json({ error: 'El ID del villano debe ser un número entero.' });
  }
  const result = BattleService.battle(Number(heroId), Number(villainId));
  if (result.error) return res.status(404).json(result);
  res.json(result);
};

module.exports = { battle }; 