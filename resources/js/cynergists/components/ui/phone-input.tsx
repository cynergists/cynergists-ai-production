import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  format: string;
  areaCodes?: string[]; // Known area codes for this country
}

// US/Canada area codes (NANP - North American Numbering Plan)
const NANP_AREA_CODES = [
  // US area codes (non-exhaustive but covers major ones)
  "201", "202", "203", "205", "206", "207", "208", "209", "210", "212", "213", "214", "215", "216", "217", "218", "219",
  "224", "225", "228", "229", "231", "234", "239", "240", "248", "251", "252", "253", "254", "256", "260", "262", "267",
  "269", "270", "272", "276", "281", "301", "302", "303", "304", "305", "307", "308", "309", "310", "312", "313", "314",
  "315", "316", "317", "318", "319", "320", "321", "323", "325", "330", "331", "334", "336", "337", "339", "340", "346",
  "347", "351", "352", "360", "361", "364", "380", "385", "386", "401", "402", "404", "405", "406", "407", "408", "409",
  "410", "412", "413", "414", "415", "417", "419", "423", "424", "425", "430", "432", "434", "435", "440", "442", "443",
  "458", "469", "470", "475", "478", "479", "480", "484", "501", "502", "503", "504", "505", "507", "508", "509", "510",
  "512", "513", "515", "516", "517", "518", "520", "530", "531", "534", "539", "540", "541", "551", "559", "561", "562",
  "563", "567", "570", "571", "573", "574", "575", "580", "585", "586", "601", "602", "603", "605", "606", "607", "608",
  "609", "610", "612", "614", "615", "616", "617", "618", "619", "620", "623", "626", "628", "629", "630", "631", "636",
  "641", "646", "650", "651", "657", "660", "661", "662", "667", "669", "678", "680", "681", "682", "701", "702", "703",
  "704", "706", "707", "708", "712", "713", "714", "715", "716", "717", "718", "719", "720", "724", "725", "727", "730",
  "731", "732", "734", "737", "740", "747", "754", "757", "760", "762", "763", "765", "769", "770", "772", "773", "774",
  "775", "779", "781", "785", "786", "801", "802", "803", "804", "805", "806", "808", "810", "812", "813", "814", "815",
  "816", "817", "818", "828", "830", "831", "832", "843", "845", "847", "848", "850", "854", "856", "857", "858", "859",
  "860", "862", "863", "864", "865", "870", "872", "878", "901", "903", "904", "906", "907", "908", "909", "910", "912",
  "913", "914", "915", "916", "917", "918", "919", "920", "925", "928", "929", "930", "931", "934", "936", "937", "938",
  "940", "941", "947", "949", "951", "952", "954", "956", "959", "970", "971", "972", "973", "978", "979", "980", "984",
  "985", "989",
  // Canadian area codes  
  "204", "226", "236", "249", "250", "289", "306", "343", "365", "403", "416", "418", "431", "437", "438", "450",
  "506", "514", "519", "548", "579", "581", "587", "604", "613", "639", "647", "672", "705", "709", "778", "780",
  "782", "807", "819", "825", "867", "873", "902", "905",
];

// Philippines area codes (landline)
const PH_AREA_CODES = ["2", "32", "33", "34", "35", "36", "38", "42", "43", "44", "45", "46", "47", "48", "49",
  "52", "53", "54", "55", "56", "62", "63", "64", "65", "72", "74", "75", "77", "78", "82", "83", "84", "85", "86", "87", "88"];

