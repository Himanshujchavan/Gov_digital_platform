const { CanonicalCitizen, CanonicalFinancial } = require('@maha-interop/shared');

class WelfareAdapter {
  getSchema() {
    return {
      citizen: {
        fullName: 'name',
        dob: 'dateOfBirth',
        address: 'address',
      },
      financial: {
        annualIncome: 'annualIncome',
      },
    };
  }

  transform(data) {
    const citizen = new CanonicalCitizen({
      name: data.fullName,
      dateOfBirth: data.dob,
      address: data.address,
      sourceDepartment: 'Welfare',
    });

    const financial = new CanonicalFinancial({
      annualIncome: data.annualIncome,
      isVerified: true,
    });

    return { citizen, financial };
  }

  reverseTransform(canonical) {
    return {
      fullName: canonical.citizen.name,
      dob: canonical.citizen.dateOfBirth,
      address: canonical.citizen.address,
      annualIncome: canonical.financial.annualIncome,
    };
  }
}

module.exports = { WelfareAdapter };
