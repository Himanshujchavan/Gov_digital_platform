const { Module } = require('@nestjs/common');
const { EventListenerService } = require('./event-listener.service');

@Module({
  providers: [EventListenerService],
})
class EventBusModule {}

module.exports = { EventBusModule };
