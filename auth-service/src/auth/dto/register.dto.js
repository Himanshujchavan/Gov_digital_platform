class RegisterDto {
  constructor({
    username = '',
    password = '',
    fullName = '',
    email = '',
    role = 'citizen',
    department = null,
  } = {}) {
    this.username = username;
    this.password = password;
    this.fullName = fullName;
    this.email = email;
    this.role = role;
    this.department = department;
  }
}

module.exports = { RegisterDto };
