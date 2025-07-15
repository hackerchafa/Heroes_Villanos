const express = require('express');
const router = express.Router();
const villainController = require('../controllers/villainController');

/**
 * @swagger
 * tags:
 *   name: Villains
 *   description: Endpoints para gestión de villanos
 */

/**
 * @swagger
 * /villains:
 *   get:
 *     summary: Obtener todos los villanos
 *     tags: [Villains]
 *     responses:
 *       200:
 *         description: Lista de villanos
 */
router.get('/', villainController.getAll);

/**
 * @swagger
 * /villains/{id}:
 *   get:
 *     summary: Obtener un villano por ID
 *     tags: [Villains]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Villano encontrado
 *       404:
 *         description: Villano no encontrado
 */
router.get('/:id', villainController.getById);

/**
 * @swagger
 * /villains/page/{page}:
 *   get:
 *     summary: Obtener villanos por página
 *     tags: [Villains]
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
 *         description: Lista paginada de villanos
 */
router.get('/page/:page', villainController.getByPage);

/**
 * @swagger
 * /villains:
 *   post:
 *     summary: Crear un nuevo villano
 *     tags: [Villains]
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
 *         description: Villano creado
 */
router.post('/', villainController.create);

/**
 * @swagger
 * /villains/{id}:
 *   put:
 *     summary: Actualizar un villano
 *     tags: [Villains]
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
 *         description: Villano actualizado
 *       404:
 *         description: Villano no encontrado
 */
router.put('/:id', villainController.update);

/**
 * @swagger
 * /villains/{id}:
 *   delete:
 *     summary: Eliminar un villano
 *     tags: [Villains]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Villano eliminado
 *       404:
 *         description: Villano no encontrado
 */
router.delete('/:id', villainController.remove);

module.exports = router; 