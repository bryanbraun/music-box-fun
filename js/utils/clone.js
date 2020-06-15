// A deep clone that works for almost all cases (except cyclic references)
// See also: https://stackoverflow.com/a/34624648/1154642
function cloneDeep(object) {
  if (!object) {
    return object;
  }

  let newObj = Array.isArray(object) ? [] : {};
  for (const key in object) {
    let value = object[key];
    newObj[key] = (typeof value === "object") ? cloneDeep(value) : value;
  }

  return newObj;
}

// We use this function to minify our state object before storing it in the URL, and
// unminify it after removing it from the URL. This shortens the URL by ≈50 characters.
function cloneDeepWithRenamedKeys(object, renameMap) {
  if (!object) {
    return object;
  }

  let newObj = Array.isArray(object) ? [] : {};
  for (const key in object) {
    let value = object[key];
    let renamedKey = renameMap[key] ? renameMap[key] : key;
    newObj[renamedKey] = (typeof value === "object") ? cloneDeepWithRenamedKeys(value, renameMap) : value;
  }

  return newObj;
}

export {
  cloneDeep,
  cloneDeepWithRenamedKeys
}
