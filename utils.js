function removeCommandSegment(path) {
  const newPath = path.replace(/^\/\$[^/]+/, '');
  return newPath;
}

function splitPath(path) {
  const result = {
    folder: '',
    file: ''
  };
  if (path) {
    const idx = path.lastIndexOf('/');
    if (idx == -1) {
      result.file = path;
    } else {
      result.folder = path.substring(0, idx);
      result.file = path.substring(idx + 1) || '';
    }
  }
  return result;
}

module.exports = {
  removeCommandSegment: removeCommandSegment,
  splitPath: splitPath
};
