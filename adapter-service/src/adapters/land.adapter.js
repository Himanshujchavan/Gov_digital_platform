const { CanonicalCitizen, CanonicalProperty } = require('@maha-interop/shared');

class LandAdapter {
  getSchema() {
    return {
      citizen: {
        ownerName: 'name',
        dateOfBirth: 'dateOfBirth',
      },
      property: {
        plotNo: 'surveyNumber',
        landArea: 'areaHectares',
      },
    };
  }

  transform(data) {
    const citizen = new CanonicalCitizen({
      name: data.ownerName,
      dateOfBirth: data.dateOfBirth,
      sourceDepartment: 'Land',
    });

    const property = new CanonicalProperty({
      surveyNumber: data.plotNo,
      areaHectares: data.landArea,
      is712Verified: true,
    });

    return { citizen, property };
  }

  reverseTransform(canonical) {
    return {
      ownerName: canonical.citizen.name,
      dateOfBirth: canonical.citizen.dateOfBirth,
      plotNo: canonical.property.surveyNumber,
      landArea: canonical.property.areaHectares,
    };
  }
}

module.exports = { LandAdapter };
