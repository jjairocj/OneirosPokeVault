/**
 * Utility to generate and download CSV files on the client side.
 */
export function downloadCSV(filename: string, data: any[], columns: { key: string; label: string }[]) {
    if (data.length === 0) return;

    // Header row
    const header = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');

    // Data rows
    const rows = data.map(item => {
        return columns.map(col => {
            const val = item[col.key] || '';
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fullFilename = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
    link.setAttribute('download', fullFilename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
