const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { ForbiddenException } = require('@nestjs/common');
const { WorkflowController } = require('../src/workflow/workflow.controller');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.JWT_PUBLIC_KEY = publicKey.export({ type: 'pkcs1', format: 'pem' });

function authHeader(payload) {
  const token = jwt.sign(payload, privateKey.export({ type: 'pkcs1', format: 'pem' }), { algorithm: 'RS256' });
  return { authorization: 'Bearer ' + token };
}

test('workflow authorization protections', async (t) => {
  const workflowService = {
    submitApplication: async (citizenId, schemeId, requestedData) => ({ citizenId, schemeId, requestedData }),
    getApplication: async () => ({
      app_id: 'APP-1',
      citizen_id: 'citizen_rahul',
      current_state: 'OFFICER_REVIEW',
      requested_data: { department: 'education' },
    }),
    transition: async () => ({}),
  };

  const controller = new WorkflowController(workflowService);

  await t.test('citizen cannot submit for another citizen', async () => {
    await assert.rejects(
      async () => controller.submit(
        { headers: authHeader({ sub: 'u1', username: 'citizen_rahul', role: 'citizen' }) },
        { citizenId: 'citizen_priya', schemeId: 'SCH-1', requestedData: [] },
      ),
      ForbiddenException,
    );
  });

  await t.test('citizen cannot read another citizen application', async () => {
    await assert.rejects(
      async () => controller.getApplicationById(
        { headers: authHeader({ sub: 'u2', username: 'citizen_priya', role: 'citizen' }) },
        'APP-1',
      ),
      ForbiddenException,
    );
  });

  await t.test('officer cannot force arbitrary transition', async () => {
    await assert.rejects(
      async () => controller.transition(
        { headers: authHeader({ sub: 'o1', username: 'officer_education', role: 'officer', department: 'education' }) },
        'APP-1',
        { newState: 'MDM_RESOLUTION' },
      ),
      ForbiddenException,
    );
  });
});
