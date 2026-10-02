const { Module } = require('@nestjs/common');
const { ThrottlerModule } = require('@nestjs/throttler');
const { GatewayController } = require('./proxy/gateway.controller');
const { ProxyService } = require('./proxy/proxy.service');
const { AuthMiddleware } = require('./middleware/auth.middleware');

@Module({
  imports: [
    // Global rate limiting — configurable via env vars
    ThrottlerModule.forRoot({
      ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60,
      limit: parseInt(process.env.RATE_LIMIT_GLOBAL) || 60,
    }),
  ],
  controllers: [GatewayController],
  providers: [ProxyService],
})
class GatewayModule {}

module.exports = { GatewayModule };
