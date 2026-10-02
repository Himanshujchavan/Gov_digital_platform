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
      // Use asymmetric RSA public key for verification
      secretOrKey: process.env.JWT_PUBLIC_KEY || (() => {
        throw new Error('FATAL ERROR: JWT_PUBLIC_KEY environment variable is not defined.');
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
