import dayjs from 'dayjs';
import * as chrono from 'chrono-node';

export interface DateProcessResult {
  value: string;
  error: string | null;
  parsedDate: Date | null;
}

/**
 * 自然言語や相対日付表現を処理する
 * 例: "Today", "Tomorrow", "Next Monday", "Today + 3 days"
 */
export function processNaturalDate(input: string, format?: string): DateProcessResult {
  const trimmedInput = input.trim();
  
  if (!trimmedInput) {
    return { value: '', error: 'Empty input', parsedDate: null };
  }

  try {
    // 1. chrono-nodeで自然言語解析を最優先で試行
    const parsed = chrono.parseDate(trimmedInput);
    if (parsed) {
      const formatted = formatDate(parsed, format);
      return { value: formatted, error: null, parsedDate: parsed };
    }

    // 2. カスタム相対日付表現のパースを試行 (例: "Today + 3 days", "Tomorrow - 1 week")
    const relativeMatch = trimmedInput.match(/^(today|tomorrow|yesterday)\s*([+-])\s*(\d+)\s*(day|week|month|year)s?$/i);
    if (relativeMatch) {
      const [, base, operator, amount, unit] = relativeMatch;
      let baseDate = dayjs();
      
      if (base.toLowerCase() === 'tomorrow') baseDate = baseDate.add(1, 'day');
      if (base.toLowerCase() === 'yesterday') baseDate = baseDate.subtract(1, 'day');
      
      const num = parseInt(amount);
      const finalDate = operator === '+' 
        ? baseDate.add(num, unit as any)
        : baseDate.subtract(num, unit as any);
      
      const formatted = formatDate(finalDate.toDate(), format);
      return { value: formatted, error: null, parsedDate: finalDate.toDate() };
    }

    // 3. 通常の日付文字列として解析を試行
    const dayDate = dayjs(trimmedInput);
    if (dayDate.isValid()) {
      const formatted = formatDate(dayDate.toDate(), format);
      return { value: formatted, error: null, parsedDate: dayDate.toDate() };
    }

    return { value: trimmedInput, error: `Could not parse date: ${trimmedInput}`, parsedDate: null };
  } catch (error) {
    return { 
      value: trimmedInput, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      parsedDate: null 
    };
  }
}

/**
 * カスタムフォーマット文字列に従って日付をフォーマット
 */
export function formatDate(date: Date, format?: string): string {
  const dayjsDate = dayjs(date);
  
  if (!format) {
    return dayjsDate.format('YYYY/MM/DD');
  }

  // カスタムフォーマット文字列の処理
  return dayjsDate.format(format);
}

/**
 * フォーマット文字列が有効かチェック
 */
export function validateDateFormat(format: string): { isValid: boolean; error?: string } {
  if (!format.trim()) {
    return { isValid: false, error: 'Format cannot be empty' };
  }

  try {
    // テスト用の日付でフォーマットを試行
    const testDate = dayjs('2025-01-15');
    testDate.format(format);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid format' 
    };
  }
}

/**
 * フォーマット例を生成
 */
export function getFormatExamples(): Array<{ format: string; example: string; description: string }> {
  const testDate = dayjs('2025-01-15 14:30:00');
  
  return [
    { format: 'YYYY/MM/DD', example: testDate.format('YYYY/MM/DD'), description: '年/月/日' },
    { format: 'YYYY-MM-DD', example: testDate.format('YYYY-MM-DD'), description: '年-月-日' },
    { format: 'MM/DD/YYYY', example: testDate.format('MM/DD/YYYY'), description: '月/日/年' },
    { format: 'DD/MM/YYYY', example: testDate.format('DD/MM/YYYY'), description: '日/月/年' },
    { format: 'YYYY年MM月DD日', example: testDate.format('YYYY年MM月DD日'), description: '日本語形式' },
    { format: 'YYYY/MM/DD HH:mm', example: testDate.format('YYYY/MM/DD HH:mm'), description: '日時（時:分）' },
    { format: 'YYYY-MM-DD HH:mm:ss', example: testDate.format('YYYY-MM-DD HH:mm:ss'), description: '日時（秒まで）' },
    { format: 'MMM DD, YYYY', example: testDate.format('MMM DD, YYYY'), description: '英語形式' },
  ];
}