// Modelo Station — MySQL async
const { getPool } = require('../config/database');

class StationModel {
  static async findAll() {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM stations ORDER BY name');
    return rows;
  }
}

module.exports = StationModel;
