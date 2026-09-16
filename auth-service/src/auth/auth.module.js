const { Module } = require('@nestjs/common');
const { JwtModule } = require('@nestjs/jwt');
const { PassportModule } = require('@nestjs/passport');
const { AuthService } = require('./auth.service');
const { AuthController } = require('./auth.controller');
const { JwtStrategy } = require('./strategies/jwt.strategy');
const { UsersModule } = require('../users/users.module');

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'maha_gov_interop_super_secret_jwt_key_2026',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
class AuthModule {}

module.exports = { AuthModule };
