const MorphItHelper = require('./dist/index.js').MorphItHelper;

const mih = new MorphItHelper();

// uomo
console.log(mih.getNoun('uomini'));

// antico
console.log(mih.getAdj('antiche'));
