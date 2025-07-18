const BattleService = require('../services/battleService');
const Personaje = require('../models/personaje');
const Battle = require('../models/battle');
const User = require('../models/user');

const battle = async (req, res) => {
  const { heroId, villainId, battleId } = req.body;
  if (!heroId || isNaN(Number(heroId)) || !Number.isInteger(Number(heroId))) {
    return res.status(400).json({ error: 'El ID del héroe debe ser un número entero. Por favor, revisa el valor ingresado.' });
  }
  if (!villainId || isNaN(Number(villainId)) || !Number.isInteger(Number(villainId))) {
    return res.status(400).json({ error: 'El ID del villano debe ser un número entero. Por favor, revisa el valor ingresado.' });
  }
  if (battleId) {
    const battle = await Battle.findOne({ battleId: String(battleId) });
    if (!battle) return res.status(404).json({ error: 'Partida no encontrada. Verifica el ID de la batalla.' });
    if (!battle.usuarios.includes(req.user.username)) {
      return res.status(403).json({ error: 'No tienes acceso a esta partida. Solo el dueño puede ver o modificar la batalla.' });
    }
  }
  const result = BattleService.battle(Number(heroId), Number(villainId));
  if (result.error) return res.status(404).json({ error: 'No se encontró el héroe o villano especificado. Verifica los IDs.' });

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
const registerTeams = async (req, res) => {
  // Validar que exista una partida activa
  const owner = req.user.username;
  const battle = await getActiveBattleForOwner(owner);
  if (!battle) {
    return res.status(400).json({ error: 'Primero debes crear una partida antes de registrar equipos.' });
  }
  // Validar que no se hayan registrado equipos antes
  if (battle.equipos && battle.equipos.size > 0) {
    return res.status(400).json({ error: 'Ya registraste equipos para esta partida. No puedes volver a registrar.' });
  }
  const { "personaje 1": p1, "personaje 2": p2, "personaje 3": p3, "personaje 4": p4, "personaje 5": p5, "personaje 6": p6 } = req.body;
  if ([p1, p2, p3, p4, p5, p6].some(id => id === undefined || id === null)) {
    return res.status(400).json({ error: 'Todos los campos de personajes son obligatorios. Completa los 6 personajes para registrar el equipo.' });
  }
  const ids = [p1, p2, p3, p4, p5, p6].map(Number);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    return res.status(400).json({ error: 'No se permiten personajes repetidos en el equipo. Elige 6 personajes diferentes.' });
  }
  const personajes = await Personaje.find({ id: { $in: ids } });
  if (personajes.length !== 6) {
    const encontrados = personajes.map(p => p.id);
    const noEncontrados = ids.filter(id => !encontrados.includes(id));
    return res.status(400).json({ error: `No se encontraron los siguientes IDs de personajes: ${noEncontrados.join(', ')}. Verifica que existan en la base de datos.` });
  }
  const heroes = personajes.filter(p => p.rol === 'heroe').map(p => p.id);
  const villanos = personajes.filter(p => p.rol === 'villano').map(p => p.id);
  if (heroes.length !== 3 || villanos.length !== 3) {
    return res.status(400).json({ error: 'Debes seleccionar exactamente 3 héroes y 3 villanos para el equipo.' });
  }
  // Guardar los equipos en la batalla
  battle.equipos = new Map([
    [battle.usuarios[0], heroes],
    [battle.usuarios[1], villanos]
  ]);
  await battle.save();
  res.json({ message: '¡Equipos registrados exitosamente! Ahora puedes ordenar los personajes para la batalla.', equipos: battle.equipos });
};

// Nuevo endpoint para obtener los IDs seleccionados en el último equipo registrado
const getSelectedIds = async (req, res) => {
  const { battleId } = req.query;
  if (battleId) {
    const battle = await Battle.findOne({ id: Number(battleId) });
    if (!battle) return res.status(404).json({ error: 'Partida no encontrada.' });
    if (battle.owner !== req.user.username) {
      return res.status(403).json({ error: 'No tienes acceso a esta partida.' });
    }
  }
  if (!BattleService.registeredTeams || !BattleService.registeredTeams.heroes || !BattleService.registeredTeams.villains) {
    return res.status(404).json({ error: 'No hay equipos registrados actualmente.' });
  }
  try {
    // Buscar los personajes por id y devolver solo id, nombre y rol
    const allIds = BattleService.registeredTeams.heroes.concat(BattleService.registeredTeams.villains);
    const personajes = await Personaje.find({ id: { $in: allIds } }, { _id: 0, id: 1, nombre: 1, rol: 1 });
    if (personajes.length !== allIds.length) {
      return res.status(400).json({ error: 'Algunos personajes no se encontraron en la base de datos.' });
    }
    // Ordenar según el orden de los ids seleccionados (primero héroes, luego villanos)
    const personajesOrdenados = [
      ...BattleService.registeredTeams.heroes.map(id => personajes.find(p => p.id === id)),
      ...BattleService.registeredTeams.villains.map(id => personajes.find(p => p.id === id))
    ].filter(p => p !== undefined);
    res.json({ 
      message: 'Personajes seleccionados obtenidos correctamente',
      personajes: personajesOrdenados 
    });
  } catch (error) {
    console.error('Error en getSelectedIds:', error);
    res.status(400).json({ error: 'Error al obtener los personajes seleccionados. Intenta nuevamente.' });
  }
};

