// test.js
const addon = require('../build/Release/xlsx-util');

console.log('This should be eight:', addon.parseXlsx(3, 5));
