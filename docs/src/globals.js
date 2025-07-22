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
  return onlyComponents;
}


globalThis.sliderValueToDate = function (value) {
  // Convert a slider value (representing days from start date) to an actual date string
  // value: number of days offset from startDate
  // returns: date string in YYYY-MM-DD format

  // Use fixed start date instead of window.startDate
  const start = new Date('2022-06-01');  // <-- FIXED: hard-coded instead of window.startDate

  // Create a new date by adding the slider value (days) to the start date
  const resultDate = new Date(start);
  resultDate.setDate(start.getDate() + value);

  // Format the date as YYYY-MM-DD
  const year = resultDate.getFullYear();
  const month = String(resultDate.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed
  const day = String(resultDate.getDate()).padStart(2, '0');

  const result = `${year}-${month}-${day}`;
  return result
}

globalThis.formatMonth = function (month) {
  // Input: '2022-06'
  const [year, monthNum] = month.split('-');
  const date = new Date(year, monthNum - 1);
  return date.toLocaleString('default', { month: 'short', year: '2-digit' });
  // Output: 'Jun 22'
}

globalThis.formatToday = function (plusDays = 0) {
  const date = new Date();
  if (plusDays !== 0) {
    date.setDate(date.getDate() + plusDays);
  }
  return date.toISOString().slice(0, 10).replace(/-/g, '/');
}

globalThis.lineItemTotal = function (lineItems) {
  if (!lineItems || !Array.isArray(lineItems)) {
    return 0;
  }

  let total = 0;
  for (const item of lineItems) {
    if (item && typeof item.amount === 'number') {
      total += item.amount;
    }
  }
  return total;
}

globalThis.sampleInvoice = {
  id: 55,
  invoice_number: "INV-1003",
  client: 'Globex Corporation',
  issue_date: "2025-03-13",
  due_date: "2025-03-28",
  status: "sent",
  notes: "Monthly service invoice",
  items: "[{\"id\": 14, \"name\": \"API Integration\", \"price\": 105, \"quantity\": 5, \"total\": 525}]",
  total: 525,
  created_at: "2025-04-19T23:45:47.937465",
  paid_date: null
}

globalThis.filterInvoicesAfter = function (data, dateAfter) {
  if (!dateAfter) return data;
  return data
    .filter(invoice => new Date(invoice.issue_date) >= new Date(dateAfter))
    .sort((a, b) => new Date(a.issue_date) - new Date(b.issue_date));
}

globalThis.formatDate = function (date) {
  return date.substring(0, 10)
}

globalThis.filterSearchResults = function (clients, products, invoices, searchTerm) {
  if (!searchTerm) return [];

  const term = searchTerm.toLowerCase();
  const results = [];

  // Search clients - access the .value property
  if (clients && clients.value) {
    clients.value.forEach(client => {
      const nameMatch = client.name && client.name.toLowerCase().includes(term);
      const emailMatch = client.email && client.email.toLowerCase().includes(term);
      const phoneMatch = client.phone && client.phone.toLowerCase().includes(term);
      const addressMatch = client.address && client.address.toLowerCase().includes(term);

      if (nameMatch || emailMatch || phoneMatch || addressMatch) {
        let snippet = client.name;
        if (nameMatch) snippet = `Name: ${client.name}`;
        else if (emailMatch) snippet = `Email: ${client.email}`;
        else if (phoneMatch) snippet = `Phone: ${client.phone}`;
        else if (addressMatch) snippet = `Address: ${client.address}`;

        results.push({
          table_name: 'clients',
          record_id: client.id,
          title: client.name,
          snippet: snippet
        });
      }
    });
  }

  // Search products
  if (products && products.value) {
    products.value.forEach(product => {
      const nameMatch = product.name && product.name.toLowerCase().includes(term);
      const descMatch = product.description && product.description.toLowerCase().includes(term);

      if (nameMatch || descMatch) {
        let snippet = product.name;
        if (nameMatch) snippet = `Product: ${product.name}`;
        else if (descMatch) snippet = `Description: ${product.description}`;

        results.push({
          table_name: 'products',
          record_id: product.id,
          title: product.name,
          snippet: snippet
        });
      }
    });
  }

  // Search invoices
  if (invoices && invoices.value) {
    invoices.value.forEach(invoice => {
      const numberMatch = invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(term);
      const notesMatch = invoice.notes && invoice.notes.toLowerCase().includes(term);
      const itemsMatch = invoice.items && invoice.items.toLowerCase().includes(term);

      if (numberMatch || notesMatch || itemsMatch) {
        let snippet = `Invoice: ${invoice.invoice_number}`;
        if (numberMatch) snippet = `Invoice: ${invoice.invoice_number}`;
        else if (notesMatch) snippet = `Notes: ${invoice.notes.substring(0, 100)}...`;
        else if (itemsMatch) snippet = `Items: ${invoice.items.substring(0, 100)}...`;

        results.push({
          table_name: 'invoices',
          record_id: invoice.id,
          title: invoice.invoice_number,
          snippet: snippet
        });
      }
    });
  }

  return results;
}

globalThis.handleHelloClick = function(event) {
  console.log('Hello World clicked!', event);
  alert('Button clicked!');
};

globalThis.handleHelloReset = function(event) {
  console.log('Hello World reset!', event);
  alert('Counter was reset!');
};

// Enhanced debugLog function for index.html
globalThis.debugLog = function(data, label) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.group(`🐛 ${label || 'Debug'} (${timestamp})`);

  // Check if it's likely a Proxy object
  const isProxy = data && typeof data === 'object' &&
    (data.constructor?.name === 'Object' &&
      data.toString?.() === '[object Object]');

  console.log('Is Proxy:', isProxy);
  console.log('Raw:', data);

  // Show unwrapped data for objects
  if (typeof data === 'object' && data !== null) {
    try {
      const unwrapped = JSON.parse(JSON.stringify(data));
      console.log('Unwrapped:', unwrapped);
      console.log('Keys:', Object.keys(data));
    } catch (e) {
      console.log('Could not unwrap:', e.message);
    }
  }

  console.groupEnd();
  return data;
};

globalThis.transformPeople = function(data) {
  console.log(data);
  const items = data.data.items;
  const itemMap = {
    A: 'Austin',
    B: 'Boston'
  };
  return items.map(item => ({
    ...item,
    city: itemMap[item.group]
  }));
};
