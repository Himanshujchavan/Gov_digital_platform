const { RabbitMQClient } = require('@maha-interop/shared');
const { EventTypes, Exchanges } = require('@maha-interop/shared');
const { WorkflowStates } = require('@maha-interop/shared');

class WorkflowService {
  constructor() {
    this.rabbitMQ = new RabbitMQClient();
    this.applications = new Map(); // In production, this would be PostgreSQL
  }
// ...existing code...

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
    
    this.applications.set(appId, application);
    
    // Trigger first transition: Move to CONSENT_REQUESTED
    await this.transition(appId, WorkflowStates.CONSENT_REQUESTED);
    
    return application;
  }

  async transition(appId, newState) {
    const app = this.applications.get(appId);
    if (!app) throw new Error('Application not found');
    
    app.currentState = newState;
    app.history.push({ state: newState, timestamp: new Date() });
    
    // Event-Driven Orchestration: Publish event to trigger the next service
    switch (newState) {
      case WorkflowStates.CONSENT_REQUESTED:
        await this.rabbitMQ.publish(Exchanges.CONSENT, 'consent.request', {
          appId,
          citizenId: app.citizenId,
          purpose: `Application for ${app.schemeId}`,
          dataFields: app.requestedData
        });
        break;
        
      case WorkflowStates.CONSENT_GRANTED:
        // Trigger MDM Resolution
        await this.rabbitMQ.publish(Exchanges.MDM, 'mdm.resolve', {
          appId,
          citizenId: app.citizenId
        });
        break;
        
      case WorkflowStates.MDM_RESOLUTION:
        // Trigger Data Retrieval via Adapters
        await this.rabbitMQ.publish(Exchanges.WORKFLOW, 'workflow.data.retrieve', {
          appId,
          masterId: app.masterId
        });
        break;
        
      case WorkflowStates.DATA_RETRIEVAL:
        // Trigger Eligibility Check
        await this.processEligibility(appId);
        break;
    }
    
    this.applications.set(appId, app);
  }

  async processEligibility(appId) {
    const app = this.applications.get(appId);
    // Transition to Officer Review and STOP.
    // The workflow now waits for an external call to the review endpoint.
    await this.transition(appId, WorkflowStates.OFFICER_REVIEW);
  }

  getApplication(appId) {
    return this.applications.get(appId);
  }

  getPendingReviews() {
    return Array.from(this.applications.values()).filter(a => a.currentState === 'OFFICER_REVIEW');
  }

  // Public transition endpoint to allow the Event Bus to trigger state changes
  async transitionByEvent(eventData) {
    const { appId, newState } = eventData;
    await this.transition(appId, newState);
  }
}

module.exports = { WorkflowService };
