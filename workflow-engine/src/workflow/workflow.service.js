const { RabbitMQClient } = require('@maha-interop/shared');
const { EventTypes, Exchanges } = require('@maha-interop/shared');
const { WorkflowStates } = require('@maha-interop/shared');
const axios = require('axios');
const { Logger } = require('@maha-interop/shared');

class WorkflowService {
  constructor() {
    this.rabbitMQ = new RabbitMQClient();
    this.applications = new Map(); // In production, this would be PostgreSQL

    // Use env vars for direct service communication
    this.services = {
      mdm: process.env.MDM_SERVICE_URL || 'http://mdm-service:8004',
      adapters: process.env.ADAPTERS_SERVICE_URL || 'http://adapters:8003',
      consent: process.env.CONSENT_SERVICE_URL || 'http://consent-service:8005',
    };
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
        try {
          Logger.info(`Triggering Consent Request for App: ${appId}`, 'WorkflowService');
          await axios.post(`${this.services.consent}/consent/request`, {
            appId,
            citizenId: app.citizenId,
            requesterDept: 'Gov-Platform',
            purpose: `Application for ${app.schemeId}`,
            dataFields: app.requestedData
          });
        } catch (e) {
          Logger.error(`Failed to request consent for ${appId}: ${e.message}`, 'WorkflowService');
        }
        break;

      case WorkflowStates.CONSENT_GRANTED:
        try {
          Logger.info(`Triggering MDM Resolution for App: ${appId}`, 'WorkflowService');
          const citizen = app.requestedData?.citizen || {};
          const { data } = await axios.post(`${this.services.mdm}/mdm/resolve`, {
            name: citizen.name, dob: citizen.dob, address: citizen.address, phone: citizen.phone,
          });
          app.masterId = data.master_id;
          app.mdmConfidence = data.confidence;
          await this.transition(appId, WorkflowStates.MDM_RESOLUTION);
        } catch (e) {
          Logger.error(`MDM resolution failed for ${appId}: ${e.message}`, 'WorkflowService');
        }
        break;

      case WorkflowStates.MDM_RESOLUTION:
        try {
          Logger.info(`Triggering Data Retrieval for App: ${appId}`, 'WorkflowService');
          const { data } = await axios.post(`${this.services.adapters}/adapters/transform`, {
            masterId: app.masterId,
            department: 'revenue',
            data: {}
          });
          app.data = data;
          await this.transition(appId, WorkflowStates.DATA_RETRIEVAL);
        } catch (e) {
          Logger.error(`Data retrieval failed for ${appId}: ${e.message}`, 'WorkflowService');
        }
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