const getActiveBattleForOwner = async (owner) => {
  // Busca la última batalla activa (no terminada) del usuario
  return await Battle.findOne({ owner, $or: [
    { 'rounds.1.terminado': { $ne: true } },
    { 'rounds.2.terminado': { $ne: true } },
    { 'rounds.3.terminado': { $ne: true } }
  ] }).sort({ createdAt: -1 });
};

const GOLPES = {
  basico: 20,
  especial: 40,
  critico: 60
};

const getGolpeValue = (tipo) => GOLPES[tipo.toLowerCase()] || 0;

const getPersonajeData = async (id) => {
  const personaje = await Personaje.findOne({ id });
  if (!personaje) return null;
  return {
    id: personaje.id,
    nombre: personaje.nombre,
    alias: personaje.alias,
    defensa: personaje.defensa,
    vida: personaje.vida || 200, // fallback por si no existe el campo
    poder: personaje.poder || 0 // fallback por si no existe el campo
  };
};

function calcularDanio(tipoGolpe, poder) {
  const base = GOLPES[tipoGolpe.toLowerCase()] || 0;
  const extra = base * (poder / 100);
  const total = base + extra;
  const decimal = total - Math.floor(total);
  if (decimal <= 0.5) return Math.floor(total);
  return Math.ceil(total);
}

const VIDA_MAXIMA = 200; // Ajusta según tu modelo

function recuperarVida(vidaActual) {
  const recuperado = Math.floor(vidaActual * 0.3);
  return Math.min(vidaActual + recuperado, VIDA_MAXIMA);
}

function buildRoundResponse({ round, personajeHeroe, personajeVillano, mensaje1, mensaje2, rondaTerminada }) {
  return {
    message: 'Movimiento registrado correctamente',
    resultado: {
      heroe: {
        id: personajeHeroe.id,
        nombre: personajeHeroe.nombre,
        alias: personajeHeroe.alias,
        defensa: personajeHeroe.defensa,
        vida: personajeHeroe.vida,
        poder: personajeHeroe.poder,
        nivel: personajeHeroe.nivel,
        experiencia: personajeHeroe.experiencia
      },
      villano: {
        id: personajeVillano.id,
        nombre: personajeVillano.nombre,
        alias: personajeVillano.alias,
        defensa: personajeVillano.defensa,
        vida: personajeVillano.vida,
        poder: personajeVillano.poder,
        nivel: personajeVillano.nivel,
        experiencia: personajeVillano.experiencia
      }
    },
    mensajeHeroe: mensaje1,
    mensajeVillano: mensaje2,
    round,
    siguienteRound: !!rondaTerminada
  };
}

