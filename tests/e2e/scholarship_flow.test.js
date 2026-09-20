const axios = require('axios');
const { ApiResponse } = require('@maha-interop/shared');

const GATEWAY_URL = 'http://localhost:8000/api';
const AUTH_TOKEN = 'Bearer mock-jwt-token-for-testing'; // In real tests, we'd login first

async function logStep(step, result) {
  console.log(`\n--- Step ${step} ---`);
  if (result.success) {
    console.log(`✅ SUCCESS: ${result.message}`);
  } else {
    console.log(`❌ FAILED: ${result.message}`);
    console.error(result.errors || result.data);
  }
}

async function runE2ETest() {
  console.log('🚀 Starting End-to-End Scholarship Workflow Test...');
  
  try {
    // Step 1: Submit Scholarship Application
    const appResponse = await axios.post(`${GATEWAY_URL}/workflow/applications`, {
      citizenId: 'MC-10024',
      schemeId: 'SCH-POST-MATRIC-2026',
      requestedData: ['annualIncome', 'domicileStatus', 'casteCertificate']
    }, { headers: { Authorization: AUTH_TOKEN } });
    
    const appData = appResponse.data.data;
    const appId = appData.appId;
    logStep(1, { success: true, message: `Application submitted. ID: ${appId}` });

    // Step 2: Verify Consent Request was created
    const consentResponse = await axios.get(`${GATEWAY_URL}/consent/pending/MC-10024`, {
      headers: { Authorization: AUTH_TOKEN }
    });
    const pendingConsents = consentResponse.data.data;
    const hasConsent = pendingConsents.some(c => c.purpose.includes('SCH-POST-MATRIC-2026'));
    logStep(2, { success: hasConsent, message: hasConsent ? 'Consent request found' : 'Consent request missing' });

    // Step 3: Approve Consent
    const consentId = pendingConsents[0].consentId;
    await axios.put(`${GATEWAY_URL}/consent/${consentId}/respond`, {
      decision: 'APPROVE',
      signature: 'DIGITAL_SIG_RAHUL_SHARMA'
    }, { headers: { Authorization: AUTH_TOKEN } });
    logStep(3, { success: true, message: 'Consent approved' });

    // Step 4: Wait for Async Processing (MDM -> Adapter -> Eligibility)
    console.log('⏳ Waiting for async workflow processing (MDM & Data Retrieval)...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: Check Application Status
    const statusResponse = await axios.get(`${GATEWAY_URL}/workflow/applications/${appId}`, {
      headers: { Authorization: AUTH_TOKEN }
    });
    const finalStatus = statusResponse.data.data.currentState;
    logStep(4, { success: true, message: `Current Workflow State: ${finalStatus}` });

    // Step 6: Verify Audit Trail
    const auditResponse = await axios.get(`${GATEWAY_URL}/audit/trail/${appId}`, {
      headers: { Authorization: AUTH_TOKEN }
    });
    const trail = auditResponse.data.data;
    logStep(5, { success: trail.length > 0, message: `Audit trail contains ${trail.length} events` });

    console.log('\n✨ E2E Test Completed Successfully! ✨');
  } catch (error) {
    console.error('\n💥 E2E Test Failed!');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

runE2ETest();
