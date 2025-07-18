const Personaje = require('../models/personaje');

class BattleService {
  constructor() {
    this.kofBattles = new Map(); // Almacenar batallas KoF
    this.registeredTeams = null; // Guardar el último equipo registrado
    this.registeredOrder = null; // Guardar el último orden registrado
    this.battleId = null; // ID de la batalla actual
  }

  // Función para generar un número aleatorio entre min y max
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Función para elegir un tipo de golpe aleatorio con nuevos porcentajes
  chooseAttackType() {
    const rand = this.random(1, 100);
    if (rand <= 10) return 'critico';      // 10% probabilidad
    if (rand <= 35) return 'especial';     // 25% probabilidad  
    return 'basico';                        // 65% probabilidad
  }

  // Función para calcular el daño según el tipo de golpe
  calculateDamage(character, attackType) {
    switch(attackType) {
      case 'critico': return character.golpeCritico;
      case 'especial': return character.golpeEspecial;
      default: return character.golpeBasico;
    }
  }

  // Eliminar addAttackCombination y getAttackCombinations

  // Obtener estadísticas de golpes de una batalla KoF
  getKofBattleStats(battleId) {
    const battle = this.kofBattles.get(battleId);
    if (!battle) {
      return { error: 'Batalla no encontrada' };
    }

    const stats = {
      battleId,
      totalRounds: battle.rounds.length,
      rounds: battle.rounds.map(round => ({
        roundNumber: round.roundNumber,
        heroStats: round.heroStats,
        villainStats: round.villainStats
      }))
    };

    return stats;
  }

  // Obtener salud de personajes en batalla KoF
  getKofBattleHealth(battleId) {
    const battle = this.kofBattles.get(battleId);
    if (!battle) {
      return { error: 'Batalla no encontrada' };
    }

    return {
      battleId,
      totalRounds: battle.rounds.length,
      rounds: battle.rounds.map(round => ({
        roundNumber: round.roundNumber,
        hero: {
          nombre: round.hero.nombre,
          vida: Math.max(0, round.hero.vida),
          vidaInicial: round.hero.vidaInicial
        },
        villain: {
          nombre: round.villain.nombre,
          vida: Math.max(0, round.villain.vida),
          vidaInicial: round.villain.vidaInicial
        },
        winner: round.winner
      }))
    };
  }

  // Simular batalla KoF 1vs1 con recuperación de salud
  async simulateKofBattle(heroId, villainId) {
    const hero = await Personaje.findOne({ id: heroId });
    const villain = await Personaje.findOne({ id: villainId });
    
    if (!hero || !villain) {
      return { error: 'Héroe o Villano no encontrado' };
    }

    const battleId = Date.now().toString();
    const rounds = [];
    let currentHero = { ...hero, vida: 200, vidaInicial: 200 };
    let currentVillain = { ...villain, vida: 200, vidaInicial: 200 };
    let roundNumber = 1;

    // Simular hasta 5 rondas o hasta que uno muera
    while (roundNumber <= 5 && currentHero.vida > 0 && currentVillain.vida > 0) {
      const roundResult = await this.simulateKofRound(currentHero, currentVillain, roundNumber);
      rounds.push(roundResult);

      // Si ambos sobreviven, recuperan 40% de salud
      if (currentHero.vida > 0 && currentVillain.vida > 0) {
        currentHero.vida = Math.min(200, currentHero.vida + Math.floor(200 * 0.4));
        currentVillain.vida = Math.min(200, currentVillain.vida + Math.floor(200 * 0.4));
      }

      roundNumber++;
    }

    const battle = {
      id: battleId,
      hero: hero,
      villain: villain,
      rounds: rounds,
      winner: currentHero.vida > 0 ? 'hero' : 'villain',
      totalRounds: rounds.length
    };

    this.kofBattles.set(battleId, battle);
    return battle;
  }

