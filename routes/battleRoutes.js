const express = require('express');
const router = express.Router();
const battleController = require('../controllers/battleController');
const verifyToken = require('../middleware/verifyToken');

/**
 * @swagger
 * tags:
 *   name: Battles
 *   description: Endpoints para batallas entre héroes y villanos
 */

/**
 * @swagger
 * /battles/create:
 *   post:
 *     summary: Crear una nueva partida (battle)
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username 1:
 *                 type: string
 *                 description: Tu nombre de usuario (obligatorio)
 *               username 2:
 *                 type: string
 *                 description: Nombre de usuario del segundo jugador (opcional)
 *           example:
 *             username 1: "escribe_tu_username"
 *             username 2: "otro_username"
 *     responses:
 *       201:
 *         description: Partida creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Error de validación. Verifica que los campos estén completos y correctos.
 *       404:
 *         description: Algún usuario no existe o no está registrado. Verifica los nombres de usuario.
 */
router.post('/create', verifyToken, battleController.createBattle);
/**
 * @swagger
 * /battles/pending:
 *   get:
 *     summary: Obtener las batallas en curso (no terminadas)
 *     tags: [Battles]
 *     responses:
 *       200:
 *         description: Devuelve un array con las batallas en curso (battleId, usuarios, currentRound)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pendientes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       battleId:
 *                         type: string
 *                       usuarios:
 *                         type: array
 *                         items:
 *                           type: string
 *                       currentRound:
 *                         type: number
 */
router.get('/pending', verifyToken, battleController.getPendingBattle);

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
 *               personaje 1:
 *                 type: integer
 *               personaje 2:
 *                 type: integer
 *               personaje 3:
 *                 type: integer
 *               personaje 4:
 *                 type: integer
 *               personaje 5:
 *                 type: integer
 *               personaje 6:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Equipos registrados
 */
router.post('/team', battleController.registerTeams);
/**
 * @swagger
 * /battles/selected-ids:
 *   get:
 *     summary: Obtener los personajes seleccionados en el último equipo registrado
 *     tags: [Battles]
 *     responses:
 *       200:
 *         description: Lista de personajes seleccionados (id, nombre y rol)
 */
router.get('/selected-ids', battleController.getSelectedIds);

/**
 * @swagger
 * /battles/orden:
 *   post:
 *     summary: Registrar el orden de los personajes y el rol de cada usuario (heroe o villano)
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Hector:
 *                 type: string
 *                 description: Rol del usuario Hector ("heroe" o "villano")
 *               personajes1:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de los personajes del usuario 1 en orden
 *               Juan:
 *                 type: string
 *                 description: Rol del usuario Juan ("heroe" o "villano")
 *               personajes2:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de los personajes del usuario 2 en orden
 *           example:
 *             Hector: "rol"
 *             personajes1: [0, 0, 0]
 *             Juan: "rol"
 *             personajes2: [0, 0, 0]
 *     responses:
 *       200:
 *         description: Orden registrado correctamente
 *       400:
 *         description: Error de validación. Verifica que los roles y el orden sean correctos. El rol debe ser "heroe" o "villano", no puede haber dos iguales ni campos vacíos.
 */
router.post('/orden', require('../controllers/battleController').registerOrder);

/**
 * @swagger
 * /battles/round1:
 *   post:
 *     summary: Registrar el resultado del round 1
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *               description: El tipo de golpe ("basico", "especial" o "critico")
 *           example:
 *             Hector: "basico"
 *             Juan: "critico"
 *     responses:
 *       200:
 *         description: Movimiento del Round 1 registrado correctamente
 *       400:
 *         description: Error de validación. El tipo de golpe debe ser "basico", "especial" o "critico" y los nombres deben coincidir con los usuarios de la batalla.
 */
router.post('/round1', battleController.registerRound1);
/**
 * @swagger
 * /battles/round2:
 *   post:
 *     summary: Registrar el resultado del round 2
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *               description: El tipo de golpe ("basico", "especial" o "critico")
 *           example:
 *             Hector: "especial"
 *             Juan: "basico"
 *     responses:
 *       200:
 *         description: Movimiento del Round 2 registrado correctamente
 *       400:
 *         description: Error de validación. El tipo de golpe debe ser "basico", "especial" o "critico" y los nombres deben coincidir con los usuarios de la batalla.
 */
router.post('/round2', battleController.registerRound2);
/**
 * @swagger
 * /battles/round3:
 *   post:
 *     summary: Registrar el resultado del round 3
 *     tags: [Battles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *               description: El tipo de golpe ("basico", "especial" o "critico")
 *           example:
 *             Hector: "critico"
 *             Juan: "especial"
 *     responses:
 *       200:
 *         description: Movimiento del Round 3 registrado correctamente
 *       400:
 *         description: Error de validación. El tipo de golpe debe ser "basico", "especial" o "critico" y los nombres deben coincidir con los usuarios de la batalla.
 */
router.post('/round3', battleController.registerRound3);

/**
 * @swagger
 * /battles/wins/{id}:
 *   get:
 *     summary: Obtener los resultados finales de cada ronda de la batalla (solo cuando las 3 rondas hayan terminado)
 *     tags: [Battles]
 *     parameters:
 *       - in: path
 *         name: id
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
router.get('/battles/wins/:id', battleController.getBattleWinsById);

module.exports = router; 