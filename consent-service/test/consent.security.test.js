const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { ForbiddenException } = require('@nestjs/common');
const { ConsentController } = require('../src/consent/consent.controller');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.JWT_PUBLIC_KEY = publicKey.export({ type: 'pkcs1', format: 'pem' });

function authHeader(payload) {
  const token = jwt.sign(payload, privateKey.export({ type: 'pkcs1', format: 'pem' }), { algorithm: 'RS256' });
  return { authorization: 'Bearer ' + token };
}

test('consent object-level authorization', async (t) => {
  const consentService = {
    getById: async () => ({ consent_id: 'CONS-1', citizen_id: 'citizen_rahul', status: 'PENDING' }),
    respond: async () => ({ status: 'GRANTED' }),
    getHistory: async () => [{ consent_id: 'CONS-1', citizen_id: 'citizen_rahul', status: 'PENDING' }],
    validate: async () => true,
    validateForApplication: async () => true,
  };
  const controller = new ConsentController(consentService);

  await t.test('citizen cannot read another citizen pending consents', async () => {
    await assert.rejects(
      async () => controller.getPending(
        { headers: authHeader({ sub: 'u2', username: 'citizen_priya', role: 'citizen' }) },
        'citizen_rahul',
      ),
      ForbiddenException,
    );
  });

  await t.test('citizen cannot respond on another citizen consent', async () => {
    await assert.rejects(
      async () => controller.respond(
        { headers: authHeader({ sub: 'u2', username: 'citizen_priya', role: 'citizen' }) },
        'CONS-1',
        { decision: 'APPROVE', signature: 'sig' },
      ),
      ForbiddenException,
    );
  });
});
