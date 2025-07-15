const BattleService = require('../services/battleService');
const HeroService = require('../services/heroService');
const VillainService = require('../services/villainService');

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

  // Preparar respuesta solo con ganador y ataques utilizados
  const response = {
    ganador: result.hero.vida > result.villain.vida ? result.hero.nombre : result.villain.nombre,
    vidaGanador: result.hero.vida > result.villain.vida ? result.hero.vida : result.villain.vida,
    ataquesHeroe: result.stats.hero,
    ataquesVillano: result.stats.villain
  };
  res.json(response);
};

// Nuevo endpoint para registrar equipos (battles/team)
const registerTeams = (req, res) => {
  const { heroe1, heroe2, heroe3, villano1, villano2, villano3 } = req.body;
  if (!heroe1 || !heroe2 || !heroe3 || !villano1 || !villano2 || !villano3) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios: heroe1, heroe2, heroe3, villano1, villano2, villano3.' });
  }
  const heroIds = [heroe1, heroe2, heroe3];
  const villainIds = [villano1, villano2, villano3];
  // Validar que no haya IDs repetidos en cada equipo
  const uniqueHeroIds = new Set(heroIds);
  const uniqueVillainIds = new Set(villainIds);
  if (uniqueHeroIds.size !== heroIds.length) {
    return res.status(400).json({ error: 'No se permiten héroes repetidos en el equipo.' });
  }
  if (uniqueVillainIds.size !== villainIds.length) {
    return res.status(400).json({ error: 'No se permiten villanos repetidos en el equipo.' });
  }
  for (let i = 0; i < heroIds.length; i++) {
    if (!heroIds[i] || isNaN(Number(heroIds[i])) || !Number.isInteger(Number(heroIds[i]))) {
      return res.status(400).json({ error: `El ID del héroe ${i + 1} debe ser un número entero.` });
    }
  }
  for (let i = 0; i < villainIds.length; i++) {
    if (!villainIds[i] || isNaN(Number(villainIds[i])) || !Number.isInteger(Number(villainIds[i]))) {
      return res.status(400).json({ error: `El ID del villano ${i + 1} debe ser un número entero.` });
    }
  }
  const result = BattleService.registerTeams(heroIds.map(Number), villainIds.map(Number));
  res.json(result);
};

// Nuevo endpoint para registrar orden (battles/orden)
const registerOrder = (req, res) => {
  const { heroes, villains, battleId } = req.body;
  if (!Array.isArray(heroes) || !Array.isArray(villains) || heroes.length === 0 || villains.length === 0) {
    return res.status(400).json({ error: 'Los campos de orden de héroes y villanos no pueden estar vacíos.' });
  }
  const result = BattleService.registerOrder(heroes, villains, battleId);
  if (result.error) return res.status(400).json(result);
  res.json(result);
};

// Almacenar movimientos de batalla en memoria
const battleMovements = {};

// Modificar addAttackCombination para enlazar con la lógica avanzada y el mensaje correcto
const addAttackCombination = createCombinationHandler(1);

// Nueva función para obtener combinaciones de golpes
const getAttackCombinations = (req, res) => {
  const combinations = BattleService.getAttackCombinations();
  res.json(combinations);
};

const getBattleMovements = (req, res) => {
  const { battleId } = req.params;
  if (!battleMovements[battleId]) {
    return res.status(404).json({ error: 'No hay movimientos registrados para esta batalla.' });
  }
  res.json({ movimientos: battleMovements[battleId] });
};

const getAvailableTeamBattles = (req, res) => {
  const equipos = BattleService.registeredTeams;
  const orden = BattleService.registeredOrder;
  const battleId = BattleService.battleId;
  if (!equipos) {
    return res.status(404).json({ error: 'No hay equipos registrados actualmente.' });
  }
  res.json({ equipos, orden, battleId });
};

function getRealHeroName(id) {
  const hero = HeroService.getById(id);
  return hero ? hero.nombre : `Héroe ${id}`;
}
function getRealVillainName(id) {
  const villain = VillainService.getById(id);
  return villain ? villain.nombre : `Villano ${id}`;
}

