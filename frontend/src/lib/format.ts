const moneyFmt = new Intl.NumberFormat("ar-EG", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const moneyExactFmt = new Intl.NumberFormat("ar-EG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFmt = new Intl.DateTimeFormat("ar-EG", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const monthFmt = new Intl.DateTimeFormat("ar-EG", {
  month: "long",
  year: "numeric",
});

function toFiniteNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Display-only. Backend Decimal values remain the source of truth. */
export function formatMoney(value: string | number | null | undefined): string {
  const n = toFiniteNumber(value);
  return n === null ? "—" : moneyFmt.format(n);
}

export function formatMoneyExact(value: string | number | null | undefined): string {
  const n = toFiniteNumber(value);
  return n === null ? "—" : moneyExactFmt.format(n);
}

export function formatDateAr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

export function formatMonthAr(date: Date): string {
  return monthFmt.format(date);
}

export function formatPercentChange(current: number, previous: number): string | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function saleStatusLabel(status: string): string {
  if (status === "COMPLETED") return "تم البيع";
  if (status === "REFUNDED") return "مسترجعة";
  return status;
}
