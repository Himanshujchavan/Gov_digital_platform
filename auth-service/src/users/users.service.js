const { Injectable } = require('@nestjs/common');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User } = require('./entities/user.entity');
const { Roles, DbUtil } = require('@maha-interop/shared');
const { Logger } = require('@maha-interop/shared');

@Injectable()
class UsersService {
  constructor() {
    this.db = new DbUtil();
    this.logger = new Logger('UsersService');
    this.initDb();
  }

  async initDb() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL,
          department TEXT
        );
      `);
      this.logger.log('Users table initialized', 'UsersService');
      await this._seedUsers();
    } catch (e) {
      this.logger.error(`Failed to initialize users table: ${e.message}`, 'UsersService');
    }
  }

  async _seedUsers() {
    // SECURITY: Never seed default users in production
    if (process.env.NODE_ENV === 'production') {
      this.logger.log('Skipping seed data in production environment', 'UsersService');
      return;
    }

    const seedPassword = process.env.SEED_DEFAULT_PASSWORD || 'Dev_P@ssw0rd_2026!';
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const defaultPasswordHash = await bcrypt.hash(seedPassword, saltRounds);

    const seedData = [
      { id: 'usr-cit-001', username: 'citizen_rahul', fullName: 'Rahul Sharma', email: 'rahul.sharma@example.gov.in', role: Roles.CITIZEN, department: null },
      { id: 'usr-cit-002', username: 'citizen_priya', fullName: 'Priya Patil', email: 'priya.patil@example.gov.in', role: Roles.CITIZEN, department: null },
      { id: 'usr-off-001', username: 'officer_revenue', fullName: 'Suresh Deshmukh', email: 'suresh.deshmukh@maha.gov.in', role: Roles.OFFICER, department: 'revenue' },
      { id: 'usr-off-002', username: 'officer_education', fullName: 'Anjali Kulkarni', email: 'anjali.kulkarni@maha.gov.in', role: Roles.OFFICER, department: 'education' },
      { id: 'usr-adm-001', username: 'admin_user', fullName: 'System Administrator', email: 'admin.interop@maha.gov.in', role: Roles.ADMIN, department: null },
    ];

    for (const user of seedData) {
      try {
        await this.db.query(
          `INSERT INTO users (id, username, password_hash, full_name, email, role, department)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (username) DO NOTHING`,
          [user.id, user.username, defaultPasswordHash, user.fullName, user.email, user.role, user.department]
        );
      } catch (e) {
        this.logger.error(`Error seeding user ${user.username}: ${e.message}`, 'UsersService');
      }
    }
  }

  async findByUsername(username) {
    const result = await this.db.query('SELECT * FROM users WHERE username = $1', [username]);
    const row = result.rows[0];
    if (!row) return null;

    return new User({
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      department: row.department,
    });
  }

  async findById(id) {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    const row = result.rows[0];
    if (!row) return null;

    return new User({
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      department: row.department,
    });
  }

  async createUser({ username, password, fullName, email, role = Roles.CITIZEN, department = null }) {
    if (await this.findByUsername(username)) {
      throw new Error(`Username ${username} is already taken`);
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const id = `usr-${uuidv4().substring(0, 8)}`;

    await this.db.query(
      `INSERT INTO users (id, username, password_hash, full_name, email, role, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, username, passwordHash, fullName, email, role, department]
    );

    return {
      id,
      username,
      fullName,
      email,
      role,
      department,
    };
  }

  async getAllUsers() {
    const result = await this.db.query('SELECT * FROM users');
    return result.rows.map(row => ({
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      department: row.department,
    }));
  }
}

module.exports = { UsersService };