function createCombinationHandler(roundNumber) {
  return (req, res) => {
    const { battleId, CombinacionHero, CombinacionVillain } = req.body;
    if (!battleId || typeof CombinacionHero !== 'string' || typeof CombinacionVillain !== 'string') {
      return res.status(400).json({ error: 'battleId, CombinacionHero y CombinacionVillain son obligatorios.' });
    }
    if (battleId !== BattleService.battleId) {
      return res.status(400).json({ error: 'El ID de batalla no es válido o no corresponde a la batalla actual.' });
    }
    if (!/^[YXAB]{1,5}$/.test(CombinacionHero) || !/^[YXAB]{1,5}$/.test(CombinacionVillain)) {
      return res.status(400).json({ error: 'Las combinaciones solo pueden contener letras Y, X, A y B, de 1 a 5 caracteres.' });
    }
    // Obtener equipos y orden
    const order = BattleService.registeredOrder;
    if (!order) {
      return res.status(400).json({ error: 'Debes registrar equipos y orden antes de registrar movimientos.' });
    }
    // Control de vida por personaje (en memoria por batalla)
    if (!BattleService.roundState) BattleService.roundState = {};
    if (!BattleService.roundState[battleId]) {
      BattleService.roundState[battleId] = {
        heroes: order.heroes.map(id => ({ id, vida: 200 })),
        villains: order.villains.map(id => ({ id, vida: 200 })),
        currentRound: 1
      };
    }
    const state = BattleService.roundState[battleId];
    
    // Verificar que estamos en el round correcto
    if (roundNumber === 2 && state.currentRound < 2) {
      return res.status(400).json({ error: 'No puedes ejecutar el round 2 hasta que el round 1 haya terminado.' });
    }
    if (roundNumber === 3 && state.currentRound < 3) {
      return res.status(400).json({ error: 'No puedes ejecutar el round 3 hasta que el round 2 haya terminado.' });
    }
    
    // Determinar quiénes se enfrentan en este round
    let heroObj, villainObj;
    if (roundNumber === 1) {
      heroObj = state.heroes[0];
      villainObj = state.villains[0];
    } else if (roundNumber === 2) {
      // Sobreviviente del round 1 vs siguiente rival
      heroObj = state.survivorHero || state.heroes.find(h => h.vida > 0);
      villainObj = state.villains[1];
    } else if (roundNumber === 3) {
      heroObj = state.survivorHero || state.heroes.find(h => h.vida > 0);
      villainObj = state.villains[2];
    }
    // Si alguno ya está muerto, no permitir más movimientos
    if (!heroObj || heroObj.vida === 0 || !villainObj || villainObj.vida === 0) {
      return res.status(400).json({ error: 'La batalla ha terminado para este round. No se pueden registrar más movimientos.' });
    }
    // Calcular daño usando la nueva lógica avanzada
    // Determinar tipo de golpe y daño base según la combinación
    const getTipoYBase = (comb) => {
      if (comb.length === 1) return { tipo: 'basico', base: 5 };
      if (comb.length === 2 || comb.length === 3) return { tipo: 'especial', base: 15 };
      if (comb.length >= 4) return { tipo: 'critico', base: 25 };
      return { tipo: 'basico', base: 5 };
    };
    const heroTipo = getTipoYBase(CombinacionHero);
    const villainTipo = getTipoYBase(CombinacionVillain);

    // Inicializar defensa, poder, nivel, experiencia si no existen
    if (heroObj.defensa === undefined) heroObj.defensa = 200;
    if (heroObj.poder === undefined) heroObj.poder = 0;
    if (heroObj.nivel === undefined) heroObj.nivel = 1;
    if (heroObj.experiencia === undefined) heroObj.experiencia = 0;
    if (villainObj.defensa === undefined) villainObj.defensa = 200;
    if (villainObj.poder === undefined) villainObj.poder = 0;
    if (villainObj.nivel === undefined) villainObj.nivel = 1;
    if (villainObj.experiencia === undefined) villainObj.experiencia = 0;

    // Hero ataca a Villain
    const resultadoHero = BattleService.applyAttack(heroObj, villainObj, heroTipo.tipo, heroTipo.base);
    // Villain ataca a Hero
    const resultadoVillain = BattleService.applyAttack(villainObj, heroObj, villainTipo.tipo, villainTipo.base);

    // Nombres reales
    const heroName = getRealHeroName(heroObj.id);
    const villainName = getRealVillainName(villainObj.id);
    // Mensajes (formato solicitado)
    const mensajeHero = `En el round ${roundNumber}, el héroe ${heroName} hizo la combinación ${CombinacionHero} quitándole daño a la defensa del villano, dejándolo en ${villainObj.defensa}, por lo tanto, su vida es ${villainObj.vida}.`;
    const mensajeVillain = `En el round ${roundNumber}, el villano ${villainName} hizo la combinación ${CombinacionVillain} quitándole daño a la defensa del héroe, dejándolo en ${heroObj.defensa}, por lo tanto, su vida es ${heroObj.vida}.`;

    // Guardar sobreviviente para el siguiente round
    if (roundNumber === 1) {
      state.survivorHero = heroObj.vida > 0 ? { ...heroObj } : null;
      state.survivorVillain = villainObj.vida > 0 ? { ...villainObj } : null;
      // Avanzar al siguiente round si uno de los dos murió
      if (heroObj.vida === 0 || villainObj.vida === 0) {
        state.currentRound = 2;
      }
    } else if (roundNumber === 2) {
      // Actualizar sobreviviente del round 2
      state.survivorHero = heroObj.vida > 0 ? { ...heroObj } : null;
      state.survivorVillain = villainObj.vida > 0 ? { ...villainObj } : null;
      // Avanzar al siguiente round si uno de los dos murió
      if (heroObj.vida === 0 || villainObj.vida === 0) {
        state.currentRound = 3;
      }
    }

    // Determinar si alguno sobrevive para el siguiente round
    const resultado = {
      hero: { id: heroObj.id, nombre: heroName, vida: heroObj.vida, defensa: heroObj.defensa, poder: heroObj.poder, nivel: heroObj.nivel, experiencia: heroObj.experiencia },
      villain: { id: villainObj.id, nombre: villainName, vida: villainObj.vida, defensa: villainObj.defensa, poder: villainObj.poder, nivel: villainObj.nivel, experiencia: villainObj.experiencia },
      mensajeHero,
      mensajeVillain,
      round: roundNumber,
      siguienteRound: (heroObj.vida > 0 && villainObj.vida === 0) || (villainObj.vida > 0 && heroObj.vida === 0)
    };
    res.json({ message: 'Movimientos registrados correctamente', resultado });
  };
}