const registerRound1 = async (req, res) => {
  const owner = req.user.username;
  const battle = await getActiveBattleForOwner(owner);
  if (!battle) return res.status(404).json({ error: 'No tienes batallas activas para registrar el round 1. Inicia una batalla primero.' });
  if (!battle.orden || Object.keys(battle.orden).length === 0 || !battle.roles || Object.keys(battle.roles).length === 0) {
    return res.status(400).json({ error: 'Debes registrar el orden de los personajes antes de iniciar la ronda (round 1).' });
  }
  if (battle.rounds && battle.rounds['1'] && battle.rounds['1'].terminado) {
    return res.status(400).json({ error: 'La batalla ha terminado para este round. No se pueden registrar más movimientos.' });
  }
  let usernameHeroe, usernameVillano, personajesHeroe, personajesVillano;
  for (const username of Object.keys(battle.roles)) {
    const rol = battle.roles[username];
    if (rol === 'heroe') {
      usernameHeroe = username;
      personajesHeroe = battle.orden[username];
    } else if (rol === 'villano') {
      usernameVillano = username;
      personajesVillano = battle.orden[username];
    }
  }
  let idx = 0;
  if (battle.rounds && battle.rounds['1'] && battle.rounds['1'].idx !== undefined) {
    idx = battle.rounds['1'].idx;
  }
  // Recuperar el estado actualizado de los personajes si existe
  let personajeHeroe, personajeVillano;
  if (battle.rounds && battle.rounds['1'] && battle.rounds['1'].personaje1 && battle.rounds['1'].personaje2) {
    personajeHeroe = battle.rounds['1'].personaje1;
    personajeVillano = battle.rounds['1'].personaje2;
  } else {
    personajeHeroe = await getPersonajeData(personajesHeroe[idx]);
    personajeVillano = await getPersonajeData(personajesVillano[idx]);
  }
  if (!personajeHeroe || !personajeVillano) {
    return res.status(400).json({ error: 'No se encontraron los personajes para el round 1. Verifica que los IDs sean correctos.' });
  }
  const golpeHeroe = req.body[usernameHeroe];
  const golpeVillano = req.body[usernameVillano];
  const golpesValidos = ["basico", "especial", "critico"];
  if (!golpesValidos.includes((golpeHeroe || '').toLowerCase()) || !golpesValidos.includes((golpeVillano || '').toLowerCase())) {
    return res.status(400).json({ error: 'El tipo de golpe debe ser "basico", "especial" o "critico".' });
  }
  let defensa2 = personajeVillano.defensa;
  let vida2 = personajeVillano.vida;
  let golpeVal1 = calcularDanio(golpeHeroe, personajeHeroe.poder);
  let mensaje1 = '';
  if (defensa2 > 0) {
    if (defensa2 - golpeVal1 >= 0) {
      defensa2 -= golpeVal1;
      mensaje1 = `En el round 1, el héroe ${personajeHeroe.nombre} hizo el golpe ${golpeHeroe} provocando daño al escudo del villano, dejándolo en ${defensa2}, por lo tanto, su vida es ${vida2}.`;
    } else {
      const sobrante = golpeVal1 - defensa2;
      defensa2 = 0;
      vida2 -= sobrante;
      mensaje1 = `En el round 1, el héroe ${personajeHeroe.nombre} hizo el golpe ${golpeHeroe} quitándole daño a la vida del villano, dejándolo en ${vida2}, su escudo es 0.`;
    }
  } else {
    vida2 -= golpeVal1;
    mensaje1 = `En el round 1, el héroe ${personajeHeroe.nombre} hizo el golpe ${golpeHeroe} quitándole daño a la vida del villano, dejándolo en ${vida2}, su escudo es 0.`;
  }
  let defensa1 = personajeHeroe.defensa;
  let vida1 = personajeHeroe.vida;
  let golpeVal2 = calcularDanio(golpeVillano, personajeVillano.poder);
  let mensaje2 = '';
  if (defensa1 > 0) {
    if (defensa1 - golpeVal2 >= 0) {
      defensa1 -= golpeVal2;
      mensaje2 = `En el round 1, el villano ${personajeVillano.nombre} hizo el golpe ${golpeVillano} provocando daño al escudo del héroe, dejándolo en ${defensa1}, por lo tanto, su vida es ${vida1}.`;
    } else {
      const sobrante = golpeVal2 - defensa1;
      defensa1 = 0;
      vida1 -= sobrante;
      mensaje2 = `En el round 1, el villano ${personajeVillano.nombre} hizo el golpe ${golpeVillano} quitándole daño a la vida del héroe, dejándolo en ${vida1}, su escudo es 0.`;
    }
  } else {
    vida1 -= golpeVal2;
    mensaje2 = `En el round 1, el villano ${personajeVillano.nombre} hizo el golpe ${golpeVillano} quitándole daño a la vida del héroe, dejándolo en ${vida1}, su escudo es 0.`;
  }
  // Después de calcular el daño y antes de guardar el estado:
  vida1 = Math.max(0, vida1);
  vida2 = Math.max(0, vida2);
  personajeHeroe.defensa = defensa1;
  personajeHeroe.vida = vida1;
  personajeVillano.defensa = defensa2;
  personajeVillano.vida = vida2;
  let rondaTerminada = false;
  let siguienteIdx = idx;
  if (vida1 <= 0 && vida2 <= 0) {
    siguienteIdx = idx + 1;
    rondaTerminada = true;
  } else if (vida1 <= 0) {
    siguienteIdx = idx + 1;
    rondaTerminada = true;
  } else if (vida2 <= 0) {
    siguienteIdx = idx + 1;
    rondaTerminada = true;
  }
  battle.rounds = battle.rounds || {};
  battle.rounds['1'] = {
    idx: rondaTerminada ? siguienteIdx : idx,
    personaje1: personajeHeroe,
    personaje2: personajeVillano,
    terminado: rondaTerminada
  };
  battle.markModified('rounds');
  await battle.save();
  res.json(buildRoundResponse({ round: 1, personajeHeroe, personajeVillano, mensaje1, mensaje2, rondaTerminada }));
};

