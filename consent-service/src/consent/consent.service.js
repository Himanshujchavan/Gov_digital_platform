const { Injectable } = require('@nestjs/common');
const { RabbitMQClient } = require('@maha-interop/shared');
const { EventTypes, Exchanges } = require('@maha-interop/shared');
const axios = require('axios');
const { Logger } = require('@maha-interop/shared');

const WORKFLOW_URL = process.env.WORKFLOW_SERVICE_URL || 'http://workflow-engine:8006';

@Injectable()
class ConsentService {

  constructor() {
    this.rabbitMQ = new RabbitMQClient();
    this.consents = new Map(); // In production, this would be PostgreSQL
    this.auditLog = []; // In production, this would be MongoDB
  }

  async createRequest(appId, citizenId, requesterDept, purpose, dataFields) {
    const consentId = `CONS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const request = {
      consentId,
      appId,
      citizenId,
      requesterDept,
      purpose,
      dataFields,
      status: 'PENDING',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days TTL
    };
    
    this.consents.set(consentId, request);
    
    // Publish event to RabbitMQ
    await this.rabbitMQ.publish(
      Exchanges.CONSENT, 
      'consent.created', 
      { consentId, citizenId, purpose }
    );
    
    return request;
  }

  async respond(consentId, decision, citizenSignature) {
    const consent = this.consents.get(consentId);
    if (!consent) throw new Error('Consent request not found');

    consent.status = decision === 'APPROVE' ? 'GRANTED' : 'REJECTED';
    consent.respondedAt = new Date();
    consent.signature = citizenSignature;

    this.consents.set(consentId, consent);

    if (decision === 'APPROVE') {
      try {
        await axios.put(`${WORKFLOW_URL}/workflow/transition/${consent.appId || consentId}`, {
          newState: 'CONSENT_GRANTED',
        });
      } catch (e) {
        Logger.error(`Failed to notify workflow of consent approval: ${e.message}`, 'ConsentService');
      }
    }

    // Publish event
    const event = decision === 'APPROVE' ? 'consent.approved' : 'consent.rejected';
    await this.rabbitMQ.publish(
      Exchanges.CONSENT,
      event,
      { consentId, citizenId: consent.citizenId, status: consent.status }
    );

    return consent;
  }

  async revoke(consentId) {
    const consent = this.consents.get(consentId);
    if (!consent) throw new Error('Consent not found');
    
    consent.status = 'REVOKED';
    consent.revokedAt = new Date();
    
    this.consents.set(consentId, consent);
    
    await this.rabbitMQ.publish(
      Exchanges.CONSENT, 
      'consent.revoked', 
      { consentId, citizenId: consent.citizenId }
    );
    
    return consent;
  }

  async validate(citizenId, deptId, dataField) {
    const activeConsent = Array.from(this.consents.values()).find(c => 
      c.citizenId === citizenId && 
      c.requesterDept === deptId && 
      c.status === 'GRANTED' && 
      c.expiresAt > new Date() &&
      c.dataFields.includes(dataField)
    );
    
    return !!activeConsent;
  }

  getHistory(citizenId) {
    return Array.from(this.consents.values()).filter(c => c.citizenId === citizenId);
  }
}

module.exports = { ConsentService };
