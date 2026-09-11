export function money(value:number, currency="USD") {
  return new Intl.NumberFormat("en-US", { style:"currency", currency, maximumFractionDigits:2 }).format(value || 0);
}
export function dateTime(value:string|Date) {
  return new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
}
