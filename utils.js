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

function parseQuery(query) {
  const match = query.match(/^([^:]+):(.*)$/);
  if (match && match.length == 3) {
    return { type: match[1].toLowerCase(), data: match[2] };
  }
  return null;
}

module.exports = {
  parseQuery: parseQuery,
  removeCommandSegment: removeCommandSegment,
  splitPath: splitPath
};
