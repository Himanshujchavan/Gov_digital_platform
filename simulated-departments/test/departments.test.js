const test = require('node:test');
const assert = require('node:assert');
const { RevenueService } = require('../src/revenue/revenue.service');
const { WelfareService } = require('../src/welfare/welfare.service');
const { LandService } = require('../src/land/land.service');

test('Simulated Maharashtra Departments Test Suite', async (t) => {
  const revenueService = new RevenueService();
  const welfareService = new WelfareService();
  const landService = new LandService();

  await t.test('1. Revenue Department (Aaple Sarkar style)', async () => {
    const list = revenueService.getAllCitizens({ limit: 10 });
    assert.ok(list.total >= 40, 'Should load at least 40 revenue records');
    assert.strictEqual(list.citizens.length, 10);

    const rahul = revenueService.getCitizenById('REV-1021');
    assert.ok(rahul, 'REV-1021 should exist');
    assert.strictEqual(rahul.citizen_name, 'Rahul Sharma');
    assert.strictEqual(rahul.birth_date, '2002-03-12');
    assert.strictEqual(rahul.income_amt, 250000);

    const incomeCert = revenueService.getIncomeCertificate('REV-1021');
    assert.ok(incomeCert);
    assert.strictEqual(incomeCert.certificate.cert_number, 'REV-INC-2026-9921');
    assert.strictEqual(incomeCert.annual_income_amount, 250000);

    const domicileCert = revenueService.getDomicileCertificate('REV-1021');
    assert.ok(domicileCert);
    assert.strictEqual(domicileCert.domicile.is_domiciled, true);
  });

  await t.test('2. Welfare Department (MahaDBT style)', async () => {
    const list = welfareService.getAllBeneficiaries({ limit: 10 });
    assert.ok(list.total >= 38, 'Should load at least 38 welfare records');

    const rSharma = welfareService.getBeneficiaryById('WEL-7821');
    assert.ok(rSharma, 'WEL-7821 should exist');
    assert.strictEqual(rSharma.fullName, 'R. Sharma');
    assert.strictEqual(rSharma.dob, '2002-03-12');
    assert.strictEqual(rSharma.annualIncome, 250000);

    const schemes = welfareService.getSchemes();
    assert.ok(schemes.length >= 3, 'Should list at least 3 government schemes');
    assert.strictEqual(schemes[0].schemeId, 'SCH-MAHA-001');

    const app = welfareService.submitApplication({
      citizenId: 'WEL-7821',
      schemeId: 'SCH-MAHA-001',
      courseName: 'B.Tech Computer Science',
    });
    assert.ok(app.applicationId.startsWith('WEL-APP-'));
    assert.strictEqual(app.status, 'SUBMITTED');
  });

  await t.test('3. Land Records (Mahabhumi style)', async () => {
    const list = landService.getAllRecords({ limit: 10 });
    assert.ok(list.total >= 37, 'Should load at least 37 land records');

    const rahulLand = landService.getRecordById('LAND-4512');
    assert.ok(rahulLand, 'LAND-4512 should exist');
    assert.strictEqual(rahulLand.ownerName, 'Rahul S.');
    assert.strictEqual(rahulLand.dateOfBirth, '2002-03-12');
    assert.strictEqual(rahulLand.landArea, 1.2);

    const extract = landService.getExtract712('LAND-4512');
    assert.ok(extract);
    assert.strictEqual(extract.survey_number, '124/2A');
    assert.strictEqual(extract.digitally_signed_extract.isDigitallySigned, true);

    const propCard = landService.getPropertyCard('LAND-4512');
    assert.ok(propCard);
    assert.strictEqual(propCard.verification_status, 'VERIFIED');
  });

  await t.test('4. Cross-Department Identity Discrepancy Verification', async () => {
    const revRecord = revenueService.getCitizenById('REV-1021');
    const welRecord = welfareService.getBeneficiaryById('WEL-7821');
    const landRecord = landService.getRecordById('LAND-4512');

    // Prove the real-world interoperability problem:
    // Different IDs:
    assert.notStrictEqual(revRecord.id, welRecord.id);
    assert.notStrictEqual(revRecord.id, landRecord.id);

    // Different Name formatting:
    assert.strictEqual(revRecord.citizen_name, 'Rahul Sharma');
    assert.strictEqual(welRecord.fullName, 'R. Sharma');
    assert.strictEqual(landRecord.ownerName, 'Rahul S.');

    // Common ground for MDM resolution:
    assert.strictEqual(revRecord.birth_date, welRecord.dob);
    assert.strictEqual(welRecord.dob, landRecord.dateOfBirth);
    assert.strictEqual(revRecord.income_amt, welRecord.annualIncome);
  });
});