const COUNTRY_CODES: CountryCode[] = [
  { code: "US", name: "United States", dialCode: "+1", format: "(###) ###-####", areaCodes: NANP_AREA_CODES },
  { code: "PH", name: "Philippines", dialCode: "+63", format: "(###) ###-####", areaCodes: PH_AREA_CODES },
  { code: "CA", name: "Canada", dialCode: "+1", format: "(###) ###-####", areaCodes: NANP_AREA_CODES },
  { code: "GB", name: "United Kingdom", dialCode: "+44", format: "(####) ######" },
  { code: "AU", name: "Australia", dialCode: "+61", format: "(##) #### ####" },
  { code: "MX", name: "Mexico", dialCode: "+52", format: "(###) ###-####" },
  { code: "IN", name: "India", dialCode: "+91", format: "(####) ######" },
  { code: "DE", name: "Germany", dialCode: "+49", format: "(###) #######" },
  { code: "FR", name: "France", dialCode: "+33", format: "(#) ## ## ## ##" },
  { code: "JP", name: "Japan", dialCode: "+81", format: "(##) ####-####" },
  { code: "BR", name: "Brazil", dialCode: "+55", format: "(##) #####-####" },
  { code: "CN", name: "China", dialCode: "+86", format: "(###) #### ####" },
];

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

// Detect country from phone number with dial code
function detectCountryFromDialCode(phone: string): CountryCode | null {
  if (!phone) return null;
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check each country code (sorted by dialCode length descending to match longer codes first)
  const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  
  for (const country of sortedCodes) {
    if (cleaned.startsWith(country.dialCode)) {
      return country;
    }
  }
  
  return null;
}

// Auto-detect country from just digits (when user starts typing without dial code)
function autoDetectCountryFromDigits(digits: string): CountryCode | null {
  if (!digits || digits.length < 3) return null;
  
  const firstThree = digits.slice(0, 3);
  
  // Check if it's a NANP area code (US/Canada) - these are 3-digit codes starting with 2-9
  if (NANP_AREA_CODES.includes(firstThree)) {
    return COUNTRY_CODES.find(c => c.code === "US")!;
  }
  
  // Check if starts with 63 (Philippines mobile/landline)
  if (digits.startsWith("63")) {
    return COUNTRY_CODES.find(c => c.code === "PH")!;
  }
  
  // Check for Philippines mobile (starts with 9)
  if (digits.startsWith("9") && digits.length >= 10) {
    // Could be Philippines mobile - but also check if next digits match PH pattern
    const secondDigit = digits[1];
    // PH mobile numbers start with 9 followed by specific digits
    if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(secondDigit)) {
      // Check if this could also be a US number - if first 3 digits are a valid NANP code, prefer US
      if (NANP_AREA_CODES.includes(firstThree)) {
        return COUNTRY_CODES.find(c => c.code === "US")!;
      }
    }
  }
  
  // Default to US for 10-digit numbers that look like US format
  if (digits.length === 10 && /^[2-9]/.test(digits)) {
    return COUNTRY_CODES.find(c => c.code === "US")!;
  }
  
  return null;
}

// Format phone number based on country format
function formatPhoneNumber(digits: string, format: string): string {
  let result = '';
  let digitIndex = 0;
  
  for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
    if (format[i] === '#') {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += format[i];
    }
  }
  
  return result;
}

// Extract just the local number (without country code)
function extractLocalNumber(phone: string, dialCode: string): string {
  const cleaned = phone.replace(/[^\d]/g, '');
  const dialDigits = dialCode.replace(/[^\d]/g, '');
  
  if (cleaned.startsWith(dialDigits)) {
    return cleaned.slice(dialDigits.length);
  }
  
  return cleaned;
}

// Normalize a phone number for storage (always include dial code)
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If already has a + at the start, it's already normalized with dial code
  if (cleaned.startsWith('+')) {
    const detected = detectCountryFromDialCode(phone);
    if (detected) {
      const localDigits = extractLocalNumber(phone, detected.dialCode);
      const formatted = formatPhoneNumber(localDigits, detected.format);
      return `${detected.dialCode} ${formatted}`.trim();
    }
    return phone;
  }
  
  // Just digits - try to auto-detect country
  const digits = phone.replace(/[^\d]/g, '');
  const detected = autoDetectCountryFromDigits(digits);
  
  if (detected) {
    const formatted = formatPhoneNumber(digits, detected.format);
    return `${detected.dialCode} ${formatted}`.trim();
  }
  
  // Default to US if we have 10 digits
  if (digits.length === 10) {
    const us = COUNTRY_CODES.find(c => c.code === "US")!;
    const formatted = formatPhoneNumber(digits, us.format);
    return `${us.dialCode} ${formatted}`.trim();
  }
  
  // Return as-is if we can't determine
  return phone;
}