// Repetir la misma lógica para registerRound2 y registerRound3, cambiando el número de round y los mensajes
const registerRound2 = async (req, res) => {
  const owner = req.user.username;
  const battle = await getActiveBattleForOwner(owner);
  if (!battle) return res.status(404).json({ error: 'No tienes batallas activas para registrar el round 2. Inicia una batalla primero.' });
  // --- BLOQUEO DE ACCESO ---
  if (!battle.rounds || !battle.rounds['1'] || !battle.rounds['1'].terminado) {
    return res.status(400).json({ error: 'No puedes iniciar el round 2 hasta que el round 1 haya terminado.' });
  }
  if (!battle.orden || Object.keys(battle.orden).length === 0 || !battle.roles || Object.keys(battle.roles).length === 0) {
    console.error('[registerRound2] Falta orden o roles en la batalla:', battle.id, battle.orden, battle.roles);
    return res.status(400).json({ error: 'Debes registrar el orden de los personajes antes de iniciar la ronda (round 2).' });
  }
  // Bloquear si la ronda ya terminó
  if (battle.rounds && battle.rounds['2'] && battle.rounds['2'].terminado) {
    return res.status(400).json({ error: 'La batalla ha terminado para este round. No se pueden registrar más movimientos.' });
  }
  let usernameHeroe, usernameVillano, personajesHeroe, personajesVillano;
  for (const username of Object.keys(battle.roles)) {
    const rol = battle.roles[username];
    if (rol === 'heroe') {
      usernameHeroe = username;
      personajesHeroe = battle.orden[username];
    } else if (rol === 'villano') {
      usernameVillano = username;
      personajesVillano = battle.orden[username];
    }
  }
  // Determinar el índice del personaje a usar
  let idx = 0;
  // Si ya hay estado guardado, usar el índice correspondiente
  if (battle.rounds && battle.rounds['2'] && battle.rounds['2'].idx !== undefined) {
    idx = battle.rounds['2'].idx;
  }
  // Obtener estado actual de los personajes
  let personajeHeroe, personajeVillano;
  if (battle.rounds && battle.rounds['2'] && battle.rounds['2'].personaje1 && battle.rounds['2'].personaje2) {
    personajeHeroe = battle.rounds['2'].personaje1;
    personajeVillano = battle.rounds['2'].personaje2;
  } else {
    personajeHeroe = await getPersonajeData(personajesHeroe[idx]);
    personajeVillano = await getPersonajeData(personajesVillano[idx]);
  }
  if (!personajeHeroe || !personajeVillano) {
    return res.status(400).json({ error: 'No se encontraron los personajes para el round 2. Verifica que los IDs sean correctos.' });
  }
  const golpeHeroe = req.body[usernameHeroe];
  const golpeVillano = req.body[usernameVillano];
  const golpesValidos = ["basico", "especial", "critico"];
  if (!golpesValidos.includes((golpeHeroe || '').toLowerCase()) || !golpesValidos.includes((golpeVillano || '').toLowerCase())) {
    return res.status(400).json({ error: 'El tipo de golpe debe ser "basico", "especial" o "critico".' });
  }
  // Procesar ataque usuario 1 -> usuario 2
  let defensa2 = personajeVillano.defensa;
  let vida2 = personajeVillano.vida;
  let golpeVal1 = calcularDanio(golpeHeroe, personajeHeroe.poder);
  let mensaje1 = '';
  if (defensa2 > 0) {
    if (defensa2 - golpeVal1 >= 0) {
      defensa2 -= golpeVal1;
      mensaje1 = `En el round 2, el héroe ${personajeHeroe.nombre} hizo el golpe ${golpeHeroe} provocando daño al escudo del villano, dejándolo en ${defensa2}, por lo tanto, su vida es ${vida2}.`;
    } else {
      const sobrante = golpeVal1 - defensa2;
      defensa2 = 0;
      vida2 -= sobrante;
      mensaje1 = `En el round 2, el héroe ${personajeHeroe.nombre} hizo el golpe ${golpeHeroe} quitándole daño a la vida del villano, dejándolo en ${vida2}, su escudo es 0.`;
    }
  } else {
    vida2 -= golpeVal1;
    mensaje1 = `En el round 2, el héroe ${personajeHeroe.nombre} hizo el golpe ${golpeHeroe} quitándole daño a la vida del villano, dejándolo en ${vida2}, su escudo es 0.`;
  }
  // Procesar ataque usuario 2 -> usuario 1
  let defensa1 = personajeHeroe.defensa;
  let vida1 = personajeHeroe.vida;
  let golpeVal2 = calcularDanio(golpeVillano, personajeVillano.poder);
  let mensaje2 = '';
  if (defensa1 > 0) {
    if (defensa1 - golpeVal2 >= 0) {
      defensa1 -= golpeVal2;
      mensaje2 = `En el round 2, el villano ${personajeVillano.nombre} hizo el golpe ${golpeVillano} provocando daño al escudo del héroe, dejándolo en ${defensa1}, por lo tanto, su vida es ${vida1}.`;
    } else {
      const sobrante = golpeVal2 - defensa1;
      defensa1 = 0;
      vida1 -= sobrante;
      mensaje2 = `En el round 2, el villano ${personajeVillano.nombre} hizo el golpe ${golpeVillano} quitándole daño a la vida del héroe, dejándolo en ${vida1}, su escudo es 0.`;
    }
  } else {
    vida1 -= golpeVal2;
    mensaje2 = `En el round 2, el villano ${personajeVillano.nombre} hizo el golpe ${golpeVillano} quitándole daño a la vida del héroe, dejándolo en ${vida1}, su escudo es 0.`;
  }
  // Después de calcular el daño y antes de guardar el estado:
  vida1 = Math.max(0, vida1);
  vida2 = Math.max(0, vida2);
  // Actualizar estado
  personajeHeroe.defensa = defensa1;
  personajeHeroe.vida = vida1;
  personajeVillano.defensa = defensa2;
  personajeVillano.vida = vida2;
  // Verificar si alguno llegó a 0 de vida
  let rondaTerminada = false;
  let siguienteIdx = idx;
  if (vida1 <= 0 && vida2 <= 0) {
    // Ambos mueren, pasar a los siguientes personajes
    siguienteIdx = idx + 1;
    rondaTerminada = true;
  } else if (vida1 <= 0) {
    // Heroe muere, villano sobrevive
    siguienteIdx = idx + 1;
    rondaTerminada = true;
  } else if (vida2 <= 0) {
    // Villano muere, heroe sobrevive
    siguienteIdx = idx + 1;
    rondaTerminada = true;
  }
  // Guardar estado actualizado
  battle.rounds = battle.rounds || {};
  battle.rounds['2'] = {
    idx: rondaTerminada ? siguienteIdx : idx,
    personaje1: personajeHeroe,
    personaje2: personajeVillano,
    terminado: rondaTerminada
  };
  battle.markModified('rounds');
  await battle.save();
  res.json(buildRoundResponse({ round: 2, personajeHeroe, personajeVillano, mensaje1, mensaje2, rondaTerminada }));
};

