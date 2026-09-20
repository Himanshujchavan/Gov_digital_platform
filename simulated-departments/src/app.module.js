const { Module } = require('@nestjs/common');
const { RevenueModule } = require('./revenue/revenue.module');
const { WelfareModule } = require('./welfare/welfare.module');
const { LandModule } = require('./land/land.module');

@Module({
  imports: [RevenueModule, WelfareModule, LandModule],
})
class AppModule {}

module.exports = { AppModule };