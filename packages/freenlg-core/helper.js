



function hasFlag(params, flag) {
  if (flag==null) {
    console.log('ERROR: hasFlag must be called with a flag param!');
  }
  if (params!=null && params[flag]==true) {
    return true;
  } else {
    return false;
  }
}

function getFlagValue(params, flag) {
  if (flag==null) {
    console.log('ERROR: getFlagValue must be called with a flag param!');
  }
  if (params!=null) {
    return params[flag];
  } else {
    return null;
  }
}

function recordSaid(util, key) {
  if (key==null) {
    console.log('ERROR: recordSaid with null arg!');
  }
  util.has_said[key] = true;
}

function deleteSaid(util, key) {
  if (hasSaid(util, key)) {
    util.has_said[key] = null;   
  }
}

function hasSaid(util, key) {
  if (key==null) {
    console.log('ERROR: hasSaid with null arg!');
  }
  return util.has_said[key] || false;
}

function protectString(string) {
  return '§' + string + '§';
}


module.exports = {
  hasFlag,
  getFlagValue,
  recordSaid,
  deleteSaid,
  hasSaid,
  protectString
};
