const { Injectable } = require('@nestjs/common');
const path = require('path');
const fs = require('fs');
const { ApiResponse } = require('@maha-interop/shared');

@Injectable()
class RevenueService {
  constructor() {
    this.citizens = [];
    this._loadSeed();
  }

  _loadSeed() {
    try {
      const seedFile = path.join(__dirname, '../seed/revenue-citizens.json');
      const data = fs.readFileSync(seedFile, 'utf8');
      this.citizens = JSON.parse(data);
    } catch (err) {
      console.error('Failed to load revenue seed data:', err.message);
      this.citizens = [];
    }
  }

  getAllCitizens({ search, limit = 50, offset = 0 } = {}) {
    let result = [...this.citizens];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.citizen_name?.toLowerCase().includes(q) ||
          c.id?.toLowerCase().includes(q) ||
          c.dist?.toLowerCase().includes(q)
      );
    }
    const total = result.length;
    const paginated = result.slice(Number(offset), Number(offset) + Number(limit));
    return { citizens: paginated, total, limit: Number(limit), offset: Number(offset) };
  }

  getCitizenById(id) {
    return this.citizens.find((c) => c.id === id) || null;
  }

  getIncomeCertificate(citizenId) {
    const citizen = this.getCitizenById(citizenId);
    if (!citizen) return null;

    return {
      revenue_id: citizen.id,
      applicant_name: citizen.citizen_name,
      birth_date: citizen.birth_date,
      annual_income_amount: citizen.income_amt,
      residence_address: citizen.addr,
      district: citizen.dist,
      pincode: citizen.pin,
      certificate: citizen.certificate_details,
    };
  }

  getDomicileCertificate(citizenId) {
    const citizen = this.getCitizenById(citizenId);
    if (!citizen) return null;

    return {
      revenue_id: citizen.id,
      applicant_name: citizen.citizen_name,
      birth_date: citizen.birth_date,
      domicile: citizen.domicile_details,
    };
  }
}

module.exports = { RevenueService };