// data/mockTax.ts
export type TaxItem = {
  id: string;
  date: string; // ISO
  year: number;
  category: 'Income' | 'VAT' | 'PAYE' | 'Capital Gains' | 'Other';
  amount: number; // + payment, - refund
  note?: string;
};

export const YEARS = [2022, 2023, 2024, 2025];
// data/mockTax.ts
export const CATEGORIES: string[] = ['Income', 'VAT', 'PAYE', 'Capital Gains', 'Other'];

export const MOCK_TAX: TaxItem[] = [
  { id: 't1', date: '2025-03-12', year: 2025, category: 'Income', amount: 1200, note: 'Q1 payment' },
  { id: 't2', date: '2025-02-05', year: 2025, category: 'VAT', amount: 680, note: 'Feb return' },
  { id: 't3', date: '2024-12-20', year: 2024, category: 'PAYE', amount: 450, note: 'Payroll' },
  { id: 't4', date: '2024-09-02', year: 2024, category: 'Capital Gains', amount: -300, note: 'Refund adj.' },
  { id: 't5', date: '2023-06-16', year: 2023, category: 'Other', amount: 150, note: 'Admin fee' },
  { id: 't6', date: '2022-11-09', year: 2022, category: 'Income', amount: 2100, note: 'Year-end settlement' },
  { id: 't7', date: '2025-05-01', year: 2025, category: 'Other', amount: -120, note: 'Penalty refund' },
];

export type Filter = {
  year?: number;
  categories?: string[];
  min?: number;
  max?: number;
};

export function applyFilters(data: TaxItem[], f: Filter) {
  return data.filter(d =>
    (f.year ? d.year === f.year : true) &&
    (f.categories?.length ? f.categories.includes(d.category) : true) &&
    (typeof f.min === 'number' ? d.amount >= f.min : true) &&
    (typeof f.max === 'number' ? d.amount <= f.max : true)
  );
}

export function kpis(rows: TaxItem[]) {
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const payments = rows.filter(r => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const refunds = rows.filter(r => r.amount < 0).reduce((s, r) => s + r.amount, 0);
  const anomalies = rows.filter(r => Math.abs(r.amount) > 1000).length;
  return { total, payments, refunds, anomalies };
}
