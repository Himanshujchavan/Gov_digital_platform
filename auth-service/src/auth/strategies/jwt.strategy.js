const { Injectable, UnauthorizedException, Dependencies } = require('@nestjs/common');
const { PassportStrategy } = require('@nestjs/passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const { UsersService } = require('../../users/users.service');

@Injectable()
@Dependencies(UsersService)
class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(usersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || (() => {
        throw new Error('FATAL ERROR: JWT_SECRET environment variable is not defined. The application cannot start without a secure secret.');
      })(),
    });
    this.usersService = usersService;
  }

  async validate(payload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
    };
  }
}

module.exports = { JwtStrategy };
