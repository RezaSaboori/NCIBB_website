/** Converts Western Arabic digits (0–9) to Eastern Arabic/Persian digits (۰–۹) */
export const toPersianDigits = (n: number): string =>
  String(n).replace(/\d/g, (d) => String.fromCharCode(d.charCodeAt(0) + 1728));