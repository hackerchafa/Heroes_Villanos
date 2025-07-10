const express = require('express');
const app = express();

const heroRoutes = require('./routes/heroRoutes');
const villainRoutes = require('./routes/villainRoutes');
const battleRoutes = require('./routes/battleRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Superheroes',
      version: '1.0.0',
      description: 'Documentación de la API de Héroes, Villanos y Batallas',
    },
    servers: [
      { url: 'http://localhost:3001' }
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

app.use('/heroes', heroRoutes);
app.use('/villains', villainRoutes);
app.use('/battles', battleRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
}); 