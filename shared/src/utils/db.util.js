const { Pool } = require('pg');
const { Logger } = require('./logger.util');

class DbUtil {
  constructor() {
    this.pool = new Pool({
      user: process.env.POSTGRES_USER || 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      database: process.env.POSTGRES_DB || 'maha_interop',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      port: process.env.POSTGRES_PORT || 5432,
    });
    this.logger = new Logger('DbUtil');
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      this.logger.log(`Executed query in ${duration}ms`, { text });
      return res;
    } catch (error) {
      this.logger.error('Database query error:', error.message);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = { DbUtil };
