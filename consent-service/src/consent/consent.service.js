const { Injectable, UnauthorizedException, BadRequestException, Dependencies } = require('@nestjs/common');
const { RabbitMQClient, DbUtil, EventTypes, Exchanges, Logger } = require('@maha-interop/shared');
const axios = require('axios');

@Injectable()
class ConsentService {
  constructor() {
    this.rabbitMQ = new RabbitMQClient();
    this.db = new DbUtil();
    this.logger = new Logger('ConsentService');

    // Initialize subscriptions
    this.initSubscriptions();
  }

  async initSubscriptions() {
    try {
      await this.rabbitMQ.consume(Exchanges.CONSENT, 'consent.request', async (data) => {
        this.logger.log(`Received consent request event: ${JSON.stringify(data)}`, 'ConsentService');
        await this.createRequest(
          data.appId,
          data.citizenId,
          data.requesterDept,
          data.purpose,
          data.dataFields
        );
      });
    } catch (e) {
      this.logger.error(`Failed to initialize consent subscriptions: ${e.message}`, 'ConsentService');
    }
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    try {
      await this.db.query(
        `INSERT INTO consents (consent_id, app_id, citizen_id, requester_dept, purpose, data_fields, status, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [consentId, appId, citizenId, requesterDept, purpose, JSON.stringify(dataFields), 'PENDING', request.createdAt, request.expiresAt]
      );

      await this.rabbitMQ.publish(
        Exchanges.CONSENT,
        'consent.created',
        { consentId, citizenId, purpose }
      );

      return request;
    } catch (e) {
      this.logger.error(`Error creating consent request in DB: ${e.message}`, 'ConsentService');
      throw e;
    }
  }

  async respond(consentId, decision, citizenSignature) {
    const result = await this.db.query('SELECT * FROM consents WHERE consent_id = $1', [consentId]);
    const consent = result.rows[0];
    if (!consent) throw new Error('Consent request not found');

    const status = decision === 'APPROVE' ? 'GRANTED' : 'REJECTED';
    const respondedAt = new Date();

    try {
      await this.db.query(
        `UPDATE consents SET status = $1, responded_at = $2, signature = $3 WHERE consent_id = $4`,
        [status, respondedAt, citizenSignature, consentId]
      );

      if (decision === 'APPROVE') {
        await this.rabbitMQ.publish(Exchanges.WORKFLOW, 'workflow.transition', {
          appId: consent.app_id,
          newState: 'CONSENT_GRANTED',
          event: EventTypes.CONSENT_APPROVED
        });
      }

      const event = decision === 'APPROVE' ? 'consent.approved' : 'consent.rejected';
      await this.rabbitMQ.publish(
        Exchanges.CONSENT,
        event,
        { consentId, citizenId: consent.citizen_id, status: status }
      );

      return { ...consent, status, respondedAt };
    } catch (e) {
      this.logger.error(`Error updating consent response in DB: ${e.message}`, 'ConsentService');
      throw e;
    }
  }

  async revoke(consentId) {
    const result = await this.db.query('SELECT * FROM consents WHERE consent_id = $1', [consentId]);
    const consent = result.rows[0];
    if (!consent) throw new Error('Consent not found');

    try {
      await this.db.query(
        `UPDATE consents SET status = 'REVOKED', revoked_at = NOW() WHERE consent_id = $1`,
        [consentId]
      );

      await this.rabbitMQ.publish(
        Exchanges.CONSENT,
        'consent.revoked',
        { consentId, citizenId: consent.citizen_id }
      );

      return { ...consent, status: 'REVOKED' };
    } catch (e) {
      this.logger.error(`Error revoking consent in DB: ${e.message}`, 'ConsentService');
      throw e;
    }
  }

  async validate(citizenId, deptId, dataField) {
    const result = await this.db.query(
      `SELECT * FROM consents WHERE citizen_id = $1 AND requester_dept = $2 AND status = 'GRANTED' AND expires_at > NOW() AND data_fields @> $3`,
      [citizenId, deptId, JSON.stringify([dataField])]
    );
    return result.rowCount > 0;
  }

  getHistory(citizenId) {
    // This needs to be async now
    return this.db.query('SELECT * FROM consents WHERE citizen_id = $1', [citizenId])
      .then(res => res.rows);
  }
}

module.exports = { ConsentService };
