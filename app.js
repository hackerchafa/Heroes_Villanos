require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('./db');
const cors = require('cors');

const battleRoutes = require('./routes/battleRoutes');
const authRoutes = require('./routes/authRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const personajeRoutes = require('./routes/personajeRoutes');
const verifyToken = require('./middleware/verifyToken');
const authController = require('./controllers/authController');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Superheroes',
      version: '1.0.0',
      description: 'Documentación de la API de Héroes, Villanos y Batallas',
    },
    servers: [
      { url: 'https://heroes-villanos.onrender.com' },
      { url: 'http://localhost:3001' }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      { BearerAuth: [] }
    ]
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Permitir cualquier origen para pruebas locales
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

// Rutas públicas
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);

// Proteger el resto
app.use(verifyToken);
app.use('/auth', authRoutes); // Cualquier otro endpoint de /auth protegido
app.use('/battles', battleRoutes);
app.use('/personajes', personajeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
}); 