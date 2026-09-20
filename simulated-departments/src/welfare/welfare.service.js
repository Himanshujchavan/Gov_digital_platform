const { Injectable } = require('@nestjs/common');
const path = require('path');
const fs = require('fs');

@Injectable()
class WelfareService {
  constructor() {
    this.beneficiaries = [];
    this.applications = new Map();
    this._loadSeed();
  }

  _loadSeed() {
    try {
      const seedFile = path.join(__dirname, '../seed/welfare-beneficiaries.json');
      const data = fs.readFileSync(seedFile, 'utf8');
      this.beneficiaries = JSON.parse(data);
    } catch (err) {
      console.error('Failed to load welfare seed data:', err.message);
      this.beneficiaries = [];
    }
  }

  getAllBeneficiaries({ search, limit = 50, offset = 0 } = {}) {
    let result = [...this.beneficiaries];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.fullName?.toLowerCase().includes(q) ||
          b.id?.toLowerCase().includes(q) ||
          b.district?.toLowerCase().includes(q)
      );
    }
    const total = result.length;
    const paginated = result.slice(Number(offset), Number(offset) + Number(limit));
    return { beneficiaries: paginated, total, limit: Number(limit), offset: Number(offset) };
  }

  getBeneficiaryById(id) {
    return this.beneficiaries.find((b) => b.id === id) || null;
  }

  getSchemes() {
    return [
      {
        schemeId: 'SCH-MAHA-001',
        schemeName: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna',
        department: 'Higher & Technical Education (MahaDBT 2.0)',
        incomeCeiling: 800000,
        benefitType: 'Tuition Fee Waiver (50% - 100%)',
        requiredCertificates: ['Income Certificate', 'Domicile Certificate'],
      },
      {
        schemeId: 'SCH-MAHA-002',
        schemeName: 'Post Matric Scholarship for VJNT / OBC / SBC Students',
        department: 'Social Justice and Special Assistance',
        incomeCeiling: 150000,
        benefitType: 'Maintenance Allowance & Exam Fee Reimbursement',
        requiredCertificates: ['Caste Certificate', 'Income Certificate'],
      },
      {
        schemeId: 'SCH-MAHA-003',
        schemeName: 'Dr. Panjabrao Deshmukh Vasatigruh Nirvah Bhatta Yojna',
        department: 'Agriculture & Technical Education',
        incomeCeiling: 800000,
        benefitType: 'Hostel Maintenance Allowance (₹20,000 - ₹30,000/year)',
        requiredCertificates: ['Income Certificate', 'Land Ownership / 7-12 Extract'],
      },
    ];
  }

  submitApplication(appData) {
    const applicationId = `WEL-APP-${Date.now().toString().slice(-6)}`;
    const record = {
      applicationId,
      ...appData,
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED',
      verificationStage: 'PENDING_REVENUE_INCOME_CHECK',
    };
    this.applications.set(applicationId, record);
    return record;
  }

  getApplicationById(id) {
    return this.applications.get(id) || null;
  }
}

module.exports = { WelfareService };