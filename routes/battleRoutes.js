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
 *                 type: string
 *               villainId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resultado de la batalla
 *       404:
 *         description: Héroe o villano no encontrado
 */
router.post('/', battleController.battle);

module.exports = router; 