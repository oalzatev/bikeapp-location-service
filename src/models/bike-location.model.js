// Modelo BikeLocation — MySQL async
const { getPool } = require('../config/database');

class BikeLocationModel {
  static async findByBikeId(bikeId) {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM bike_locations WHERE bike_id = ?', [bikeId]);
    return rows[0] || null;
  }

  static async initLocation(bikeId, status = 'available') {
    const pool = getPool();
    const lat = 6.1600 + Math.random() * 0.1900;
    const lng = -75.6200 + Math.random() * 0.0700;
    await pool.execute(
      'INSERT INTO bike_locations (bike_id, lat, lng, heading, speed, status) VALUES (?, ?, ?, 0, 0, ?) ON DUPLICATE KEY UPDATE lat=VALUES(lat), lng=VALUES(lng), status=VALUES(status)',
      [bikeId, lat, lng, status]
    );
    return BikeLocationModel.findByBikeId(bikeId);
  }

  static async updateLocation(bikeId, status = 'available') {
    const pool = getPool();
    let loc = await BikeLocationModel.findByBikeId(bikeId);
    if (!loc) loc = await BikeLocationModel.initLocation(bikeId, status);

    if (status !== 'in_use') {
      await pool.execute('UPDATE bike_locations SET status=?, updated_at=NOW() WHERE bike_id=?', [status, bikeId]);
    } else {
      const delta   = 0.0001;
      const newLat  = parseFloat(loc.lat) + (Math.random() - 0.5) * delta;
      const newLng  = parseFloat(loc.lng) + (Math.random() - 0.5) * delta;
      const heading = Math.random() * 360;
      const speed   = 8 + Math.random() * 12;
      await pool.execute(
        'UPDATE bike_locations SET lat=?, lng=?, heading=?, speed=?, status=?, updated_at=NOW() WHERE bike_id=?',
        [newLat, newLng, heading, speed, status, bikeId]
      );
    }
    return BikeLocationModel.findByBikeId(bikeId);
  }

  static async syncStatus(bikeId, status) {
    const pool = getPool();
    const exists = await BikeLocationModel.findByBikeId(bikeId);
    if (!exists) {
      await BikeLocationModel.initLocation(bikeId, status);
    } else {
      await pool.execute('UPDATE bike_locations SET status=? WHERE bike_id=?', [status, bikeId]);
    }
  }
}

module.exports = BikeLocationModel;