  // Simular una ronda KoF
  async simulateKofRound(hero, villain, roundNumber) {
    const heroClone = { ...hero };
    const villainClone = { ...villain };
    const heroStats = { basico: 0, especial: 0, critico: 0 };
    const villainStats = { basico: 0, especial: 0, critico: 0 };
    const battleLog = [];

    while (heroClone.vida > 0 && villainClone.vida > 0) {
      // Héroe ataca
      const heroAttackType = this.chooseAttackType();
      const heroDamage = this.calculateDamage(heroClone, heroAttackType);
      villainClone.vida = Math.max(0, villainClone.vida - heroDamage);
      heroStats[heroAttackType]++;
      
      battleLog.push({
        atacante: heroClone.nombre,
        defensor: villainClone.nombre,
        tipoGolpe: heroAttackType,
        dano: heroDamage,
        vidaDefensor: villainClone.vida
      });

      if (villainClone.vida <= 0) break;

      // Villano ataca
      const villainAttackType = this.chooseAttackType();
      const villainDamage = this.calculateDamage(villainClone, villainAttackType);
      heroClone.vida = Math.max(0, heroClone.vida - villainDamage);
      villainStats[villainAttackType]++;
      
      battleLog.push({
        atacante: villainClone.nombre,
        defensor: heroClone.nombre,
        tipoGolpe: villainAttackType,
        dano: villainDamage,
        vidaDefensor: heroClone.vida
      });
    }

    return {
      roundNumber,
      hero: { ...heroClone },
      villain: { ...villainClone },
      heroStats,
      villainStats,
      winner: heroClone.vida > 0 ? 'hero' : 'villain',
      battleLog
    };
  }

  // Simula un duelo 1vs1 y retorna estadísticas detalladas
  async simulateDuel(hero, villain) {
    // Clonar stats iniciales
    const heroClone = { id: hero.id, nombre: hero.nombre, alias: hero.alias, vida: 200, defensa: 200, poder: hero.poder, experiencia: hero.experiencia, golpeEspecial: hero.golpeEspecial, golpeCritico: hero.golpeCritico, golpeBasico: hero.golpeBasico };
    const villainClone = { id: villain.id, nombre: villain.nombre, alias: villain.alias, vida: 200, defensa: 200, poder: villain.poder, experiencia: villain.experiencia, golpeEspecial: villain.golpeEspecial, golpeCritico: villain.golpeCritico, golpeBasico: villain.golpeBasico };
    const battleLog = [];
    let heroStats = { basico: 0, especial: 0, critico: 0 };
    let villainStats = { basico: 0, especial: 0, critico: 0 };
    let movimientos = 0;
    let totalDamage = 0;
    
    while (heroClone.vida > 0 && villainClone.vida > 0) {
      // Héroe ataca
      const heroAttackType = this.chooseAttackType();
      let baseHeroDamage = this.calculateDamage(heroClone, heroAttackType);
      const heroAttackResult = await this.applyAttack(heroClone, villainClone, heroAttackType, baseHeroDamage, false);
      heroStats[heroAttackType]++;
      totalDamage += heroAttackResult.dañoReal;
      movimientos++;
      battleLog.push({
        atacante: heroClone.nombre,
        defensor: villainClone.nombre,
        tipoGolpe: heroAttackType,
        dano: heroAttackResult.dañoReal,
        defensaRestante: villainClone.defensa,
        vidaRestante: villainClone.vida
      });
      if (villainClone.vida <= 0) break;
      // Villano ataca
      const villainAttackType = this.chooseAttackType();
      let baseVillainDamage = this.calculateDamage(villainClone, villainAttackType);
      const villainAttackResult = await this.applyAttack(villainClone, heroClone, villainAttackType, baseVillainDamage, false);
      villainStats[villainAttackType]++;
      totalDamage += villainAttackResult.dañoReal;
      movimientos++;
      battleLog.push({
        atacante: villainClone.nombre,
        defensor: heroClone.nombre,
        tipoGolpe: villainAttackType,
        dano: villainAttackResult.dañoReal,
        defensaRestante: heroClone.defensa,
        vidaRestante: heroClone.vida
      });
    }
    // Determinar ganador
    let winner = heroClone.vida > 0 ? 'hero' : 'villain';
    return {
      winner,
      hero: { id: heroClone.id, nombre: heroClone.nombre, alias: heroClone.alias, vida: heroClone.vida },
      villain: { id: villainClone.id, nombre: villainClone.nombre, alias: villainClone.alias, vida: villainClone.vida },
      battleLog,
      stats: {
        hero: heroStats,
        villain: villainStats,
        totalDamage,
        movimientos
      },
      resultado: heroClone.vida > 0 ? `Ganador: ${heroClone.nombre}` : `Ganador: ${villainClone.nombre}`
    };
  }

