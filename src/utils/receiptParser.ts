export interface ReceiptParseResult {
  storeName: string | null;
  amount: number | null;
  date: string | null; // YYYY-MM-DD
  category: string | null;
  rawText: string;
}

const RECEIPT_KEYWORDS = /영수증|receipt|tax\s*invoice|세금계산서|간이영수증/i;
const AMOUNT_KEYWORDS = /합계|총액|총합계|total|결제금액|받을금액|청구금액/i;
const AMOUNT_PATTERN = /[\d,]+/g;

const DATE_PATTERNS = [
  /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/,
  /(\d{2})[./](\d{1,2})[./](\d{1,2})/,
  /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
];

const CATEGORY_RULES: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /스타벅스|카페|커피|coffee|cafe/i, category: 'Food' },
  { pattern: /이마트|롯데마트|홈플러스|마트|슈퍼|grocery/i, category: 'Food' },
  { pattern: /편의점|GS25|CU|세븐일레븐|미니스톱|convenience/i, category: 'Food' },
  { pattern: /식당|음식|restaurant|푸드|food|김밥|치킨|피자|버거/i, category: 'Food' },
  { pattern: /약국|병원|의원|clinic|hospital|pharmacy|의료/i, category: 'Health' },
  { pattern: /교통|버스|지하철|택시|주유|주차|transit|transport/i, category: 'Transport' },
];

function parseAmount(line: string): number | null {
  const matches = line.match(AMOUNT_PATTERN);
  if (!matches) return null;
  const candidates = matches
    .map(m => parseInt(m.replace(/,/g, ''), 10))
    .filter(n => n > 0);
  if (candidates.length === 0) return null;
  return Math.max(...candidates);
}

function isValidDate(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

function parseDate(text: string): string | null {
  for (const pattern of DATE_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      let year = parseInt(m[1], 10);
      if (year < 100) year += 2000;
      const month = parseInt(m[2], 10);
      const day = parseInt(m[3], 10);
      if (isValidDate(year, month, day)) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }
  return null;
}

function guessCategory(text: string): string | null {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(text)) return rule.category;
  }
  return 'Other';
}

function extractStoreName(lines: string[]): string | null {
  const candidates = lines
    .slice(0, 5)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !RECEIPT_KEYWORDS.test(l) && !/^\d/.test(l));
  return candidates[0] ?? null;
}

export function parseReceipt(text: string): ReceiptParseResult {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let amount: number | null = null;
  for (const line of lines) {
    if (AMOUNT_KEYWORDS.test(line)) {
      const parsed = parseAmount(line);
      if (parsed !== null && (amount === null || parsed > amount)) {
        amount = parsed;
      }
    }
  }
  // fallback: largest number in document
  if (amount === null) {
    const allNums = lines
      .flatMap(l => (l.match(AMOUNT_PATTERN) ?? []))
      .map(m => parseInt(m.replace(/,/g, ''), 10))
      .filter(n => n >= 100);
    if (allNums.length > 0) amount = Math.max(...allNums);
  }

  const date = parseDate(text);
  const storeName = extractStoreName(lines);
  const category = guessCategory(text);

  return { storeName, amount, date, category, rawText: text };
}
