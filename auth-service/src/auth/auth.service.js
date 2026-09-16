const { Injectable, UnauthorizedException, BadRequestException, Dependencies } = require('@nestjs/common');
const { JwtService } = require('@nestjs/jwt');
const bcrypt = require('bcrypt');
const { UsersService } = require('../users/users.service');

@Injectable()
@Dependencies(UsersService, JwtService)
class AuthService {
  constructor(usersService, jwtService) {
    this.usersService = usersService;
    this.jwtService = jwtService;
  }

  async validateUser(username, password) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (isPasswordValid) {
      return user;
    }
    return null;
  }

  async login(loginDto) {
    const { username, password } = loginDto;
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    };
  }

  async register(registerDto) {
    const { username, password, fullName, email, role, department } = registerDto;
    if (!username || !password || !fullName || !email) {
      throw new BadRequestException('username, password, fullName, and email are required');
    }

    try {
      const newUser = await this.usersService.createUser({
        username,
        password,
        fullName,
        email,
        role,
        department,
      });

      return newUser;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const decoded = this.jwtService.verify(refreshToken);
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const payload = {
        sub: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
      };

      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      });

      return {
        accessToken: newAccessToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}

module.exports = { AuthService };
