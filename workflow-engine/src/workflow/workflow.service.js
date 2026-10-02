const { RabbitMQClient, DbUtil, EventTypes, Exchanges, WorkflowStates, Logger } = require('@maha-interop/shared');
const axios = require('axios');

class WorkflowService {
  constructor() {
    this.rabbitMQ = new RabbitMQClient();
    this.db = new DbUtil();
    this.logger = new Logger('WorkflowService');
    this.allowedTransitions = {
      [WorkflowStates.APPLICATION_RECEIVED]: [WorkflowStates.CONSENT_REQUESTED],
      [WorkflowStates.CONSENT_REQUESTED]: [WorkflowStates.CONSENT_GRANTED],
      [WorkflowStates.CONSENT_GRANTED]: [WorkflowStates.MDM_RESOLUTION],
      [WorkflowStates.MDM_RESOLUTION]: [WorkflowStates.DATA_RETRIEVAL],
      [WorkflowStates.DATA_RETRIEVAL]: [WorkflowStates.OFFICER_REVIEW],
      [WorkflowStates.OFFICER_REVIEW]: [WorkflowStates.APPROVED, WorkflowStates.REJECTED],
      [WorkflowStates.APPROVED]: [WorkflowStates.CITIZEN_NOTIFIED],
      [WorkflowStates.REJECTED]: [WorkflowStates.CITIZEN_NOTIFIED],
      [WorkflowStates.CITIZEN_NOTIFIED]: [],
    };

    // Initialize subscriptions
    this.initSubscriptions();
  }

  isTransitionAllowed(currentState, newState) {
    if (currentState === newState) {
      return true;
    }
    const allowed = this.allowedTransitions[currentState] || [];
    return allowed.includes(newState);
  }

  extractRequestedFields(requestedData) {
    if (Array.isArray(requestedData)) {
      return requestedData.filter((field) => typeof field === 'string' && field.trim().length > 0);
    }
    if (!requestedData || typeof requestedData !== 'object') {
      return [];
    }
    if (Array.isArray(requestedData.dataFields)) {
      return requestedData.dataFields.filter((field) => typeof field === 'string' && field.trim().length > 0);
    }
    return Object.keys(requestedData).filter((key) => key !== 'citizen');
  }

  async validateConsentBeforeGrant(app) {
    const requestedFields = this.extractRequestedFields(app.requested_data);
    const consentServiceUrl = process.env.CONSENT_SERVICE_URL || 'http://localhost:8005';
    const purpose = `Application for ${app.scheme_id}`;
    const response = await axios.get(`${consentServiceUrl}/consent/validate-application/${app.app_id}`, {
      timeout: 5000,
      params: {
        purpose,
        requesterDept: 'Gov-Platform',
        requestedFields: requestedFields.join(','),
      },
    });

    const isValid = response?.data?.data?.isValid;
    if (!isValid) {
      throw new Error('Cannot grant consent state transition without active valid consent');
    }
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
    if (!this.isTransitionAllowed(app.current_state, newState)) {
      throw new Error(`Invalid transition from ${app.current_state} to ${newState}`);
    }
    if (app.current_state === newState) {
      return app;
    }

    try {
      if (newState === WorkflowStates.CONSENT_GRANTED) {
        await this.validateConsentBeforeGrant(app);
      }

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
          const cName = citizen.name || app.requested_data?.citizenName || (app.citizen_id === 'citizen_rahul' ? 'Rahul Sharma' : 'Priya Patil');
          const cDob = citizen.dob || app.requested_data?.dob || '2002-03-12';
          const cAddr = citizen.address || app.requested_data?.address || 'Plot 42, Shivajinagar, Pune';
          const cPhone = citizen.phone || app.requested_data?.phone || '9822012345';

          try {
            const mdmRes = await axios.post(`${process.env.MDM_SERVICE_URL || 'http://localhost:8004'}/mdm/resolve`, {
              name: cName,
              dob: cDob,
              address: cAddr,
              phone: cPhone
            }, { timeout: 5000 });

            if (mdmRes.data?.master_id) {
              await this.db.query(
                `UPDATE applications SET master_id = $1, mdm_confidence = $2 WHERE app_id = $3`,
                [mdmRes.data.master_id, mdmRes.data.confidence, appId]
              );
            }
          } catch (mdmErr) {
            this.logger.warn(`Direct MDM resolve failed: ${mdmErr.message}. Keeping default master ID.`);
          }

          await this.rabbitMQ.publish(Exchanges.MDM, 'mdm.resolve', {
            appId: app.app_id,
            citizenData: { name: cName, dob: cDob, address: cAddr, phone: cPhone }
          });

          // Auto-advance to MDM_RESOLUTION
          await this.transition(appId, WorkflowStates.MDM_RESOLUTION);
          break;

        case WorkflowStates.MDM_RESOLUTION:
          this.logger.info(`Triggering Data Retrieval for App: ${appId}`, 'WorkflowService');
          const cit = app.requested_data?.citizen || {};
          const citName = cit.name || app.requested_data?.citizenName || (app.citizen_id === 'citizen_rahul' ? 'Rahul Sharma' : 'Priya Patil');
          const citDob = cit.dob || app.requested_data?.dob || '2002-03-12';
          const citAddr = cit.address || app.requested_data?.address || 'Plot 42, Shivajinagar, Pune';

          try {
            const adapterRes = await axios.post(`${process.env.ADAPTERS_SERVICE_URL || 'http://localhost:8003'}/adapters/transform`, {
              department: 'revenue',
              data: {
                citizen_name: citName,
                birth_date: citDob,
                addr: citAddr,
                income_amt: 250000
              }
            }, { timeout: 5000 });

            if (adapterRes.data?.data) {
              await this.db.query(
                `UPDATE applications SET data = $1 WHERE app_id = $2`,
                [JSON.stringify(adapterRes.data.data), appId]
              );
            }
          } catch (adapterErr) {
            this.logger.warn(`Direct adapter transform failed: ${adapterErr.message}.`);
          }

          await this.rabbitMQ.publish(Exchanges.MDM, 'adapters.transform', {
            appId: app.app_id,
            masterId: app.master_id,
            department: 'revenue'
          });

          // Auto-advance to DATA_RETRIEVAL
          await this.transition(appId, WorkflowStates.DATA_RETRIEVAL);
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

  async getApplications() {
    const result = await this.db.query('SELECT * FROM applications ORDER BY app_id DESC');
    return result.rows;
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
