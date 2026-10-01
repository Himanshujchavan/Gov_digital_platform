const { RabbitMQClient, DbUtil, EventTypes, Exchanges, WorkflowStates, Logger } = require('@maha-interop/shared');
const axios = require('axios');

class WorkflowService {
  constructor() {
    this.rabbitMQ = new RabbitMQClient();
    this.db = new DbUtil();
    this.logger = new Logger('WorkflowService');

    // Initialize subscriptions
    this.initSubscriptions();
  }

  async initSubscriptions() {
    try {
      // Listen for consent approval to trigger transition
      await this.rabbitMQ.consume(Exchanges.CONSENT, 'consent.approved', async (data) => {
        this.logger.log(`Received consent approved event for App: ${data.appId}`, 'WorkflowService');
        await this.transitionByEvent({ appId: data.appId, newState: WorkflowStates.CONSENT_GRANTED });
      });

      // Listen for general workflow transitions triggered by other services
      await this.rabbitMQ.consume(Exchanges.WORKFLOW, 'workflow.transition', async (data) => {
        this.logger.log(`Received workflow transition request: ${JSON.stringify(data)}`, 'WorkflowService');
        await this.transitionByEvent(data);
      });
    } catch (e) {
      this.logger.error(`Failed to initialize workflow subscriptions: ${e.message}`, 'WorkflowService');
    }
  }

  async submitApplication(citizenId, schemeId, requestedData) {
    const appId = `APP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const application = {
      appId,
      citizenId,
      schemeId,
      requestedData,
      currentState: WorkflowStates.APPLICATION_RECEIVED,
      history: [{ state: WorkflowStates.APPLICATION_RECEIVED, timestamp: new Date() }],
      data: {},
      status: 'PROCESSING',
    };

    try {
      await this.db.query(
        `INSERT INTO applications (app_id, citizen_id, scheme_id, requested_data, current_state, status, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [appId, citizenId, schemeId, JSON.stringify(requestedData), WorkflowStates.APPLICATION_RECEIVED, 'PROCESSING', JSON.stringify({})]
      );

      await this.db.query(
        `INSERT INTO application_history (app_id, state, timestamp) VALUES ($1, $2, $3)`,
        [appId, WorkflowStates.APPLICATION_RECEIVED, new Date()]
      );

      // Trigger first transition: Move to CONSENT_REQUESTED
      await this.transition(appId, WorkflowStates.CONSENT_REQUESTED);

      return application;
    } catch (e) {
      this.logger.error(`Error submitting application in DB: ${e.message}`, 'WorkflowService');
      throw e;
    }
  }

  async transition(appId, newState) {
    const result = await this.db.query('SELECT * FROM applications WHERE app_id = $1', [appId]);
    const app = result.rows[0];
    if (!app) throw new Error('Application not found');

    try {
      await this.db.query(
        `UPDATE applications SET current_state = $1 WHERE app_id = $2`,
        [newState, appId]
      );
      await this.db.query(
        `INSERT INTO application_history (app_id, state, timestamp) VALUES ($1, $2, $3)`,
        [appId, newState, new Date()]
      );

      // Event-Driven Orchestration: Publish event to trigger the next service
      switch (newState) {
        case WorkflowStates.CONSENT_REQUESTED:
          this.logger.info(`Triggering Consent Request for App: ${appId}`, 'WorkflowService');
          await this.rabbitMQ.publish(Exchanges.CONSENT, 'consent.request', {
            appId: app.app_id,
            citizenId: app.citizen_id,
            requesterDept: 'Gov-Platform',
            purpose: `Application for ${app.scheme_id}`,
            dataFields: app.requested_data
          });
          break;

        case WorkflowStates.CONSENT_GRANTED:
          this.logger.info(`Triggering MDM Resolution for App: ${appId}`, 'WorkflowService');
          const citizen = app.requested_data?.citizen || {};
          // Note: In a real system, we'd publish to MDM exchange and listen for mdm.resolved
          // For now, we maintain a publish to trigger the resolve process
          await this.rabbitMQ.publish(Exchanges.MDM, 'mdm.resolve', {
            appId: app.app_id,
            citizenData: {
              name: citizen.name,
              dob: citizen.dob,
              address: citizen.address,
              phone: citizen.phone
            }
          });
          break;

        case WorkflowStates.MDM_RESOLUTION:
          this.logger.info(`Triggering Data Retrieval for App: ${appId}`, 'WorkflowService');
          await this.rabbitMQ.publish(Exchanges.MDM, 'adapters.transform', {
            appId: app.app_id,
            masterId: app.master_id,
            department: 'revenue',
            data: {}
          });
          break;

        case WorkflowStates.DATA_RETRIEVAL:
          await this.processEligibility(appId);
          break;
      }
    } catch (e) {
      this.logger.error(`Error during transition for ${appId}: ${e.message}`, 'WorkflowService');
      throw e;
    }
  }

  async processEligibility(appId) {
    await this.transition(appId, WorkflowStates.OFFICER_REVIEW);
  }

  async getApplication(appId) {
    const result = await this.db.query('SELECT * FROM applications WHERE app_id = $1', [appId]);
    return result.rows[0];
  }

  async getPendingReviews(departmentFilter) {
    const result = await this.db.query(
      `SELECT * FROM applications WHERE current_state = $1`,
      [WorkflowStates.OFFICER_REVIEW]
    );
    const apps = result.rows;

    const list = apps.map(app => ({
      id: app.app_id,
      citizenId: app.citizen_id,
      applicantName: app.requested_data?.citizenName || (app.citizen_id === 'citizen_rahul' ? 'Rahul Sharma' : 'Priya Patil'),
      masterCitizenId: app.master_id || 'MC-10024',
      schemeName: app.requested_data?.schemeName || 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna',
      department: app.requested_data?.department || 'education',
      retrievedIncome: app.data?.financial?.annualIncome || 180000,
      eligibilityResult: 'PASS',
      eligibilityReason: 'Income ≤ ₹8,00,000 ceiling',
      matchConfidence: app.mdm_confidence || 0.982,
      createdAt: '2026-09-26T00:00:00Z',
      currentState: app.current_state,
    }));

    if (departmentFilter && departmentFilter !== 'all') {
      return list.filter(item => item.department.toLowerCase() === departmentFilter.toLowerCase());
    }
    return list;
  }

  async transitionByEvent(eventData) {
    const { appId, newState } = eventData;
    await this.transition(appId, newState);
  }
}

module.exports = { WorkflowService };
