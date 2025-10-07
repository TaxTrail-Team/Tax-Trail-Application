export type TaxItem = {
  id: string;
  name: string;
  category: string;
  amount: number; // stored in LKR (logical)
  currency: string; // "LKR"
  year?: number;
  createdAt?: string;
};

export function toYearNumber(y: any): number | undefined {
  if (typeof y === "number") return y;
  if (typeof y === "string") {
    const d = new Date(y);
    if (!isNaN(d.getTime())) return d.getUTCFullYear();
    const n = Number(y);
    if (!isNaN(n)) return n;
  }
  return undefined;
}

export function mapDoc(d: any): TaxItem & { createdAt?: string } {
  const amountNum = typeof d.amount === "number" ? d.amount : Number(d.amount);
  return {
    id: d.$id || d.id,
    name: d.name,
    category: d.category,
    amount: isNaN(amountNum) ? 0 : amountNum,
    currency: "LKR",
    year: toYearNumber(d.year),
    createdAt: d.$createdAt,
  };
}
