// Rutas del Location Service
const { Router }   = require('express');
const { param }    = require('express-validator');
const { authGuard } = require('../middleware/auth.guard');
const validate      = require('../middleware/validate');
const BikeLocation  = require('../models/bike-location.model');
const StationModel  = require('../models/station.model');

const router = Router();

// GET /api/location/bikes/:id — posición GPS actual (simula movimiento si in_use)
router.get(
  '/bikes/:id',
  authGuard,
  [param('id').isInt({ min: 1 }).withMessage('ID debe ser entero positivo')],
  validate,
  (req, res) => {
    try {
      const bikeId = parseInt(req.params.id);
      // Obtiene o inicializa ubicación y simula movimiento si está en uso
      const loc = BikeLocation.updateLocation(bikeId, req.query.status || 'available');

      return res.json({
        success: true,
        data: {
          bike_id:    loc.bike_id,
          lat:        loc.lat,
          lng:        loc.lng,
          heading:    loc.heading,
          speed:      loc.speed,
          status:     loc.status,
          updated_at: loc.updated_at,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/location/stations — todas las estaciones de Medellín
router.get('/stations', authGuard, (req, res) => {
  try {
    return res.json({ success: true, data: StationModel.findAll() });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/location/bikes — ubicación de todas las bikes activas
router.get('/bikes', authGuard, (req, res) => {
  try {
    const db  = require('../config/database');
    const all = db.prepare('SELECT * FROM bike_locations').all();
    return res.json({ success: true, data: all });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
