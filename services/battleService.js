const HeroService = require('./heroService');
const VillainService = require('./villainService');

class BattleService {
  battle(heroId, villainId) {
    const hero = HeroService.getById(heroId);
    const villain = VillainService.getById(villainId);
    if (!hero || !villain) {
      return { error: 'Hero or Villain not found' };
    }
    if (hero.nivel > villain.nivel) {
      return { winner: 'hero', hero, villain };
    } else if (villain.nivel > hero.nivel) {
      return { winner: 'villain', hero, villain };
    } else {
      return { winner: 'draw', hero, villain };
    }
  }
}

module.exports = new BattleService(); 