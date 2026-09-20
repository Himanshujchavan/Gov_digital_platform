const { Injectable, OnModuleInit } = require('@nestjs/common');
const { RabbitMQClient } = require('@maha-interop/shared');
const { Exchanges } = require('@maha-interop/shared');
const axios = require('axios');
const { Logger } = require('@maha-interop/shared');

class EventListenerService {
  constructor() {
    this.rabbitMQ = new RabbitMQClient();
    this.services = {
      workflow: 'http://localhost:8006',
      mdm: 'http://localhost:8004',
      consent: 'http://localhost:8005',
      adapters: 'http://localhost:8003',
    };
  }

  async onModuleInit() {
    await this.setupListeners();
  }

  async setupListeners() {
    // 1. Listen for Consent Approved -> Trigger Workflow MDM Resolution
    await this.rabbitMQ.consume(Exchanges.CONSENT, 'consent.approved', async (msg) => {
      const { appId, citizenId } = msg;
      Logger.info(`Event [consent.approved] received for App: ${appId}. Triggering MDM Resolution.`, 'EventBus');
      
      try {
        await axios.put(`${this.services.workflow}/workflow/applications/${appId}/transition`, {
          newState: 'MDM_RESOLVED'
        });
      } catch (e) {
        Logger.error(`Failed to transition workflow for ${appId}: ${e.message}`, 'EventBus');
      }
    });

    // 2. Listen for MDM Resolved -> Trigger Data Retrieval
    await this.rabbitMQ.consume(Exchanges.MDM, 'mdm.resolved', async (msg) => {
      const { appId, masterId } = msg;
      Logger.info(`Event [mdm.resolved] received for App: ${appId}. Triggering Data Retrieval.`, 'EventBus');
      
      try {
        await axios.put(`${this.services.workflow}/workflow/applications/${appId}/transition`, {
          newState: 'DATA_RETRIEVAL'
        });
      } catch (e) {
        Logger.error(`Failed to transition workflow for ${appId}: ${e.message}`, 'EventBus');
      }
    });

    // 3. Listen for Data Retrieved -> Trigger Eligibility Check
    await this.rabbitMQ.consume(Exchanges.WORKFLOW, 'workflow.data.retrieved', async (msg) => {
      const { appId } = msg;
      Logger.info(`Event [workflow.data.retrieved] received for App: ${appId}. Triggering Eligibility Check.`, 'EventBus');
      
      try {
        await axios.put(`${this.services.workflow}/workflow/applications/${appId}/transition`, {
          newState: 'ELIGIBILITY_CHECK'
        });
      } catch (e) {
        Logger.error(`Failed to transition workflow for ${appId}: ${e.message}`, 'EventBus');
      }
    });
  }
}

module.exports = { EventListenerService };
