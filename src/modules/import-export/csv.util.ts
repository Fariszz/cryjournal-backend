function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = false;
        continue;
      }
      field += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }
    if (char === '\r') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      if (next === '\n') {
        index += 1;
      }
      continue;
    }
    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter(
    (currentRow) => currentRow.length > 0 && currentRow.some((value) => value.trim() !== ''),
  );
}

export function parseCsv(content: string): Array<Record<string, string>> {
  const rows = parseCsvRows(content);
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) => {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] ?? '').trim();
    });
    return row;
  });
}

export function toCsv(
  rows: Array<Record<string, unknown>>,
  headerOrder?: string[],
): string {
  if (rows.length === 0) {
    return (headerOrder ?? []).join(',');
  }
  const headers = headerOrder ?? Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const sourceValue = value === null || value === undefined ? '' : String(value);
    const raw = /^[\t\r ]*[=+\-@]/.test(sourceValue)
      ? `'${sourceValue}`
      : sourceValue;
    if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const body = rows.map((row) =>
    headers.map((header) => escape(row[header])).join(','),
  );
  return [headers.join(','), ...body].join('\n');
}
