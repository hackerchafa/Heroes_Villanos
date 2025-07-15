const express = require('express');
const router = express.Router();
const heroController = require('../controllers/heroController');

/**
 * @swagger
 * tags:
 *   name: Heroes
 *   description: Endpoints para gestión de héroes
 */

/**
 * @swagger
 * /heroes:
 *   get:
 *     summary: Obtener todos los héroes
 *     tags: [Heroes]
 *     responses:
 *       200:
 *         description: Lista de héroes
 */
router.get('/', heroController.getAll);

/**
 * @swagger
 * /heroes/{id}:
 *   get:
 *     summary: Obtener un héroe por ID
 *     tags: [Heroes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Héroe encontrado
 *       404:
 *         description: Héroe no encontrado
 */
router.get('/:id', heroController.getById);

/**
 * @swagger
 * /heroes/page/{page}:
 *   get:
 *     summary: Obtener héroes por página
 *     tags: [Heroes]
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
 *         description: Lista paginada de héroes
 */
router.get('/page/:page', heroController.getByPage);

/**
 * @swagger
 * /heroes:
 *   post:
 *     summary: Crear un nuevo héroe
 *     tags: [Heroes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               nombre:
 *                 type: string
 *               alias:
 *                 type: string
 *               poder:
 *                 type: integer
 *                 description: Nivel de poder inicial (1-100)
 *                 example: 1
 *               defensa:
 *                 type: integer
 *                 description: Defensa, siempre 200 (ignorado si lo envía el usuario)
 *                 example: 200
 *               ciudad:
 *                 type: string
 *               team:
 *                 type: string
 *     responses:
 *       201:
 *         description: Héroe creado
 */
router.post('/', heroController.create);

/**
 * @swagger
 * /heroes/{id}:
 *   put:
 *     summary: Actualizar un héroe
 *     tags: [Heroes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *               poder:
 *                 type: integer
 *                 description: Nivel de poder inicial (1-100)
 *                 example: 1
 *               defensa:
 *                 type: integer
 *                 description: Defensa, siempre 200 (ignorado si lo envía el usuario)
 *                 example: 200
 *               ciudad:
 *                 type: string
 *               team:
 *                 type: string
 *     responses:
 *       200:
 *         description: Héroe actualizado
 *       404:
 *         description: Héroe no encontrado
 */
router.put('/:id', heroController.update);

/**
 * @swagger
 * /heroes/{id}:
 *   delete:
 *     summary: Eliminar un héroe
 *     tags: [Heroes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Héroe eliminado
 *       404:
 *         description: Héroe no encontrado
 */
router.delete('/:id', heroController.remove);

module.exports = router; 