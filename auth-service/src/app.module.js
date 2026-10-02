const { Module } = require('@nestjs/common');
const { ThrottlerModule } = require('@nestjs/throttler');
const { AuthModule } = require('./auth/auth.module');
const { UsersModule } = require('./users/users.module');

@Module({
  imports: [
    // Global rate limiting — configurable via env vars
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60,
        limit: parseInt(process.env.RATE_LIMIT_GLOBAL) || 60,
      }],
    }),
    AuthModule,
    UsersModule,
  ],
})
class AppModule {}

module.exports = { AppModule };
