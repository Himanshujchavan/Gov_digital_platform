const fs = require('fs');
const path = require('path');

// 15 Overlapping identities with controlled variations across departments
const overlaps = [
  {
    rev: { id: 'REV-1021', name: 'Rahul Sharma', dob: '2002-03-12', income: 250000, addr: 'Plot 42, Shivajinagar, Pune', dist: 'Pune', pin: '411005', phone: '9822012345' },
    wel: { id: 'WEL-7821', name: 'R. Sharma', dob: '2002-03-12', income: 250000, addr: 'Shivajinagar, Pune', dist: 'Pune', pin: '411005', phone: '9822012345' },
    land: { id: 'LAND-4512', name: 'Rahul S.', dob: '2002-03-12', area: 1.2, survey: '124/2A', village: 'Haveli', dist: 'Pune', pin: '411005' },
    cert: 'REV-INC-2026-9921',
  },
  {
    rev: { id: 'REV-1022', name: 'Priya Patil', dob: '2001-08-25', income: 180000, addr: 'Flat 301, Kothrud, Pune', dist: 'Pune', pin: '411038', phone: '9823054321' },
    wel: { id: 'WEL-7822', name: 'Priya S. Patil', dob: '2001-08-25', income: 180000, addr: 'Kothrud, Pune', dist: 'Pune', pin: '411038', phone: '9823054321' },
    land: { id: 'LAND-4513', name: 'Priya Patil', dob: '2001-08-25', area: 0.8, survey: '56/1B', village: 'Kothrud', dist: 'Pune', pin: '411038' },
    cert: 'REV-INC-2026-8812',
  },
  {
    rev: { id: 'REV-1023', name: 'Sunil Vasantrao Patil', dob: '1988-07-20', income: 420000, addr: 'At Post Saswad, Taluka Purandar', dist: 'Pune', pin: '412301', phone: '9422011223' },
    wel: { id: 'WEL-7823', name: 'Sunil Patil', dob: '1988-07-20', income: 420000, addr: 'Saswad, Purandar', dist: 'Pune', pin: '412301', phone: '9422011223' },
    land: { id: 'LAND-4514', name: 'Sunil V. Patil', dob: '1988-07-20', area: 3.5, survey: '201/3', village: 'Saswad', dist: 'Pune', pin: '412301' },
    cert: 'REV-INC-2026-7734',
  },
  {
    rev: { id: 'REV-1024', name: 'Ganesh Ramesh Shinde', dob: '1995-11-05', income: 310000, addr: 'Ganesh Nagar, Satara Road, Satara', dist: 'Satara', pin: '415001', phone: '9890123456' },
    wel: { id: 'WEL-7824', name: 'Ganesh R. Shinde', dob: '1995-11-05', income: 310000, addr: 'Satara Road, Satara', dist: 'Satara', pin: '415001', phone: '9890123456' },
    land: { id: 'LAND-4515', name: 'Ganesh Shinde', dob: '1995-11-05', area: 2.1, survey: '88/4', village: 'Wai', dist: 'Satara', pin: '415001' },
    cert: 'REV-INC-2026-6645',
  },
  {
    rev: { id: 'REV-1025', name: 'Anita Mohan Deshmukh', dob: '1992-04-18', income: 150000, addr: 'Samarth Colony, Amravati', dist: 'Amravati', pin: '444601', phone: '9765432109' },
    wel: { id: 'WEL-7825', name: 'Anita Deshmukh', dob: '1992-04-18', income: 150000, addr: 'Samarth Col., Amravati', dist: 'Amravati', pin: '444601', phone: '9765432109' },
    land: { id: 'LAND-4516', name: 'Anita M. Deshmukh', dob: '1992-04-18', area: 1.5, survey: '45/2', village: 'Badnera', dist: 'Amravati', pin: '444601' },
    cert: 'REV-INC-2026-5521',
  },
  {
    rev: { id: 'REV-1026', name: 'Vijay Babanrao Gaikwad', dob: '1999-09-30', income: 210000, addr: 'Shivaji Chowk, Solapur', dist: 'Solapur', pin: '413001', phone: '9821098765' },
    wel: { id: 'WEL-7826', name: 'Vijay Gaikwad', dob: '1999-09-30', income: 210000, addr: 'Solapur City', dist: 'Solapur', pin: '413001', phone: '9821098765' },
    land: { id: 'LAND-4517', name: 'V. B. Gaikwad', dob: '1999-09-30', area: 1.9, survey: '312/1', village: 'Barshi', dist: 'Solapur', pin: '413001' },
    cert: 'REV-INC-2026-4432',
  },
  {
    rev: { id: 'REV-1027', name: 'Snehal Dattatray More', dob: '2003-01-14', income: 120000, addr: 'Sector 15, Vashi, Navi Mumbai', dist: 'Thane', pin: '400703', phone: '9819876543' },
    wel: { id: 'WEL-7827', name: 'Snehal D. More', dob: '2003-01-14', income: 120000, addr: 'Vashi, Navi Mumbai', dist: 'Thane', pin: '400703', phone: '9819876543' },
    land: null,
    cert: 'REV-INC-2026-3321',
  },
  {
    rev: { id: 'REV-1028', name: 'Sachin Pandurang Kadam', dob: '1990-12-10', income: 550000, addr: 'Tarabai Park, Kolhapur', dist: 'Kolhapur', pin: '416003', phone: '9822334455' },
    wel: { id: 'WEL-7828', name: 'Sachin P. Kadam', dob: '1990-12-10', income: 550000, addr: 'Kolhapur', dist: 'Kolhapur', pin: '416003', phone: '9822334455' },
    land: { id: 'LAND-4518', name: 'Sachin Kadam', dob: '1990-12-10', area: 4.2, survey: '109/2', village: 'Karvir', dist: 'Kolhapur', pin: '416003' },
    cert: 'REV-INC-2026-2210',
  },
  {
    rev: { id: 'REV-1029', name: 'Pooja Ashokrao Chavan', dob: '2000-06-05', income: 240000, addr: 'CIDCO N-4, Aurangabad', dist: 'Chhatrapati Sambhajinagar', pin: '431003', phone: '9850123789' },
    wel: { id: 'WEL-7829', name: 'Pooja A. Chavan', dob: '2000-06-05', income: 240000, addr: 'CIDCO, Aurangabad', dist: 'Chhatrapati Sambhajinagar', pin: '431003', phone: '9850123789' },
    land: null,
    cert: 'REV-INC-2026-1199',
  },
  {
    rev: { id: 'REV-1030', name: 'Amit Prabhakar Joshi', dob: '1994-02-28', income: 680000, addr: 'Ramdas Peth, Nagpur', dist: 'Nagpur', pin: '440010', phone: '9890456123' },
    wel: null,
    land: { id: 'LAND-4519', name: 'Amit P. Joshi', dob: '1994-02-28', area: 2.8, survey: '502/1', village: 'Kamptee', dist: 'Nagpur', pin: '440010' },
    cert: 'REV-INC-2026-9901',
  },
  {
    rev: { id: 'REV-1031', name: 'Meena Suresh Kulkarni', dob: '1987-10-15', income: 390000, addr: 'Gangapur Road, Nashik', dist: 'Nashik', pin: '422013', phone: '9423112233' },
    wel: { id: 'WEL-7830', name: 'Meena S. Kulkarni', dob: '1987-10-15', income: 390000, addr: 'Nashik City', dist: 'Nashik', pin: '422013', phone: '9423112233' },
    land: { id: 'LAND-4520', name: 'Meena Kulkarni', dob: '1987-10-15', area: 1.1, survey: '77/3', village: 'Dindori', dist: 'Nashik', pin: '422013' },
    cert: 'REV-INC-2026-8877',
  },
  {
    rev: { id: 'REV-1032', name: 'Dipak Tanaji Bhosale', dob: '1997-03-22', income: 290000, addr: 'MIDC Road, Ahmednagar', dist: 'Ahilyanagar', pin: '414001', phone: '9822667788' },
    wel: { id: 'WEL-7831', name: 'Dipak T. Bhosale', dob: '1997-03-22', income: 290000, addr: 'Ahmednagar', dist: 'Ahilyanagar', pin: '414001', phone: '9822667788' },
    land: { id: 'LAND-4521', name: 'Dipak Bhosale', dob: '1997-03-22', area: 2.4, survey: '64/1A', village: 'Nagar', dist: 'Ahilyanagar', pin: '414001' },
    cert: 'REV-INC-2026-7766',
  },
  {
    rev: { id: 'REV-1033', name: 'Shubham Sanjay Jadhav', dob: '2002-11-18', income: 175000, addr: 'Pachwad, Karad', dist: 'Satara', pin: '415110', phone: '9850998877' },
    wel: { id: 'WEL-7832', name: 'Shubham S. Jadhav', dob: '2002-11-18', income: 175000, addr: 'Karad, Satara', dist: 'Satara', pin: '415110', phone: '9850998877' },
    land: null,
    cert: 'REV-INC-2026-6655',
  },
  {
    rev: { id: 'REV-1034', name: 'Swati Eknath Pawar', dob: '1996-05-12', income: 225000, addr: 'Vishrambag, Sangli', dist: 'Sangli', pin: '416415', phone: '9823445566' },
    wel: { id: 'WEL-7833', name: 'Swati E. Pawar', dob: '1996-05-12', income: 225000, addr: 'Sangli', dist: 'Sangli', pin: '416415', phone: '9823445566' },
    land: { id: 'LAND-4522', name: 'Swati Pawar', dob: '1996-05-12', area: 1.7, survey: '155/2', village: 'Miraj', dist: 'Sangli', pin: '416415' },
    cert: 'REV-INC-2026-5544',
  },
  {
    rev: { id: 'REV-1035', name: 'Nilesh Dnyaneshwar Wagh', dob: '1991-08-08', income: 480000, addr: 'Civil Lines, Jalgaon', dist: 'Jalgaon', pin: '425001', phone: '9422778899' },
    wel: null,
    land: { id: 'LAND-4523', name: 'Nilesh D. Wagh', dob: '1991-08-08', area: 5.0, survey: '33/1B', village: 'Bhusawal', dist: 'Jalgaon', pin: '425001' },
    cert: 'REV-INC-2026-4411',
  },
];

