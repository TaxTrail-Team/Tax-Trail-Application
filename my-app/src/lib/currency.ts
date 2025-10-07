// app/lib/currency.ts

// A best-effort currency → primary country code mapping.
// You can add more over time.
const CURRENCY_TO_CC: Record<string, string> = {
  USD: "US", EUR: "EU", GBP: "GB", LKR: "LK", INR: "IN", JPY: "JP",
  AUD: "AU", CAD: "CA", CHF: "CH", CNY: "CN", HKD: "HK", SGD: "SG",
  NZD: "NZ", RUB: "RU", AED: "AE", SAR: "SA", KRW: "KR", SEK: "SE",
  NOK: "NO", DKK: "DK", ZAR: "ZA", TRY: "TR", THB: "TH", PKR: "PK",
  BDT: "BD", IDR: "ID", MYR: "MY", PHP: "PH", VND: "VN", ILS: "IL",
  EGP: "EG", NGN: "NG", KES: "KE", GHS: "GH", UGX: "UG", TZS: "TZ",
  MAD: "MA", COP: "CO", ARS: "AR", BRL: "BR", MXN: "MX", PEN: "PE",
  CLP: "CL", PLN: "PL", HUF: "HU", CZK: "CZ", RON: "RO", BGN: "BG",
  HRK: "HR", ISK: "IS",
};

// Turn "US" → 🇺🇸
export function countryCodeToFlag(cc: string): string {
  if (!cc) return "🌐";
  if (cc.toUpperCase() === "EU") return "🇪🇺";
  const codePoints = cc
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function currencyToFlag(currencyCode: string): string {
  const cc = CURRENCY_TO_CC[currencyCode?.toUpperCase?.() ?? ""];
  return countryCodeToFlag(cc || "");
}

export function codeToNiceName(code: string): string {
  const map: Record<string, string> = {
    
   USD:  "US Dollar" ,
  EUR: "Euro" ,
  GBP:  "British Pound" ,
  LKR:  "Sri Lankan Rupee" ,
  INR: "Indian Rupee" ,
  JPY:  "Japanese Yen",
 AUD: "Australian Dol" ,
  CAD:  "Canadian Doll",
  CHF:  "Swiss Franc", 
  CNY:  "Chinese Yuan",
  HKD:  "Hong Kong Dollar" ,
  SGD:  "Singapore Dollar" ,
  NZD:  "New Zealand Dollar" ,
  RUB:  "Russian Ruble" ,
  AED:  "UAE Dirham" ,
  SAR:  "Saudi Riyal" ,
  KRW:  "South Korean Won" ,
  SEK:  "Swedish Krona" ,
  NOK:  "Norwegian Krone" ,
  DKK:  "Danish Krone" ,
  ZAR:  "South African Rand" ,
  TRY:  "Turkish Lira" ,
  THB:  "Thai Baht" ,
  PKR:  "Pakistani Rupee" ,
  BDT:  "Bangladeshi Taka" ,
  IDR:  "Indonesian Rupiah" ,
  MYR:  "Malaysian Ringgit" ,
  PHP:  "Philippine Peso" ,
  VND:  "Vietnamese Dong" ,
  ILS:  "Israeli New Shekel" ,
  EGP:  "Egyptian Pound" ,
  NGN:  "Nigerian Naira" ,
  KES:  "Kenyan Shilling" ,
  GHS:  "Ghanaian Cedi" ,
  UGX:  "Ugandan Shilling" ,
  TZS:  "Tanzanian Shilling" ,
  MAD:  "Moroccan Dirham" ,
  COP:  "Colombian Peso" ,
  ARS:  "Argentine Peso" ,
  BRL:  "Brazilian Real" ,
  MXN:  "Mexican Peso" ,
  PEN:  "Peruvian Sol" ,
  CLP:  "Chilean Peso" ,
  PLN:  "Polish Złoty" ,
  HUF:  "Hungarian Forint" ,
  CZK:  "Czech Koruna" ,
  RON:  "Romanian Leu" ,
  BGN:  "Bulgarian Lev" ,
  HRK:  "Croatian Kuna" ,
  ISK:  "Icelandic Króna" ,

  };
  return map[code.toUpperCase()] ?? code.toUpperCase();
}