  // Simula una ronda del torneo y retorna estadísticas agregadas
  async simulateRound(heroes, villains) {
    const roundResults = [];
    const survivors = { heroes: [], villains: [] };
    let roundStats = { basico: 0, especial: 0, critico: 0, totalDamage: 0, movimientos: 0 };

    for (let i = 0; i < Math.min(heroes.length, villains.length); i++) {
      const hero = heroes[i];
      const villain = villains[i];
      const duelResult = await this.simulateDuel(hero, villain);
      roundResults.push(duelResult);
      // Sumar estadísticas de la ronda
      roundStats.basico += duelResult.stats.hero.basico + duelResult.stats.villain.basico;
      roundStats.especial += duelResult.stats.hero.especial + duelResult.stats.villain.especial;
      roundStats.critico += duelResult.stats.hero.critico + duelResult.stats.villain.critico;
      roundStats.totalDamage += duelResult.stats.totalDamage;
      roundStats.movimientos += duelResult.stats.movimientos;
      // Agregar sobrevivientes con 50% de vida
      if (duelResult.winner === 'hero') {
        const survivor = { ...duelResult.hero };
        survivor.vida = Math.floor(survivor.vida * 0.5);
        survivors.heroes.push(survivor);
      } else {
        const survivor = { ...duelResult.villain };
        survivor.vida = Math.floor(survivor.vida * 0.5);
        survivors.villains.push(survivor);
      }
    }
    return {
      roundResults,
      survivors,
      heroWins: survivors.heroes.length,
      villainWins: survivors.villains.length,
      roundStats
    };
  }

  // Función principal para batalla por equipos tipo torneo
  async teamBattle(heroIds, villainIds) {
    // Validar que se proporcionen exactamente 3 héroes y 3 villanos
    if (!heroIds || !villainIds || heroIds.length !== 3 || villainIds.length !== 3) {
      return { error: 'Se requieren exactamente 3 héroes y 3 villanos para la batalla por equipos.' };
    }

    // Validar que no haya héroes repetidos
    const heroIdsSet = new Set(heroIds);
    if (heroIdsSet.size !== 3) {
      return { error: 'No se permiten héroes repetidos en la misma batalla.' };
    }

    // Validar que no haya villanos repetidos
    const villainIdsSet = new Set(villainIds);
    if (villainIdsSet.size !== 3) {
      return { error: 'No se permiten villanos repetidos en la misma batalla.' };
    }

    // Obtener los héroes y villanos
    const heroes = await Promise.all(heroIds.map(id => Personaje.findOne({ id: id })));
    const villains = await Promise.all(villainIds.map(id => Personaje.findOne({ id: id })));

    // Validar que todos existan
    if (heroes.length !== 3 || villains.length !== 3) {
      return { error: 'Uno o más héroes/villanos no encontrados.' };
    }

    let heroTeamWins = 0;
    let villainTeamWins = 0;
    const battleHistory = [];
    let currentHeroes = [...heroes];
    let currentVillains = [...villains];

    // Simular hasta 7 rondas o hasta que un equipo gane 3
    for (let round = 1; round <= 7; round++) {
      // Si no hay suficientes personajes para combatir, terminar
      if (currentHeroes.length === 0 || currentVillains.length === 0) {
        break;
      }

      const roundResult = await this.simulateRound(currentHeroes, currentVillains);
      
      battleHistory.push({
        round,
        heroWins: roundResult.heroWins,
        villainWins: roundResult.villainWins,
        survivors: {
          heroes: roundResult.survivors.heroes.map(h => ({ id: h.id, nombre: h.nombre, alias: h.alias, vida: h.vida })),
          villains: roundResult.survivors.villains.map(v => ({ id: v.id, nombre: v.nombre, alias: v.alias, vida: v.vida }))
        },
        roundStats: roundResult.roundStats,
        details: roundResult.roundResults.map(duel => ({
          winner: duel.winner,
          hero: duel.hero,
          villain: duel.villain,
          movimientos: duel.stats.movimientos,
          battleLog: duel.battleLog
        }))
      });

      // Contar victorias de equipo
      if (roundResult.heroWins > roundResult.villainWins) {
        heroTeamWins++;
      } else if (roundResult.villainWins > roundResult.heroWins) {
        villainTeamWins++;
      }

      // Actualizar personajes para la siguiente ronda
      currentHeroes = roundResult.survivors.heroes;
      currentVillains = roundResult.survivors.villains;

      // Verificar si un equipo ya ganó 3 rondas
      if (heroTeamWins >= 3 || villainTeamWins >= 3) {
        break;
      }
    }

    return {
      winner: heroTeamWins >= 3 ? 'heroes' : 'villains',
      finalScore: {
        heroes: heroTeamWins,
        villains: villainTeamWins
      },
      totalRounds: battleHistory.length,
      battleHistory,
      finalSurvivors: {
        heroes: currentHeroes.map(h => ({ id: h.id, nombre: h.nombre, alias: h.alias, vida: h.vida })),
        villains: currentVillains.map(v => ({ id: v.id, nombre: v.nombre, alias: v.alias, vida: v.vida }))
      }
    };
  }