// Format a phone number for display (standardized format)
// US numbers display as (###) ###-#### without dial code
export function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (!phone) return "—";
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned) return "—";
  
  // If already has dial code, format it properly
  const detected = detectCountryFromDialCode(phone);
  if (detected) {
    const localDigits = extractLocalNumber(phone, detected.dialCode);
    const formatted = formatPhoneNumber(localDigits, detected.format);
    // For US/Canada numbers, display without dial code
    if (detected.code === "US" || detected.code === "CA") {
      return formatted;
    }
    return `${detected.dialCode} ${formatted}`.trim();
  }
  
  // Try to auto-detect from digits
  const digits = phone.replace(/[^\d]/g, '');
  const autoDetected = autoDetectCountryFromDigits(digits);
  
  if (autoDetected) {
    const formatted = formatPhoneNumber(digits, autoDetected.format);
    // For US/Canada numbers, display without dial code
    if (autoDetected.code === "US" || autoDetected.code === "CA") {
      return formatted;
    }
    return `${autoDetected.dialCode} ${formatted}`.trim();
  }
  
  // Default to US format if we have 10 digits (display without dial code)
  if (digits.length === 10) {
    const us = COUNTRY_CODES.find(c => c.code === "US")!;
    return formatPhoneNumber(digits, us.format);
  }
  
  // Return original if we can't format
  return phone;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    // Detect country from existing value or default to US
    const detectedCountry = detectCountryFromDialCode(value);
    const [selectedCountry, setSelectedCountry] = React.useState<CountryCode>(
      detectedCountry || COUNTRY_CODES[0]
    );
    
    // Extract local number from full phone value
    const localNumber = value ? extractLocalNumber(value, selectedCountry.dialCode) : '';
    const formattedLocal = formatPhoneNumber(localNumber, selectedCountry.format);
    
    // Update selected country when value changes externally
    React.useEffect(() => {
      const detected = detectCountryFromDialCode(value);
      if (detected && detected.code !== selectedCountry.code) {
        setSelectedCountry(detected);
      }
    }, [value, selectedCountry.code]);

    const handleCountryChange = (countryCode: string) => {
      const country = COUNTRY_CODES.find(c => c.code === countryCode);
      if (country) {
        setSelectedCountry(country);
        // Rebuild full number with new country code
        const digits = value.replace(/[^\d]/g, '');
        const oldDialDigits = selectedCountry.dialCode.replace(/[^\d]/g, '');
        const localDigits = digits.startsWith(oldDialDigits) 
          ? digits.slice(oldDialDigits.length) 
          : digits;
        const formatted = formatPhoneNumber(localDigits, country.format);
        onChange(`${country.dialCode} ${formatted}`.trim());
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Extract only digits from input
      const digits = inputValue.replace(/[^\d]/g, '');
      
      // Auto-detect country from the entered digits
      if (digits.length >= 3) {
        const autoDetected = autoDetectCountryFromDigits(digits);
        if (autoDetected && autoDetected.code !== selectedCountry.code) {
          setSelectedCountry(autoDetected);
          const formatted = formatPhoneNumber(digits, autoDetected.format);
          onChange(`${autoDetected.dialCode} ${formatted}`.trim());
          return;
        }
      }
      
      // Format according to country pattern
      const formatted = formatPhoneNumber(digits, selectedCountry.format);
      // Combine with dial code
      onChange(`${selectedCountry.dialCode} ${formatted}`.trim());
    };

    return (
      <div className={cn("flex gap-2", className)}>
        <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[120px] shrink-0">
            <SelectValue>
              {selectedCountry.code} {selectedCountry.dialCode}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_CODES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.code} {country.dialCode} - {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          ref={ref}
          type="tel"
          value={formattedLocal}
          onChange={handleInputChange}
          placeholder={selectedCountry.format.replace(/#/g, '_')}
          className="flex-1"
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