const addCombination2 = createCombinationHandler(2);
const addCombination3 = createCombinationHandler(3);

const getWins = (req, res) => {
  const { battleId } = req.params;
  
  if (!battleId) {
    return res.status(400).json({ error: 'battleId es obligatorio.' });
  }
  
  if (battleId !== BattleService.battleId) {
    return res.status(400).json({ error: 'El ID de batalla no es válido o no corresponde a la batalla actual.' });
  }
  
  const state = BattleService.roundState[battleId];
  if (!state) {
    return res.status(404).json({ error: 'No hay datos de batalla para este battleId.' });
  }
  
  // Verificar que las 3 rondas hayan terminado
  if (state.currentRound < 3) {
    return res.status(400).json({ 
      error: 'Aún no se han terminado los combates. Se necesitan acabar las 3 rondas para ver el resultado final.',
      currentRound: state.currentRound,
      message: 'Debes completar todas las rondas antes de poder ver los resultados finales.'
    });
  }
  
  // Verificar que el round 3 haya terminado completamente
  const hero3 = state.survivorHero || state.heroes.find(h => h.vida > 0);
  const villain3 = state.villains[2];
  
  if (hero3 && villain3 && hero3.vida > 0 && villain3.vida > 0) {
    return res.status(400).json({ 
      error: 'Aún no se han terminado los combates. Se necesitan acabar las 3 rondas para ver el resultado final.',
      currentRound: state.currentRound,
      message: 'El round 3 aún está en progreso. Debes terminar la batalla antes de ver los resultados.'
    });
  }
  
  const resultados = [];
  
  // Resultado del Round 1
  if (state.heroes[0] && state.villains[0]) {
    const hero1 = state.heroes[0];
    const villain1 = state.villains[0];
    const heroName1 = getRealHeroName(hero1.id);
    const villainName1 = getRealVillainName(villain1.id);
    
    let ganadorRound1, perdedorRound1, vidaGanador, golpesUtilizados;
    
    if (hero1.vida > 0 && villain1.vida === 0) {
      ganadorRound1 = heroName1;
      perdedorRound1 = villainName1;
      vidaGanador = hero1.vida;
      golpesUtilizados = Math.ceil((200 - villain1.vida) / 10); // Calcular golpes basado en daño total
    } else if (villain1.vida > 0 && hero1.vida === 0) {
      ganadorRound1 = villainName1;
      perdedorRound1 = heroName1;
      vidaGanador = villain1.vida;
      golpesUtilizados = Math.ceil((200 - hero1.vida) / 10);
    } else {
      // Si ambos siguen vivos, determinar ganador por vida restante
      if (hero1.vida > villain1.vida) {
        ganadorRound1 = heroName1;
        perdedorRound1 = villainName1;
        vidaGanador = hero1.vida;
        golpesUtilizados = Math.ceil((200 - villain1.vida) / 10);
      } else {
        ganadorRound1 = villainName1;
        perdedorRound1 = heroName1;
        vidaGanador = villain1.vida;
        golpesUtilizados = Math.ceil((200 - hero1.vida) / 10);
      }
    }
    
    resultados.push({
      round: 1,
      ganador: ganadorRound1,
      perdedor: perdedorRound1,
      vidaGanador: vidaGanador,
      golpesUtilizados: golpesUtilizados,
      estado: 'Terminado'
    });
  }
  
  // Resultado del Round 2
  if (state.heroes[1] && state.villains[1]) {
    const hero2 = state.survivorHero || state.heroes.find(h => h.vida > 0);
    const villain2 = state.villains[1];
    
    if (hero2 && villain2) {
      const heroName2 = getRealHeroName(hero2.id);
      const villainName2 = getRealVillainName(villain2.id);
      
      let ganadorRound2, perdedorRound2, vidaGanador2, golpesUtilizados2;
      
      if (hero2.vida > 0 && villain2.vida === 0) {
        ganadorRound2 = heroName2;
        perdedorRound2 = villainName2;
        vidaGanador2 = hero2.vida;
        golpesUtilizados2 = Math.ceil((200 - villain2.vida) / 10);
      } else if (villain2.vida > 0 && hero2.vida === 0) {
        ganadorRound2 = villainName2;
        perdedorRound2 = heroName2;
        vidaGanador2 = villain2.vida;
        golpesUtilizados2 = Math.ceil((200 - hero2.vida) / 10);
      } else {
        if (hero2.vida > villain2.vida) {
          ganadorRound2 = heroName2;
          perdedorRound2 = villainName2;
          vidaGanador2 = hero2.vida;
          golpesUtilizados2 = Math.ceil((200 - villain2.vida) / 10);
        } else {
          ganadorRound2 = villainName2;
          perdedorRound2 = heroName2;
          vidaGanador2 = villain2.vida;
          golpesUtilizados2 = Math.ceil((200 - hero2.vida) / 10);
        }
      }
      
      resultados.push({
        round: 2,
        ganador: ganadorRound2,
        perdedor: perdedorRound2,
        vidaGanador: vidaGanador2,
        golpesUtilizados: golpesUtilizados2,
        estado: 'Terminado'
      });
    }
  }
  
  // Resultado del Round 3
  if (state.heroes[2] && state.villains[2]) {
    const hero3 = state.survivorHero || state.heroes.find(h => h.vida > 0);
    const villain3 = state.villains[2];
    
    if (hero3 && villain3) {
      const heroName3 = getRealHeroName(hero3.id);
      const villainName3 = getRealVillainName(villain3.id);
      
      let ganadorRound3, perdedorRound3, vidaGanador3, golpesUtilizados3;
      
      if (hero3.vida > 0 && villain3.vida === 0) {
        ganadorRound3 = heroName3;
        perdedorRound3 = villainName3;
        vidaGanador3 = hero3.vida;
        golpesUtilizados3 = Math.ceil((200 - villain3.vida) / 10);
      } else if (villain3.vida > 0 && hero3.vida === 0) {
        ganadorRound3 = villainName3;
        perdedorRound3 = heroName3;
        vidaGanador3 = villain3.vida;
        golpesUtilizados3 = Math.ceil((200 - hero3.vida) / 10);
      } else {
        if (hero3.vida > villain3.vida) {
          ganadorRound3 = heroName3;
          perdedorRound3 = villainName3;
          vidaGanador3 = hero3.vida;
          golpesUtilizados3 = Math.ceil((200 - villain3.vida) / 10);
        } else {
          ganadorRound3 = villainName3;
          perdedorRound3 = heroName3;
          vidaGanador3 = villain3.vida;
          golpesUtilizados3 = Math.ceil((200 - hero3.vida) / 10);
        }
      }
      
      resultados.push({
        round: 3,
        ganador: ganadorRound3,
        perdedor: perdedorRound3,
        vidaGanador: vidaGanador3,
        golpesUtilizados: golpesUtilizados3,
        estado: 'Terminado'
      });
    }
  }
  
  res.json({
    battleId: battleId,
    message: 'Resultados finales de la batalla completada',
    resultados: resultados
  });
};

module.exports = { 
  battle, 
  teamBattle: registerTeams, 
  addAttackCombination, 
  getAttackCombinations, 
  getBattleMovements,
  getAvailableTeamBattles,
  addCombination2,
  addCombination3,
  registerOrder,
  getWins
}; 