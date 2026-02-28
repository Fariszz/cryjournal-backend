export function parseCsv(content: string): Array<Record<string, string>> {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return [];
  }
  const headers = lines[0].split(',').map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
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
    const raw = value === null || value === undefined ? '' : String(value);
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
