const { Roles } = require('./constants/roles');
const { Departments } = require('./constants/departments');
const { EventTypes, Exchanges } = require('./constants/event-types');
const { WorkflowStates } = require('./constants/workflow-states');
const {
  CanonicalCitizen,
  CanonicalFinancial,
  CanonicalProperty,
} = require('./interfaces/canonical.interface');
const { ApiResponse } = require('./interfaces/api-response.interface');
const { Logger } = require('./utils/logger.util');
const { RabbitMQClient } = require('./utils/rabbitmq.util');

module.exports = {
  Roles,
  Departments,
  EventTypes,
  Exchanges,
  WorkflowStates,
  CanonicalCitizen,
  CanonicalFinancial,
  CanonicalProperty,
  ApiResponse,
  Logger,
  RabbitMQClient,
};
