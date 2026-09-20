const { Injectable } = require('@nestjs/common');
const path = require('path');
const fs = require('fs');

@Injectable()
class LandService {
  constructor() {
    this.records = [];
    this._loadSeed();
  }

  _loadSeed() {
    try {
      const seedFile = path.join(__dirname, '../seed/land-records.json');
      const data = fs.readFileSync(seedFile, 'utf8');
      this.records = JSON.parse(data);
    } catch (err) {
      console.error('Failed to load land seed data:', err.message);
      this.records = [];
    }
  }

  getAllRecords({ search, limit = 50, offset = 0 } = {}) {
    let result = [...this.records];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.ownerName?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q) ||
          r.surveyNo?.toLowerCase().includes(q) ||
          r.villageName?.toLowerCase().includes(q) ||
          r.district?.toLowerCase().includes(q)
      );
    }
    const total = result.length;
    const paginated = result.slice(Number(offset), Number(offset) + Number(limit));
    return { records: paginated, total, limit: Number(limit), offset: Number(offset) };
  }

  getRecordById(id) {
    return this.records.find((r) => r.id === id) || null;
  }

  getExtract712(id) {
    const record = this.getRecordById(id);
    if (!record) return null;

    return {
      land_record_id: record.id,
      owner_name: record.ownerName,
      date_of_birth: record.dateOfBirth,
      village_name: record.villageName,
      taluka: record.taluka,
      district: record.district,
      survey_number: record.surveyNo,
      hissa_number: record.hissaNo,
      total_area_hectares: record.landArea,
      digitally_signed_extract: record.extract712,
      issued_at: new Date().toISOString(),
    };
  }

  getPropertyCard(id) {
    const record = this.getRecordById(id);
    if (!record) return null;

    return {
      land_record_id: record.id,
      owner_name: record.ownerName,
      property_card_number: record.propertyCardNo,
      plot_number: record.plotNo,
      village: record.villageName,
      district: record.district,
      verification_status: 'VERIFIED',
    };
  }
}

module.exports = { LandService };