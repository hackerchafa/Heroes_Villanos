const express = require('express');
const router = express.Router();
const battleController = require('../controllers/battleController');

/**
 * @swagger
 * tags:
 *   name: Battles
 *   description: Endpoints para batallas entre héroes y villanos
 */

/**
 * @swagger
 * /battles:
 *   post:
 *     summary: Realizar una batalla entre un héroe y un villano
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               heroId:
 *                 type: integer
 *               villainId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Resultado de la batalla
 *       404:
 *         description: Héroe o villano no encontrado
 */
router.post('/', battleController.battle);

/**
 * @swagger
 * /battles/team:
 *   post:
 *     summary: Registrar equipos 3vs3 (Héroes vs Villanos)
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               heroe1:
 *                 type: integer
 *                 description: ID del primer héroe
 *               heroe2:
 *                 type: integer
 *                 description: ID del segundo héroe
 *               heroe3:
 *                 type: integer
 *                 description: ID del tercer héroe
 *               villano1:
 *                 type: integer
 *                 description: ID del primer villano
 *               villano2:
 *                 type: integer
 *                 description: ID del segundo villano
 *               villano3:
 *                 type: integer
 *                 description: ID del tercer villano
 *             required:
 *               - heroe1
 *               - heroe2
 *               - heroe3
 *               - villano1
 *               - villano2
 *               - villano3
 *     responses:
 *       200:
 *         description: Equipos registrados correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/team', battleController.teamBattle);

/**
 * @swagger
 * /battles/orden:
 *   post:
 *     summary: Registrar el orden de los personajes para el enfrentamiento (debe haber equipos registrados)
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               battleId:
 *                 type: string
 *                 description: ID de la batalla (definido por el usuario)
 *                 example: ""
 *               heroes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de los héroes en el orden deseado
 *                 example: [0, 0, 0]
 *               villains:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de los villanos en el orden deseado
 *                 example: [0, 0, 0]
 *             required:
 *               - battleId
 *               - heroes
 *               - villains
 *     responses:
 *       200:
 *         description: Orden registrado correctamente
 *       400:
 *         description: Error de validación (sin equipos registrados, campos vacíos o IDs no coinciden)
 */
router.post('/orden', battleController.registerOrder);

/**
 * @swagger
 * /battles/combinations:
 *   post:
 *     summary: Registrar combinaciones de héroe y villano para el turno actual de la batalla
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               battleId:
 *                 type: string
 *                 description: ID de la batalla
 *                 example: ""
 *               CombinacionHero:
 *                 type: string
 *                 description: Combinación del héroe (solo letras Y, X, A, B, de 1 a 5 caracteres)
 *                 example: ""
 *               CombinacionVillain:
 *                 type: string
 *                 description: Combinación del villano (solo letras Y, X, A, B, de 1 a 5 caracteres)
 *                 example: ""
 *             required:
 *               - battleId
 *               - CombinacionHero
 *               - CombinacionVillain
 *     responses:
 *       200:
 *         description: Movimiento registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/combinations', battleController.addAttackCombination);

// Eliminar el endpoint flexible de round
// router.post('/combinations/round/:roundNumber', battleController.addRoundCombination);

// Agregar endpoints fijos para cada round
/**
 * @swagger
 * /battles/combinations2:
 *   post:
 *     summary: Registrar combinaciones de héroe y villano para el segundo round de la batalla por equipos
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               battleId:
 *                 type: string
 *                 description: ID de la batalla
 *                 example: ""
 *               CombinacionHero:
 *                 type: string
 *                 description: Combinación del héroe (solo letras Y, X, A, B, de 1 a 5 caracteres)
 *                 example: ""
 *               CombinacionVillain:
 *                 type: string
 *                 description: Combinación del villano (solo letras Y, X, A, B, de 1 a 5 caracteres)
 *                 example: ""
 *             required:
 *               - battleId
 *               - CombinacionHero
 *               - CombinacionVillain
 *     responses:
 *       200:
 *         description: Movimientos registrados correctamente, muestra los nombres y resultados del round
 *       400:
 *         description: Datos inválidos o batalla terminada
 */
router.post('/combinations2', battleController.addCombination2);

/**
 * @swagger
 * /battles/combinations3:
 *   post:
 *     summary: Registrar combinaciones de héroe y villano para el tercer round de la batalla por equipos
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               battleId:
 *                 type: string
 *                 description: ID de la batalla
 *                 example: ""
 *               CombinacionHero:
 *                 type: string
 *                 description: Combinación del héroe (solo letras Y, X, A, B, de 1 a 5 caracteres)
 *                 example: ""
 *               CombinacionVillain:
 *                 type: string
 *                 description: Combinación del villano (solo letras Y, X, A, B, de 1 a 5 caracteres)
 *                 example: ""
 *             required:
 *               - battleId
 *               - CombinacionHero
 *               - CombinacionVillain
 *     responses:
 *       200:
 *         description: Movimientos registrados correctamente, muestra los nombres y resultados del round
 *       400:
 *         description: Datos inválidos o batalla terminada
 */
router.post('/combinations3', battleController.addCombination3);

/**
 * @swagger
 * /battles/combinations:
 *   get:
 *     summary: Obtener todas las combinaciones de golpes
 *     tags: [Battles]
 *     responses:
 *       200:
 *         description: Lista de combinaciones de golpes
 */
router.get('/combinations', battleController.getAttackCombinations);

/**
 * @swagger
 * /battles/combinations/{battleId}/movimientos:
 *   get:
 *     summary: Obtener el historial de movimientos de la batalla
 *     tags: [Battles]
 *     parameters:
 *       - in: path
 *         name: battleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la batalla
 *     responses:
 *       200:
 *         description: Historial de movimientos de la batalla
 *       404:
 *         description: Batalla no encontrada
 */
router.get('/combinations/:battleId/movimientos', battleController.getBattleMovements);

/**
 * @swagger
 * /battles/team/available:
 *   get:
 *     summary: Obtener los equipos y el orden registrados actualmente
 *     tags: [Battles]
 *     responses:
 *       200:
 *         description: Equipos y orden registrados
 *       404:
 *         description: No hay equipos registrados actualmente
 */
router.get('/team/available', battleController.getAvailableTeamBattles);

/**
 * @swagger
 * /battles/wins/{battleId}:
 *   get:
 *     summary: Obtener los resultados finales de cada ronda de la batalla (solo cuando las 3 rondas hayan terminado)
 *     tags: [Battles]
 *     parameters:
 *       - in: path
 *         name: battleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la batalla
 *     responses:
 *       200:
 *         description: Resultados finales de cada ronda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 battleId:
 *                   type: string
 *                 message:
 *                   type: string
 *                   example: "Resultados finales de la batalla completada"
 *                 resultados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       round:
 *                         type: integer
 *                       ganador:
 *                         type: string
 *                       perdedor:
 *                         type: string
 *                       vidaGanador:
 *                         type: integer
 *                       golpesUtilizados:
 *                         type: integer
 *                       estado:
 *                         type: string
 *                         example: "Terminado"
 *       400:
 *         description: battleId no proporcionado, inválido, o las 3 rondas aún no han terminado
 *       404:
 *         description: No hay datos de batalla para este battleId
 */
router.get('/wins/:battleId', battleController.getWins);

module.exports = router; 