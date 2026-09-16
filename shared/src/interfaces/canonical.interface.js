/**
 * Canonical Data Model Definitions for Maharashtra Interoperability Platform
 */

class CanonicalCitizen {
  constructor({
    masterId = null,
    name = '',
    dateOfBirth = '',
    gender = '',
    address = '',
    district = '',
    pincode = '',
    phone = '',
    email = '',
    sourceDepartment = '',
    sourceRecordId = '',
  } = {}) {
    this.masterId = masterId;
    this.name = name;
    this.dateOfBirth = dateOfBirth; // YYYY-MM-DD
    this.gender = gender;
    this.address = address;
    this.district = district;
    this.pincode = pincode;
    this.phone = phone;
    this.email = email;
    this.sourceDepartment = sourceDepartment;
    this.sourceRecordId = sourceRecordId;
  }
}

class CanonicalFinancial {
  constructor({
    annualIncome = 0,
    certificateNumber = '',
    issueDate = '',
    validUntil = '',
    issuingAuthority = '',
    isVerified = false,
  } = {}) {
    this.annualIncome = Number(annualIncome);
    this.certificateNumber = certificateNumber;
    this.issueDate = issueDate;
    this.validUntil = validUntil;
    this.issuingAuthority = issuingAuthority;
    this.isVerified = Boolean(isVerified);
  }
}

class CanonicalProperty {
  constructor({
    surveyNumber = '',
    hissaNumber = '',
    village = '',
    taluka = '',
    district = '',
    areaHectares = 0,
    landType = '',
    is712Verified = false,
  } = {}) {
    this.surveyNumber = surveyNumber;
    this.hissaNumber = hissaNumber;
    this.village = village;
    this.taluka = taluka;
    this.district = district;
    this.areaHectares = Number(areaHectares);
    this.landType = landType;
    this.is712Verified = Boolean(is712Verified);
  }
}

module.exports = {
  CanonicalCitizen,
  CanonicalFinancial,
  CanonicalProperty,
};
