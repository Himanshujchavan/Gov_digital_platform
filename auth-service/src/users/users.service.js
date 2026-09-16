const { Injectable } = require('@nestjs/common');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User } = require('./entities/user.entity');
const { Roles } = require('@maha-interop/shared');

@Injectable()
class UsersService {
  constructor() {
    this.users = new Map();
    this._seedUsers();
  }

  async _seedUsers() {
    const saltRounds = 10;
    const defaultPasswordHash = await bcrypt.hash('password123', saltRounds);

    const seedData = [
      {
        id: 'usr-cit-001',
        username: 'citizen_rahul',
        passwordHash: defaultPasswordHash,
        fullName: 'Rahul Sharma',
        email: 'rahul.sharma@example.gov.in',
        role: Roles.CITIZEN,
        department: null,
      },
      {
        id: 'usr-cit-002',
        username: 'citizen_priya',
        passwordHash: defaultPasswordHash,
        fullName: 'Priya Patil',
        email: 'priya.patil@example.gov.in',
        role: Roles.CITIZEN,
        department: null,
      },
      {
        id: 'usr-off-001',
        username: 'officer_revenue',
        passwordHash: defaultPasswordHash,
        fullName: 'Suresh Deshmukh',
        email: 'suresh.deshmukh@maha.gov.in',
        role: Roles.OFFICER,
        department: 'revenue',
      },
      {
        id: 'usr-off-002',
        username: 'officer_education',
        passwordHash: defaultPasswordHash,
        fullName: 'Anjali Kulkarni',
        email: 'anjali.kulkarni@maha.gov.in',
        role: Roles.OFFICER,
        department: 'education',
      },
      {
        id: 'usr-adm-001',
        username: 'admin_user',
        passwordHash: defaultPasswordHash,
        fullName: 'System Administrator',
        email: 'admin.interop@maha.gov.in',
        role: Roles.ADMIN,
        department: null,
      },
    ];

    for (const data of seedData) {
      this.users.set(data.username, new User(data));
    }
  }

  async findByUsername(username) {
    return this.users.get(username) || null;
  }

  async findById(id) {
    for (const user of this.users.values()) {
      if (user.id === id) {
        return user;
      }
    }
    return null;
  }

  async createUser({ username, password, fullName, email, role = Roles.CITIZEN, department = null }) {
    if (this.users.has(username)) {
      throw new Error(`Username ${username} is already taken`);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const id = `usr-${uuidv4().substring(0, 8)}`;

    const newUser = new User({
      id,
      username,
      passwordHash,
      fullName,
      email,
      role,
      department,
    });

    this.users.set(username, newUser);
    return newUser.toJSON();
  }

  async getAllUsers() {
    return Array.from(this.users.values()).map((user) => user.toJSON());
  }
}

module.exports = { UsersService };
