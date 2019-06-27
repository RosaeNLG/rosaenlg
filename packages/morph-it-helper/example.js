let MorphItHelper = require('./dist/index.js').MorphItHelper;

let mih = new MorphItHelper();

// uomo
console.log(mih.getNoun('uomini'));

// antico
console.log(mih.getAdj('antiche'));