  // Registrar equipos
  registerTeams(heroes, villains) {
    this.registeredTeams = {
      heroes: [...heroes],
      villains: [...villains]
    };
    this.registeredOrder = null; // Limpiar orden anterior si se registra un nuevo equipo
    this.battleId = null; // Limpiar battleId anterior
    return { message: 'Equipos registrados correctamente', equipos: this.registeredTeams };
  }

  // Validar y registrar orden
  registerOrder(heroesOrder, villainsOrder, battleId) {
    if (!this.registeredTeams) {
      return { error: 'Primero debes registrar los equipos antes de asignar un orden.' };
    }
    if (!Array.isArray(heroesOrder) || !Array.isArray(villainsOrder) || heroesOrder.length === 0 || villainsOrder.length === 0) {
      return { error: 'Los campos de orden de héroes y villanos no pueden estar vacíos.' };
    }
    // Validar que los IDs coincidan exactamente con los equipos registrados
    const eqArr = (a, b) => a.length === b.length && a.every(id => b.includes(id));
    if (!eqArr(heroesOrder, this.registeredTeams.heroes) || !eqArr(villainsOrder, this.registeredTeams.villains)) {
      return { error: 'Los IDs del orden no coinciden con los equipos registrados.' };
    }
    if (!battleId || typeof battleId !== 'string' || battleId.trim() === '') {
      return { error: 'Debes enviar un battleId válido al registrar el orden.' };
    }
    this.registeredOrder = {
      heroes: [...heroesOrder],
      villains: [...villainsOrder]
    };
    this.battleId = battleId;
    return { message: 'Orden registrado correctamente', orden: this.registeredOrder, battleId: this.battleId };
  }

