const express        = require('express');
const cors           = require('cors');
const locationRoutes = require('./routes/location.routes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json());

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'location-service' }));

// Rutas
app.use('/api/location', locationRoutes);

// Handler global de errores
app.use((err, req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.statusCode === 500 ? 'Error interno del servidor' : err.message,
  });
});

module.exports = app;
