const { Module } = require('@nestjs/common');
const { GatewayController } = require('./proxy/gateway.controller');
const { ProxyService } = require('./proxy/proxy.service');
const { AuthMiddleware } = require('./middleware/auth.middleware');

@Module({
  controllers: [GatewayController],
  providers: [ProxyService],
})
class GatewayModule {}

module.exports = { GatewayModule };