// Repetir la misma lógica para registerRound3, cambiando el número de round y los mensajes
const registerRound3 = async (req, res) => {
  const owner = req.user.username;
  const battle = await getActiveBattleForOwner(owner);
  if (!battle) return res.status(404).json({ error: 'No tienes batallas activas para registrar el round 3. Inicia una batalla primero.' });
  // --- BLOQUEO DE ACCESO ---
  if (!battle.rounds || !battle.rounds['2'] || !battle.rounds['2'].terminado) {
    return res.status(400).json({ error: 'No puedes iniciar el round 3 hasta que el round 2 haya terminado.' });
  }
  if (!battle.orden || Object.keys(battle.orden).length === 0 || !battle.roles || Object.keys(battle.roles).length === 0) {
    console.error('[registerRound3] Falta orden o roles en la batalla:', battle.id, battle.orden, battle.roles);
    return res.status(400).json({ error: 'Debes registrar el orden de los personajes antes de iniciar la ronda (round 3).' });
  }
  // Bloquear si la ronda ya terminó
  if (battle.rounds && battle.rounds['3'] && battle.rounds['3'].terminado) {
    return res.status(400).json({ error: 'La batalla ha terminado para este round. No se pueden registrar más movimientos.' });
  }
  let usernameHeroe, usernameVillano, personajesHeroe, personajesVillano;
  for (const username of Object.keys(battle.roles)) {
    const rol = battle.roles[username];
    if (rol === 'heroe') {
      usernameHeroe = username;
      personajesHeroe = battle.orden[username];
    } else if (rol === 'villano') {
      usernameVillano = username;
      personajesVillano = battle.orden[username];
    }
  }
  // Determinar el índice del personaje a usar
  let idx = 0;
  // Si ya hay estado guardado, usar el índice correspondiente
  if (battle.rounds && battle.rounds['3'] && battle.rounds['3'].idx !== undefined) {
    idx = battle.rounds['3'].idx;
  }
  // Obtener estado actual de los personajes
  let personajeHeroe, personajeVillano;
  if (battle.rounds && battle.rounds['3'] && battle.rounds['3'].personaje1 && battle.rounds['3'].personaje2) {
    personajeHeroe = battle.rounds['3'].personaje1;
    personajeVillano = battle.rounds['3'].personaje2;
  } else {
    personajeHeroe = await getPersonajeData(personajesHeroe[idx]);
    personajeVillano = await getPersonajeData(personajesVillano[idx]);
  }
  if (!personajeHeroe || !personajeVillano) {
    return res.status(400).json({ error: 'No se encontraron los personajes para el round 3. Verifica que los IDs sean correctos.' });
  }
  const golpeHeroe = req.body[usernameHeroe];
  const golpeVillano = req.body[usernameVillano];
  const golpesValidos = ["basico", "especial", "critico"];
  if (!golpesValidos.includes((golpeHeroe || '').toLowerCase()) || !golpesValidos.includes((golpeVillano || '').toLowerCase())) {
    return res.status(400).json({ error: 'El tipo de golpe debe ser "basico", "especial" o "critico".' });
  }
  // Procesar ataque usuario 1 -> usuario 2
  let defensa2 = personajeVillano.defensa;
  let vida2 = personajeVillano.vida;
  let golpeVal1 = calcularDanio(golpeHeroe, personajeHeroe.poder);
  let mensaje1 = '';
  if (defensa2 > 0) {
    if (defensa2 - golpeVal1 >= 0) {
      defensa2 -= golpeVal1;
      mensaje1 = `En el round 3, el héroe ${personajeHeroe.nombre} hizo el golpe ${golpeHeroe} provocando daño al escudo del villano, dejándolo en ${defensa2}, por lo tanto, su vida es ${vida2}.`;
    } else {
      const sobrante = golpeVal1 - defensa2;
      defensa2 = 0;
      vida2 -= sobrante;
      mensaje1 = `En el round 3, el héroe ${personajeHeroe.nombre} hizo el golpe ${golpeHeroe} quitándole daño a la vida del villano, dejándolo en ${vida2}, su escudo es 0.`;
    }
  } else {
    vida2 -= golpeVal1;
    mensaje1 = `En el round 3, el héroe ${personajeHeroe.nombre} hizo el golpe ${golpeHeroe} quitándole daño a la vida del villano, dejándolo en ${vida2}, su escudo es 0.`;
  }
  // Procesar ataque usuario 2 -> usuario 1
  let defensa1 = personajeHeroe.defensa;
  let vida1 = personajeHeroe.vida;
  let golpeVal2 = calcularDanio(golpeVillano, personajeVillano.poder);
  let mensaje2 = '';
  if (defensa1 > 0) {
    if (defensa1 - golpeVal2 >= 0) {
      defensa1 -= golpeVal2;
      mensaje2 = `En el round 3, el villano ${personajeVillano.nombre} hizo el golpe ${golpeVillano} provocando daño al escudo del héroe, dejándolo en ${defensa1}, por lo tanto, su vida es ${vida1}.`;
    } else {
      const sobrante = golpeVal2 - defensa1;
      defensa1 = 0;
      vida1 -= sobrante;
      mensaje2 = `En el round 3, el villano ${personajeVillano.nombre} hizo el golpe ${golpeVillano} quitándole daño a la vida del héroe, dejándolo en ${vida1}, su escudo es 0.`;
    }
  } else {
    vida1 -= golpeVal2;
    mensaje2 = `En el round 3, el villano ${personajeVillano.nombre} hizo el golpe ${golpeVillano} quitándole daño a la vida del héroe, dejándolo en ${vida1}, su escudo es 0.`;
  }
  // Después de calcular el daño y antes de guardar el estado:
  vida1 = Math.max(0, vida1);
  vida2 = Math.max(0, vida2);
  // Actualizar estado
  personajeHeroe.defensa = defensa1;
  personajeHeroe.vida = vida1;
  personajeVillano.defensa = defensa2;
  personajeVillano.vida = vida2;
  // Verificar si alguno llegó a 0 de vida
  let rondaTerminada = false;
  let siguienteIdx = idx;
  if (vida1 <= 0 && vida2 <= 0) {
    // Ambos mueren, pasar a los siguientes personajes
    siguienteIdx = idx + 1;
    rondaTerminada = true;
  } else if (vida1 <= 0) {
    // Heroe muere, villano sobrevive
    siguienteIdx = idx + 1;
    rondaTerminada = true;
  } else if (vida2 <= 0) {
    // Villano muere, heroe sobrevive
    siguienteIdx = idx + 1;
    rondaTerminada = true;
  }
  // Guardar estado actualizado
  battle.rounds = battle.rounds || {};
  battle.rounds['3'] = {
    idx: rondaTerminada ? siguienteIdx : idx,
    personaje1: personajeHeroe,
    personaje2: personajeVillano,
    terminado: rondaTerminada
  };
  battle.markModified('rounds');
  await battle.save();
  res.json(buildRoundResponse({ round: 3, personajeHeroe, personajeVillano, mensaje1, mensaje2, rondaTerminada }));
};

