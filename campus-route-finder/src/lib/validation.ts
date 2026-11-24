export interface DistanceValidation {
  valid: boolean;
  value?: number;
  error?: string;
}

/** Hanya menerima bilangan bulat positif (1, 2, 3, ...). */
export function validateDistance(raw: string): DistanceValidation {
  const text = raw.trim();
  if (text === "") return { valid: false, error: "Jarak wajib diisi." };
  if (!/^[1-9]\d*$/.test(text)) {
    return { valid: false, error: "Jarak harus berupa bilangan bulat positif (tanpa desimal, huruf, atau tanda minus)." };
  }
  const value = Number(text);
  if (!Number.isSafeInteger(value)) {
    return { valid: false, error: "Angka terlalu besar." };
  }
  return { valid: true, value };
}