  // Nuevo método para registrar un round
  registerRound(roundNumber, Heroe, Villano) {
    // Tipos válidos
    const tiposValidos = ['basico', 'especial', 'critico'];
    if (!this.battleId || !this.registeredOrder) {
      return { error: 'Debes registrar equipos y orden antes de iniciar los rounds.' };
    }
    if (!this.roundState) this.roundState = {};
    if (!this.roundState[this.battleId]) {
      this.roundState[this.battleId] = {
        heroes: this.registeredOrder.heroes.map(id => ({ id, defensa: 200, vida: 200 })),
        villains: this.registeredOrder.villains.map(id => ({ id, defensa: 200, vida: 200 })),
        currentRound: 1
      };
    }
    const state = this.roundState[this.battleId];
    if (roundNumber !== state.currentRound) {
      return { error: `Debes registrar el round ${state.currentRound} antes de continuar.` };
    }
    const heroObj = state.heroes[roundNumber - 1];
    const villainObj = state.villains[roundNumber - 1];
    if (!heroObj || !villainObj) {
      return { error: 'No hay personajes disponibles para este round.' };
    }
    // Buscar nombres reales
    const heroName = this._getPersonajeNombre(heroObj.id, 'heroe');
    const villainName = this._getPersonajeNombre(villainObj.id, 'villano');
    // --- HEROE ATACA AL VILLANO ---
    let mensajeHero = '';
    let heroDamage = 0;
    let tipoHero = Heroe;
    let heroPoder = 1;
    // Buscar personaje real por nombre
    let heroDoc = null;
    if (typeof heroName === 'string') {
      heroDoc = require('../models/personaje');
    }
    if (!tiposValidos.includes(Heroe)) {
      mensajeHero = `El Héroe *${heroName}* no realizó ningún golpe, por lo tanto, su daño es de 0`;
      heroDamage = 0;
    } else {
      heroDamage = Heroe === 'basico' ? 20 : Heroe === 'especial' ? 40 : 60;
      // Si existe el personaje, usar su poder
      if (heroDoc && heroDoc.poder !== undefined) {
        heroDamage = this._calcularDanioConPoder(heroDamage, heroDoc.poder);
        // Actualizar experiencia y poder
        this.aplicarExperiencia(heroDoc, 10);
        heroDoc.save();
      }
    }
    let dañoRestante = heroDamage;
    let escudoAntes = villainObj.defensa;
    if (heroDamage > 0) {
      if (villainObj.defensa > 0) {
        if (villainObj.defensa >= dañoRestante) {
          villainObj.defensa -= dañoRestante;
          dañoRestante = 0;
        } else {
          dañoRestante -= villainObj.defensa;
          villainObj.defensa = 0;
        }
      }
      if (dañoRestante > 0) {
        villainObj.vida = Math.max(0, villainObj.vida - dañoRestante);
      }
      if (escudoAntes > 0 && villainObj.defensa === 0) {
        mensajeHero = `En el round ${roundNumber}, el Héroe *${heroName}* golpeó con un golpe tipo *${Heroe}* al villano *${villainName}* pero el escudo fue destruido, por lo tanto, su vida baja a *${villainObj.vida}* puntos`;
      } else {
        mensajeHero = `En el round ${roundNumber}, el Héroe *${heroName}* golpeó con un golpe tipo *${Heroe}* al villano *${villainName}* y le hizo daño al escudo dejándolo con *${villainObj.defensa}*, por lo tanto, su vida sigue con ${villainObj.vida} puntos`;
      }
    }
    // --- VILLANO ATACA AL HEROE ---
    let mensajeVillain = '';
    let villainDamage = 0;
    let tipoVillain = Villano;
    let villainPoder = 1;
    let villainDoc = null;
    if (typeof villainName === 'string') {
      villainDoc = require('../models/personaje');
    }
    if (!tiposValidos.includes(Villano)) {
      mensajeVillain = `El Villano *${villainName}* no realizó ningún golpe, por lo tanto, su daño es de 0`;
      villainDamage = 0;
    } else {
      villainDamage = Villano === 'basico' ? 20 : Villano === 'especial' ? 40 : 60;
      if (villainDoc && villainDoc.poder !== undefined) {
        villainDamage = this._calcularDanioConPoder(villainDamage, villainDoc.poder);
        this.aplicarExperiencia(villainDoc, 10);
        villainDoc.save();
      }
    }
    dañoRestante = villainDamage;
    escudoAntes = heroObj.defensa;
    if (villainDamage > 0) {
      if (heroObj.defensa > 0) {
        if (heroObj.defensa >= dañoRestante) {
          heroObj.defensa -= dañoRestante;
          dañoRestante = 0;
        } else {
          dañoRestante -= heroObj.defensa;
          heroObj.defensa = 0;
        }
      }
      if (dañoRestante > 0) {
        heroObj.vida = Math.max(0, heroObj.vida - dañoRestante);
      }
      if (escudoAntes > 0 && heroObj.defensa === 0) {
        mensajeVillain = `En el round ${roundNumber}, el Villano *${villainName}* golpeó con un golpe tipo *${Villano}* al héroe *${heroName}* pero el escudo fue destruido, por lo tanto, su vida baja a *${heroObj.vida}* puntos`;
      } else {
        mensajeVillain = `En el round ${roundNumber}, el Villano *${villainName}* golpeó con un golpe tipo *${Villano}* al héroe *${heroName}* y le hizo daño al escudo dejándolo con *${heroObj.defensa}*, por lo tanto, su vida sigue con ${heroObj.vida} puntos`;
      }
    }
    // Avanzar round
    state.currentRound++;
    return {
      hero: { ...heroObj },
      villain: { ...villainObj },
      mensajeHero,
      mensajeVillain
    };
  }

  // Helper para obtener el nombre real del personaje
  _getPersonajeNombre(id, rol) {
    // Buscar en la base de datos de personajes
    const Personaje = require('./../models/personaje');
    const personaje = Personaje.collection && Personaje.collection.findOne ? undefined : undefined;
    // Si tienes acceso a la colección, puedes hacer una búsqueda real aquí
    // Pero como esto es síncrono, solo devolveremos el id como string
    // El controlador puede mejorarlo si tiene acceso a la colección y puede usar await
    return id;
  }