// Eliminar el controlador antiguo de wins y el post de battles 1vs1

// Nuevo controlador para resultados de las rondas
const getBattleWinsById = async (req, res) => {
  const battleId = req.params.id;
  const Battle = require('../models/battle');
  const battle = await Battle.findById(battleId);
  if (!battle) return res.status(404).json({ error: 'No se encontró la batalla.' });

  const results = [];
  for (const roundNum of Object.keys(battle.rounds || {})) {
    const round = battle.rounds[roundNum];
    if (!round.personaje1 || !round.personaje2) continue;
    results.push({
      round: roundNum,
      personajeHeroe: {
        id: round.personaje1.id,
        nombre: round.personaje1.nombre,
        rol: 'heroe',
        defensa: round.personaje1.defensa,
        vida: round.personaje1.vida
      },
      personajeVillano: {
        id: round.personaje2.id,
        nombre: round.personaje2.nombre,
        rol: 'villano',
        defensa: round.personaje2.defensa,
        vida: round.personaje2.vida
      }
    });
  }
  res.json({ battleId, resultados: results });
};

module.exports.getBattleWinsById = getBattleWinsById;

const createBattle = async (req, res) => {
  try {
    const { "username 1": usuario1, "username 2": usuario2 } = req.body;
    const owner = req.user.username;
    if (!usuario1 || typeof usuario1 !== 'string' || usuario1.trim() === '' || usuario1.trim().toLowerCase() === 'null') {
      return res.status(400).json({ error: 'Debes ingresar tu nombre de usuario en "username 1". No puede estar vacío ni ser "null".' });
    }
    let usuarios = [usuario1];
    if (
      usuario2 &&
      typeof usuario2 === 'string' &&
      usuario2.trim() !== '' &&
      usuario2.trim().toLowerCase() !== 'null'
    ) {
      usuarios.push(usuario2);
    }
    // Validar que los usuarios existan la cantidad de veces que aparecen en el array
    const userCounts = {};
    for (const username of usuarios) {
      userCounts[username] = (userCounts[username] || 0) + 1;
    }
    for (const [username, count] of Object.entries(userCounts)) {
      const usersFound = await User.find({ username });
      if (usersFound.length < count) {
        return res.status(404).json({ error: `El usuario "${username}" no existe o no está registrado la cantidad de veces requerida (${count}). Verifica que hayas escrito correctamente tu nombre de usuario.` });
      }
    }
    // Verificar si el usuario ya tiene una partida activa
    const existingBattle = await Battle.findOne({ owner });
    if (existingBattle) {
      return res.status(400).json({ error: 'Ya tienes una partida activa. Debes finalizar o eliminar la partida actual antes de crear una nueva.' });
    }
    // Crear la batalla
    const battle = new Battle({
      owner,
      usuarios,
      rounds: {},
      currentRound: 1
    });
    await battle.save();
    res.status(201).json({ message: '¡La partida ha sido creada exitosamente! Guarda el ID de la partida para futuras acciones.', id: battle.id, usuarios });
  } catch (err) {
    console.error('[createBattle] Error interno:', err);
    res.status(500).json({ error: 'Error interno al crear la partida. Intenta de nuevo o revisa los datos enviados.' });
  }
};

