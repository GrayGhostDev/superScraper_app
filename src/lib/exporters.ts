import { ScrapedData } from '../types/scraper';

export const exportToCSV = (data: ScrapedData[]): string => {
  const headers = ['timestamp', 'title', 'text', 'links', 'images'];
  const rows = data.map(item => [
    item.timestamp.toISOString(),
    item.title || '',
    item.text || '',
    (item.links || []).join(';'),
    (item.images || []).join(';')
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');
};

export const exportToJSON = (data: ScrapedData[]): string => {
  return JSON.stringify(data, null, 2);
};

export const downloadData = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};