const { Injectable, OnModuleInit } = require('@nestjs/common');
const { RabbitMQClient } = require('@maha-interop/shared');
const { Exchanges } = require('@maha-interop/shared');
const { Logger } = require('@maha-interop/shared');

@Injectable()
class AuditService {
  constructor() {
    this.rabbitMQ = new RabbitMQClient();
    this.auditLogs = []; // In production, this would be MongoDB
  }

  async onModuleInit() {
    await this.setupListeners();
  }

  async setupListeners() {
    // The Audit Service is a Passive Listener. 
    // It subscribes to ALL events across the platform to create an immutable trail.
    
    const eventsToMonitor = [
      { exchange: Exchanges.CONSENT, routingKey: 'consent.*' },
      { exchange: Exchanges.MDM, routingKey: 'mdm.*' },
      { exchange: Exchanges.WORKFLOW, routingKey: 'workflow.*' },
    ];

    for (const event of eventsToMonitor) {
      await this.rabbitMQ.consume(event.exchange, event.routingKey, async (msg) => {
        await this.logEvent(event.routingKey, msg);
      });
    }
  }

  async logEvent(eventType, payload) {
    const auditEntry = {
      eventId: `AUD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date(),
      eventType,
      payload,
      metadata: {
        version: '1.0',
        system: 'MAHA-INTEROP-MIDDLEWARE'
      }
    };
    
    this.auditLogs.push(auditEntry);
    Logger.info(`Audit Logged: [${eventType}] - ${auditEntry.eventId}`, 'AuditService');
  }

  getLogs(filter = {}) {
    return this.auditLogs.filter(log => {
      if (filter.type && !log.eventType.includes(filter.type)) return false;
      return true;
    });
  }

  getTrail(resourceId) {
    // Search for all events related to a specific resource (e.g., appId or citizenId)
    return this.auditLogs.filter(log => 
      JSON.stringify(log.payload).includes(resourceId)
    );
  }
}

module.exports = { AuditService };
