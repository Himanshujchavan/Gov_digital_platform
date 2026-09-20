const { CanonicalCitizen, CanonicalFinancial } = require('@maha-interop/shared');

class RevenueAdapter {
  getSchema() {
    return {
      citizen: {
        citizen_name: 'name',
        birth_date: 'dateOfBirth',
        addr: 'address',
      },
      financial: {
        income_amt: 'annualIncome',
      },
    };
  }

  transform(data) {
    const citizen = new CanonicalCitizen({
      name: data.citizen_name,
      dateOfBirth: data.birth_date,
      address: data.addr,
      sourceDepartment: 'Revenue',
    });

    const financial = new CanonicalFinancial({
      annualIncome: data.income_amt,
      isVerified: true, // Simulated verification
    });

    return { citizen, financial };
  }

  reverseTransform(canonical) {
    return {
      citizen_name: canonical.citizen.name,
      birth_date: canonical.citizen.dateOfBirth,
      addr: canonical.citizen.address,
      income_amt: canonical.financial.annualIncome,
    };
  }
}

module.exports = { RevenueAdapter };
