/**
 * European sovereign states (common ISO list). Excludes Russia and Belarus.
 * Sorted by display name for search/dropdown + chips.
 */
export type EuropeanCountry = {
  code: string
  label: string
  flag: string
}

export const EUROPEAN_COUNTRIES: EuropeanCountry[] = [
  { code: "AL", label: "Albania", flag: "🇦🇱" },
  { code: "AD", label: "Andorra", flag: "🇦🇩" },
  { code: "AM", label: "Armenia", flag: "🇦🇲" },
  { code: "AT", label: "Austria", flag: "🇦🇹" },
  { code: "AZ", label: "Azerbaijan", flag: "🇦🇿" },
  { code: "BE", label: "Belgium", flag: "🇧🇪" },
  { code: "BA", label: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { code: "BG", label: "Bulgaria", flag: "🇧🇬" },
  { code: "HR", label: "Croatia", flag: "🇭🇷" },
  { code: "CY", label: "Cyprus", flag: "🇨🇾" },
  { code: "CZ", label: "Czechia", flag: "🇨🇿" },
  { code: "DK", label: "Denmark", flag: "🇩🇰" },
  { code: "EE", label: "Estonia", flag: "🇪🇪" },
  { code: "FI", label: "Finland", flag: "🇫🇮" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "GE", label: "Georgia", flag: "🇬🇪" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "GR", label: "Greece", flag: "🇬🇷" },
  { code: "HU", label: "Hungary", flag: "🇭🇺" },
  { code: "IS", label: "Iceland", flag: "🇮🇸" },
  { code: "IE", label: "Ireland", flag: "🇮🇪" },
  { code: "IT", label: "Italy", flag: "🇮🇹" },
  { code: "XK", label: "Kosovo", flag: "🇽🇰" },
  { code: "LV", label: "Latvia", flag: "🇱🇻" },
  { code: "LI", label: "Liechtenstein", flag: "🇱🇮" },
  { code: "LT", label: "Lithuania", flag: "🇱🇹" },
  { code: "LU", label: "Luxembourg", flag: "🇱🇺" },
  { code: "MT", label: "Malta", flag: "🇲🇹" },
  { code: "MD", label: "Moldova", flag: "🇲🇩" },
  { code: "MC", label: "Monaco", flag: "🇲🇨" },
  { code: "ME", label: "Montenegro", flag: "🇲🇪" },
  { code: "NL", label: "Netherlands", flag: "🇳🇱" },
  { code: "MK", label: "North Macedonia", flag: "🇲🇰" },
  { code: "NO", label: "Norway", flag: "🇳🇴" },
  { code: "PL", label: "Poland", flag: "🇵🇱" },
  { code: "PT", label: "Portugal", flag: "🇵🇹" },
  { code: "RO", label: "Romania", flag: "🇷🇴" },
  { code: "SM", label: "San Marino", flag: "🇸🇲" },
  { code: "RS", label: "Serbia", flag: "🇷🇸" },
  { code: "SK", label: "Slovakia", flag: "🇸🇰" },
  { code: "SI", label: "Slovenia", flag: "🇸🇮" },
  { code: "ES", label: "Spain", flag: "🇪🇸" },
  { code: "SE", label: "Sweden", flag: "🇸🇪" },
  { code: "CH", label: "Switzerland", flag: "🇨🇭" },
  { code: "TR", label: "Turkey", flag: "🇹🇷" },
  { code: "UA", label: "Ukraine", flag: "🇺🇦" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "VA", label: "Vatican City", flag: "🇻🇦" },
].sort((a, b) => a.label.localeCompare(b.label))

/** Emoji flags keyed by ISO country code (Europe list above). */
export const EUROPE_FLAG_BY_CODE: Record<string, string> = Object.fromEntries(
  EUROPEAN_COUNTRIES.map((c) => [c.code, c.flag]),
)
