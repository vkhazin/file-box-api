function getKeyValue(obj, key) {
  if (!obj) return null;
  const keyLower = key.toLowerCase();
  const value = Object.keys(obj).filter(x => x.toLowerCase() == keyLower);
  return value.length ? obj[value[0]] : null;
}

function parseMetadataHeaders(headers) {
  if (!headers) return null;
  const prefix = 'x-metadata-';
  const keys = Object.keys(headers).filter(x => x.toLowerCase().startsWith(prefix));
  if (!keys.length) return null;
  const metadata = {};
  keys.map(k => {
    const metadataKey = decodeURIComponent(k.substring(prefix.length));
    metadata[metadataKey] = headers[k];
  });
  return metadata;
}

function parseQuery(query) {
  const match = query.match(/^([^:]+):(.*)$/);
  if (match && match.length == 3) {
    return { type: match[1].toLowerCase(), data: match[2] };
  }
  return null;
}

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
  getKeyValue: getKeyValue,
  parseMetadataHeaders: parseMetadataHeaders,
  parseQuery: parseQuery,
  removeCommandSegment: removeCommandSegment,
  splitPath: splitPath
};
