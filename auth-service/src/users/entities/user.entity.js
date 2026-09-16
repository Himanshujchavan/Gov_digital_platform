class User {
  constructor({
    id,
    username,
    passwordHash,
    fullName,
    email,
    role = 'citizen',
    department = null,
    createdAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.fullName = fullName;
    this.email = email;
    this.role = role;
    this.department = department;
    this.createdAt = createdAt;
  }

  toJSON() {
    const { passwordHash, ...safeUser } = this;
    return safeUser;
  }
}

module.exports = { User };