// Generate additional non-overlapping citizens for each department
const districts = ['Pune', 'Satara', 'Kolhapur', 'Nagpur', 'Nashik', 'Solapur', 'Amravati', 'Jalgaon', 'Thane', 'Sangli'];
const firstNames = ['Abhishek', 'Rohan', 'Kunal', 'Manish', 'Neha', 'Sonali', 'Tushar', 'Akshay', 'Pallavi', 'Sanjay', 'Vandana', 'Kiran', 'Pratik', 'Mayur', 'Kavita'];
const lastNames = ['Kadam', 'Chavan', 'More', 'Salunkhe', 'Thorat', 'Bhosale', 'Jadhav', 'Shinde', 'Pawar', 'Kulkarni', 'Deshmukh', 'Patil', 'Mane', 'Sawant', 'Gawade'];

// Build Revenue records
const revenueRecords = [];
overlaps.forEach(o => {
  revenueRecords.push({
    citizen_name: o.rev.name,
    birth_date: o.rev.dob,
    income_amt: o.rev.income,
    addr: o.rev.addr,
    dist: o.rev.dist,
    pin: o.rev.pin,
    phone_num: o.rev.phone,
    id: o.rev.id,
    certificate_details: {
      cert_number: o.cert,
      cert_type: 'INCOME',
      issue_date: '2026-01-10',
      valid_thru: '2027-03-31',
      issuing_office: `Tahsildar Office, ${o.rev.dist}`,
      is_valid: true,
    },
    domicile_details: {
      domicile_cert_number: `REV-DOM-2026-${o.rev.id.split('-')[1]}`,
      state: 'Maharashtra',
      is_domiciled: true,
      issue_date: '2025-06-15',
    }
  });
});

