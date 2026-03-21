// Rutas Location Service — MySQL async
const { Router }    = require('express');
const { param }     = require('express-validator');
const { authGuard } = require('../middleware/auth.guard');
const validate      = require('../middleware/validate');
const BikeLocation  = require('../models/bike-location.model');
const StationModel  = require('../models/station.model');

const router = Router();

// GET /api/location/bikes/:id
router.get('/bikes/:id', authGuard,
  [param('id').isInt({ min: 1 })], validate,
  async (req, res) => {
    try {
      const bikeId = parseInt(req.params.id);
      const status = req.query.status || 'available';
      const loc    = await BikeLocation.updateLocation(bikeId, status);
      return res.json({ success: true, data: { bike_id: loc.bike_id, lat: parseFloat(loc.lat), lng: parseFloat(loc.lng), heading: parseFloat(loc.heading), speed: parseFloat(loc.speed), status: loc.status, updated_at: loc.updated_at } });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/location/stations
router.get('/stations', authGuard, async (req, res) => {
  try {
    const stations = await StationModel.findAll();
    return res.json({ success: true, data: stations });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