  // Mantener la función original para compatibilidad
  async battle(heroId, villainId) {
    const hero = await Personaje.findOne({ id: heroId });
    const villain = await Personaje.findOne({ id: villainId });
    if (!hero || !villain) {
      return { error: 'Héroe o Villano no encontrado' };
    }
    return this.simulateDuel(hero, villain);
  }

  /**
   * Aplica experiencia progresiva y sube el poder (nivel) del personaje si corresponde.
   * Si el personaje llega a poder 100, no gana más experiencia.
   * @param {Object} personaje - El personaje (debe tener poder y experiencia)
   * @param {number} expGanada - La experiencia a sumar
   */
  aplicarExperiencia(personaje, expGanada) {
    if (personaje.poder === undefined) personaje.poder = 1;
    if (personaje.experiencia === undefined) personaje.experiencia = 0;
    if (personaje.poder >= 100) {
      personaje.poder = 100;
      personaje.experiencia = 0;
      return;
    }
    personaje.experiencia += expGanada;
    while (personaje.poder < 100) {
      const expNecesaria = 100 * Math.pow(2, personaje.poder - 1);
      if (personaje.experiencia >= expNecesaria) {
        personaje.experiencia -= expNecesaria;
        personaje.poder += 1;
      } else {
        break;
      }
    }
    if (personaje.poder >= 100) {
      personaje.poder = 100;
      personaje.experiencia = 0;
    }
  }

  /**
   * Aplica un ataque de attacker a defender, usando el tipo de golpe y combinación.
   * - Aplica daño primero a defensa, luego a vida.
   * - El daño base se incrementa 1% por cada punto de poder del atacante (redondeado).
   * - Si la defensa llega a 0, el resto del daño va a la vida.
   * - Ambos ganan experiencia (20 ganador, 10 perdedor).
   * @param {Object} attacker - El personaje que ataca (debe tener poder, experiencia, defensa, vida)
   * @param {Object} defender - El personaje que recibe el ataque (debe tener defensa, vida)
   * @param {string} tipoGolpe - 'basico', 'especial', 'critico'
   * @param {number} baseDamage - Daño base del golpe
   * @param {boolean} esGanador - true si este personaje ganó el round
   * @returns {Object} - { dañoReal, defensaRestante, vidaRestante, expGanada }
   */
  async applyAttack(attacker, defender, tipoGolpe, baseDamage, esGanador = false) {
    // Calcular bono de poder como porcentaje (nivel de poder * 0.1)
    const bonoPoder = baseDamage * (attacker.poder * 0.1);
    let dañoReal = Math.round(baseDamage + bonoPoder);
    let defensaRestante = defender.defensa;
    let vidaRestante = defender.vida;
    let expGanada = 0;

    // Aplicar daño a defensa primero
    if (defender.defensa > 0) {
      if (defender.defensa >= dañoReal) {
        defender.defensa -= dañoReal;
        defensaRestante = defender.defensa;
        dañoReal = 0;
      } else {
        dañoReal -= defender.defensa;
        defender.defensa = 0;
        defensaRestante = 0;
      }
    }
    // Si queda daño, aplicarlo a la vida
    if (dañoReal > 0) {
      defender.vida = Math.max(0, defender.vida - dañoReal);
      vidaRestante = defender.vida;
    }

    // Experiencia: ambos ganan, pero el ganador gana más
    if (esGanador) {
      expGanada = 20;
    } else {
      expGanada = 10;
    }
    this.aplicarExperiencia(attacker, expGanada);

    return {
      dañoReal,
      defensaRestante,
      vidaRestante,
      expGanada
    };
  }

  // Nuevo método para calcular daño con nivel de poder
  _calcularDanioConPoder(tipoGolpe, poder) {
    const base = tipoGolpe;
    const porcentaje = poder / 100;
    const extra = base * porcentaje;
    const decimal = extra - Math.floor(extra);
    let extraFinal = Math.floor(extra);
    if (decimal >= 0.6) {
      extraFinal = Math.ceil(extra);
    }
    // Si decimal <= 0.5, se queda igual (ya es floor)
    return base + extraFinal;
  }
}

module.exports = new BattleService(); 