for (let i = 1; i <= 25; i++) {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i * 3) % lastNames.length];
  const dist = districts[i % districts.length];
  const idNum = 1035 + i;
  revenueRecords.push({
    citizen_name: `${fn} ${ln}`,
    birth_date: `199${(i % 9) + 1}-0${(i % 8) + 1}-1${(i % 9)}`,
    income_amt: 120000 + (i * 15000),
    addr: `Near Bus Stand, ${dist}`,
    dist: dist,
    pin: `41${i.toString().padStart(4, '0')}`,
    phone_num: `9822${i.toString().padStart(6, '0')}`,
    id: `REV-${idNum}`,
    certificate_details: {
      cert_number: `REV-INC-2026-${idNum}`,
      cert_type: 'INCOME',
      issue_date: '2026-02-01',
      valid_thru: '2027-03-31',
      issuing_office: `Tahsildar Office, ${dist}`,
      is_valid: true,
    },
    domicile_details: {
      domicile_cert_number: `REV-DOM-2026-${idNum}`,
      state: 'Maharashtra',
      is_domiciled: true,
      issue_date: '2025-05-10',
    }
  });
}

// Build Welfare records
const welfareRecords = [];
overlaps.forEach(o => {
  if (o.wel) {
    welfareRecords.push({
      id: o.wel.id,
      fullName: o.wel.name,
      dob: o.wel.dob,
      annualIncome: o.wel.income,
      address: o.wel.addr,
      district: o.wel.dist,
      pincode: o.wel.pin,
      contact: o.wel.phone,
      enrolledSchemes: [
        {
          schemeId: 'SCH-MAHA-001',
          schemeName: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna',
          status: 'IN_PROCESS',
          applicationDate: '2026-08-15',
        }
      ],
      currentStatus: 'ACTIVE',
    });
  }
});

