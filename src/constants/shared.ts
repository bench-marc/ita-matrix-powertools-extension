export const matrixCurrencies = [
    { p: /US\$/, c: 'USD' },
    { p: /€/, c: 'EUR' },
    { p: /£/, c: 'GBP' },
    { p: /CA\$/, c: 'CAD' },
    { p: /RS\./, c: 'INR' },
];

export const monthNames = <const>['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export type Month = typeof monthNames[number];
