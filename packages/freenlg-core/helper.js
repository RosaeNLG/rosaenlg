



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

function protectString(string) {
  return '§' + string + '§';
}


module.exports = {
  hasFlag,
  getFlagValue,
  protectString
};
