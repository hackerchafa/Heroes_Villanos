const express = require('express');
const router = express.Router();
const personajeController = require('../controllers/personajeController');

/**
 * @swagger
 * tags:
 *   name: Personajes
 *   description: Endpoints para gestión de personajes (héroes y villanos)
 */

/**
 * @swagger
 * /personajes:
 *   get:
 *     summary: Obtener todos los personajes
 *     tags: [Personajes]
 *     responses:
 *       200:
 *         description: Lista de personajes
 */

/**
 * @swagger
 * /personajes/heroes:
 *   get:
 *     summary: Obtener todos los héroes
 *     tags: [Personajes]
 *     responses:
 *       200:
 *         description: Lista de héroes
 */

/**
 * @swagger
 * /personajes/villanos:
 *   get:
 *     summary: Obtener todos los villanos
 *     tags: [Personajes]
 *     responses:
 *       200:
 *         description: Lista de villanos
 */

/**
 * @swagger
 * /personajes/{id}:
 *   get:
 *     summary: Obtener un personaje por ID
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personaje encontrado
 *       404:
 *         description: Personaje no encontrado
 */

/**
 * @swagger
 * /personajes/page/{page}:
 *   get:
 *     summary: Obtener personajes paginados
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de personajes
 */

/**
 * @swagger
 * /personajes:
 *   post:
 *     summary: Crear un nuevo personaje
 *     tags: [Personajes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               alias:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               team:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [heroe, villano]
 *     responses:
 *       201:
 *         description: Personaje creado
 *       400:
 *         description: Error de validación
 */

/**
 * @swagger
 * /personajes/{id}:
 *   put:
 *     summary: Actualizar un personaje
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               alias:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               team:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [heroe, villano]
 *     responses:
 *       200:
 *         description: Personaje actualizado
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Personaje no encontrado
 */

/**
 * @swagger
 * /personajes/{id}:
 *   delete:
 *     summary: Eliminar un personaje
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personaje eliminado
 *       404:
 *         description: Personaje no encontrado
 */

// Obtener solo héroes
router.get('/heroes', personajeController.getHeroes);
// Obtener solo villanos
router.get('/villanos', personajeController.getVillanos);
// Obtener personajes paginados
router.get('/page/:page', personajeController.getByPage);
// Obtener personaje por ID
router.get('/:id', personajeController.getById);
// Obtener todos los personajes
router.get('/', personajeController.getAll);
// Crear personaje
router.post('/', personajeController.create);
// Actualizar personaje
router.put('/:id', personajeController.update);
// Eliminar personaje
router.delete('/:id', personajeController.delete);
// Endpoint temporal para poblar la base de datos
router.post('/seed', personajeController.seed);

module.exports = router; 