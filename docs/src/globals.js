globalThis.transformStops = function(stops) {

  return stops.map(function(stop) {

    // Helper to extract a value from additionalProperties by key
    function getProp(key) {
      if (!stop.additionalProperties) return '';
      var propObj = stop.additionalProperties.find(function(p) { return p.key === key; });
      return propObj ? propObj.value : '';
    }

    return {
      name: stop.commonName,
      zone: getProp('Zone'),
      wifi: getProp('WiFi'),
      toilets: getProp('Toilets'),
      // A comma-separated list of line names that serve this stop
      lines: stop.lines
        ? stop.lines.map(function(line) { return line.name; }).join(', ')
        : ''
    };

  });
}

globalThis.getComponentsList = function(items) {
  const onlyComponents = items.filter(item => item.name === 'components');
  console.log('Components found:', onlyComponents);
  return onlyComponents;
}