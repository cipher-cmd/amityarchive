// This file stores data that is shared across multiple components.

export const COURSES = [
  'B. Tech',
  'B Des',
  'BCA',
  'MCA',
  'B Com',
  'BBA',
  'MBA',
  'Diploma',
];

export const DOMAINS = [
  { name: 'ALLIED', path: '/domain/allied' },
  { name: 'ASET', path: '/domain/aset' },
  { name: 'MGMT', path: '/domain/mgmt' },
  { name: 'DIP', path: '/domain/dip' },
];

// This function now generates the years dynamically.
// It shows the current year and the three previous years.
const currentYear = new Date().getFullYear();
export const YEARS = [
  currentYear,
  currentYear - 1,
  currentYear - 2,
  currentYear - 3
].map(String);