for (let i = 1; i <= 25; i++) {
  const fn = firstNames[(i + 4) % firstNames.length];
  const ln = lastNames[(i * 2) % lastNames.length];
  const dist = districts[(i + 2) % districts.length];
  const idNum = 7833 + i;
  welfareRecords.push({
    id: `WEL-${idNum}`,
    fullName: `${fn} ${ln}`,
    dob: `199${(i % 8) + 2}-0${(i % 7) + 2}-2${(i % 8)}`,
    annualIncome: 140000 + (i * 20000),
    address: `Station Road, ${dist}`,
    district: dist,
    pincode: `41${(i + 10).toString().padStart(4, '0')}`,
    contact: `9823${i.toString().padStart(6, '0')}`,
    enrolledSchemes: [
      {
        schemeId: 'SCH-MAHA-002',
        schemeName: 'Post Matric Scholarship for OBC Students',
        status: 'SANCTIONED',
        applicationDate: '2026-07-10',
      }
    ],
    currentStatus: 'ACTIVE',
  });
}

// Build Land records
const landRecords = [];
overlaps.forEach(o => {
  if (o.land) {
    landRecords.push({
      id: o.land.id,
      ownerName: o.land.name,
      dateOfBirth: o.land.dob,
      landArea: o.land.area,
      plotNo: `PLT-${o.land.id.split('-')[1]}`,
      surveyNo: o.land.survey,
      hissaNo: '1',
      villageName: o.land.village,
      taluka: 'Haveli',
      district: o.land.dist,
      propertyCardNo: `PC-${o.land.dist.toUpperCase()}-${o.land.id.split('-')[1]}`,
      extract712: {
        isDigitallySigned: true,
        signatoryAuthority: 'Sub-Divisional Officer, Land Records',
        mutationStatus: 'CERTIFIED',
        cropDetails: 'Kharif: Soyabean, Rabi: Jowar',
      }
    });
  }
});

for (let i = 1; i <= 25; i++) {
  const fn = firstNames[(i + 7) % firstNames.length];
  const ln = lastNames[(i * 4) % lastNames.length];
  const dist = districts[(i + 5) % districts.length];
  const idNum = 4523 + i;
  landRecords.push({
    id: `LAND-${idNum}`,
    ownerName: `${fn} ${ln}`,
    dateOfBirth: `198${(i % 9)}-0${(i % 8) + 1}-1${(i % 8)}`,
    landArea: 0.5 + (i * 0.3),
    plotNo: `PLT-${idNum}`,
    surveyNo: `${100 + i}/${(i % 4) + 1}`,
    hissaNo: `${(i % 3) + 1}`,
    villageName: `Village-${i}`,
    taluka: `Taluka-${(i % 5) + 1}`,
    district: dist,
    propertyCardNo: `PC-${dist.toUpperCase()}-${idNum}`,
    extract712: {
      isDigitallySigned: true,
      signatoryAuthority: `Sub-Divisional Officer, ${dist}`,
      mutationStatus: 'CERTIFIED',
      cropDetails: 'Agricultural Farmland',
    }
  });
}

const seedDir = path.join(__dirname);
fs.writeFileSync(path.join(seedDir, 'revenue-citizens.json'), JSON.stringify(revenueRecords, null, 2), 'utf8');
fs.writeFileSync(path.join(seedDir, 'welfare-beneficiaries.json'), JSON.stringify(welfareRecords, null, 2), 'utf8');
fs.writeFileSync(path.join(seedDir, 'land-records.json'), JSON.stringify(landRecords, null, 2), 'utf8');

console.log(`Successfully generated seed data:`);
console.log(`- Revenue records: ${revenueRecords.length}`);
console.log(`- Welfare records: ${welfareRecords.length}`);
console.log(`- Land records: ${landRecords.length}`);
console.log(`- Deliberate cross-department overlaps: ${overlaps.length}`);