const getPendingBattle = async (req, res) => {
  // Buscar batallas donde alguna ronda no esté terminada
  const battles = await Battle.find({
    $or: [
      { 'rounds.1.terminado': { $ne: true } },
      { 'rounds.2.terminado': { $ne: true } },
      { 'rounds.3.terminado': { $ne: true } }
    ]
  }, { battleId: 1, usuarios: 1, currentRound: 1, _id: 0 });
  res.json({ pendientes: battles });
};

const registerOrder = async (req, res) => {
  const owner = req.user.username;
  console.log('[registerOrder] Usuario autenticado:', owner);
  // Extraer los nombres de usuario y roles dinámicamente
  const keys = Object.keys(req.body).filter(k => !k.startsWith('personajes'));
  if (keys.length !== 2) {
    return res.status(400).json({ error: 'Debes enviar exactamente dos usuarios con sus roles.' });
  }
  const username1 = keys[0];
  const username2 = keys[1];
  const rol1 = req.body[username1];
  const rol2 = req.body[username2];
  const personajes1 = req.body.personajes1;
  const personajes2 = req.body.personajes2;
  // Validar formato y roles
  if (!rol1 || !rol2 || typeof rol1 !== 'string' || typeof rol2 !== 'string' || rol1.trim() === '' || rol2.trim() === '') {
    return res.status(400).json({ error: 'Debes especificar el rol de cada usuario ("heroe" o "villano"). No puede haber campos vacíos.' });
  }
  const rol1Lower = rol1.trim().toLowerCase();
  const rol2Lower = rol2.trim().toLowerCase();
  if (!['heroe', 'villano'].includes(rol1Lower) || !['heroe', 'villano'].includes(rol2Lower)) {
    return res.status(400).json({ error: 'El rol solo puede ser "heroe" o "villano" para ambos usuarios.' });
  }
  if (rol1Lower === rol2Lower) {
    return res.status(400).json({ error: 'No puedes asignar el mismo rol a ambos usuarios. Uno debe ser "heroe" y el otro "villano".' });
  }
  if (!Array.isArray(personajes1) || !Array.isArray(personajes2)) {
    return res.status(400).json({ error: 'Debes enviar los arrays de personajes para ambos usuarios.' });
  }
  // Validar que exista una partida activa y equipos registrados
  const battle = await getActiveBattleForOwner(owner);
  if (!battle) {
    console.error('[registerOrder] No se encontró batalla activa para el usuario:', owner);
    return res.status(400).json({ error: 'Primero debes crear una partida y registrar equipos antes de ordenar los personajes.' });
  }
  if (!battle.equipos || battle.equipos.size === 0) {
    console.error('[registerOrder] No hay equipos registrados en la batalla:', battle.id);
    return res.status(400).json({ error: 'Debes registrar los equipos antes de ordenar los personajes.' });
  }
  // Mapear usernames a roles y usuarios
  let usernameHeroe, usernameVillano, personajesHeroe, personajesVillano;
  if (rol1Lower === 'heroe') {
    usernameHeroe = username1;
    personajesHeroe = personajes1;
    usernameVillano = username2;
    personajesVillano = personajes2;
  } else {
    usernameHeroe = username2;
    personajesHeroe = personajes2;
    usernameVillano = username1;
    personajesVillano = personajes1;
  }
  // Validar que los personajes correspondan al rol elegido
  const equipos = battle.equipos;
  const heroesRegistrados = equipos.get(usernameHeroe) || [];
  const villanosRegistrados = equipos.get(usernameVillano) || [];
  // Validar que los personajes del héroe sean héroes y los del villano sean villanos
  const personajesHeroeDocs = await Personaje.find({ id: { $in: personajesHeroe } });
  const personajesVillanoDocs = await Personaje.find({ id: { $in: personajesVillano } });
  if (!personajesHeroe.every(id => heroesRegistrados.includes(id)) || personajesHeroe.length !== 3 || personajesHeroeDocs.some(p => p.rol !== 'heroe')) {
    return res.status(400).json({ error: 'Los personajes del héroe deben ser IDs de héroes registrados y ser exactamente 3.' });
  }
  if (!personajesVillano.every(id => villanosRegistrados.includes(id)) || personajesVillano.length !== 3 || personajesVillanoDocs.some(p => p.rol !== 'villano')) {
    return res.status(400).json({ error: 'Los personajes del villano deben ser IDs de villanos registrados y ser exactamente 3.' });
  }
  // Validar que no haya personajes repetidos entre ambos arrays
  const allPersonajes = personajesHeroe.concat(personajesVillano);
  const uniquePersonajes = new Set(allPersonajes);
  if (uniquePersonajes.size !== allPersonajes.length) {
    return res.status(400).json({ error: 'No se permiten personajes repetidos entre héroe y villano. Cada personaje debe ser único.' });
  }
  // Guardar el orden y roles en la batalla
  battle.orden = {
    [usernameHeroe]: personajesHeroe,
    [usernameVillano]: personajesVillano
  };
  battle.roles = {
    [usernameHeroe]: 'heroe',
    [usernameVillano]: 'villano'
  };
  try {
  await battle.save();
    console.log('[registerOrder] Orden y roles guardados correctamente para batalla:', battle.id);
  } catch (err) {
    console.error('[registerOrder] Error al guardar la batalla:', err);
    return res.status(500).json({ error: 'Error interno al guardar el orden y roles. Intenta de nuevo.' });
  }
  res.json({ message: 'Orden y roles registrados correctamente. El héroe y el villano han sido asignados y el orden de los personajes está listo para la batalla.' });
};

module.exports = {
  battle,
  registerTeams,
  getSelectedIds,
  registerRound1,
  registerRound2,
  registerRound3,
  createBattle,
  getPendingBattle,
  registerOrder,
  getBattleWinsById
}; 