import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  processNaturalDate, 
  formatDate, 
  validateDateFormat, 
  getFormatExamples 
} from '../dateProcessor';

// Mock dayjs to make tests deterministic
vi.mock('dayjs', () => {
  const dayjs = vi.fn(() => ({
    format: vi.fn((format: string) => {
      if (format === 'YYYY/MM/DD') return '2025/01/15';
      if (format === 'YYYY-MM-DD') return '2025-01-15';
      if (format === 'YYYY年MM月DD日') return '2025年01月15日';
      return '2025/01/15';
    }),
    add: vi.fn(() => ({
      toDate: () => new Date('2025-01-16'),
      format: vi.fn(() => '2025/01/16')
    })),
    subtract: vi.fn(() => ({
      toDate: () => new Date('2025-01-14'),
      format: vi.fn(() => '2025/01/14')
    })),
    toDate: () => new Date('2025-01-15'),
    isValid: () => true
  }));

  (dayjs as any).default = dayjs;
  return { default: dayjs };
});

describe('dateProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processNaturalDate', () => {
    it('should handle empty input', () => {
      const result = processNaturalDate('');
      expect(result.error).toBe('Empty input');
      expect(result.value).toBe('');
    });

    it('should handle "today"', () => {
      const result = processNaturalDate('today');
      expect(result.error).toBeNull();
      expect(result.parsedDate).toBeInstanceOf(Date);
    });

    it('should handle "tomorrow"', () => {
      const result = processNaturalDate('tomorrow');
      expect(result.error).toBeNull();
      expect(result.parsedDate).toBeInstanceOf(Date);
    });

    it('should handle "yesterday"', () => {
      const result = processNaturalDate('yesterday');
      expect(result.error).toBeNull();
      expect(result.parsedDate).toBeInstanceOf(Date);
    });

    it('should handle case insensitive input', () => {
      const result1 = processNaturalDate('TODAY');
      const result2 = processNaturalDate('Today');
      const result3 = processNaturalDate('ToDay');
      
      expect(result1.error).toBeNull();
      expect(result2.error).toBeNull();
      expect(result3.error).toBeNull();
    });

    it('should handle "next week"', () => {
      const result = processNaturalDate('next week');
      expect(result.error).toBeNull();
      expect(result.parsedDate).toBeInstanceOf(Date);
    });

    it('should handle "last month"', () => {
      const result = processNaturalDate('last month');
      expect(result.error).toBeNull();
      expect(result.parsedDate).toBeInstanceOf(Date);
    });

    it('should handle relative expressions like "today + 3 days"', () => {
      const result = processNaturalDate('today + 3 days');
      expect(result.error).toBeNull();
      expect(result.parsedDate).toBeInstanceOf(Date);
    });

    it('should handle relative expressions like "tomorrow - 1 week"', () => {
      const result = processNaturalDate('tomorrow - 1 week');
      expect(result.error).toBeNull();
      expect(result.parsedDate).toBeInstanceOf(Date);
    });

    it('should handle custom date format', () => {
      const result = processNaturalDate('today', 'YYYY年MM月DD日');
      expect(result.error).toBeNull();
      expect(result.value).toContain('年');
      expect(result.value).toContain('月');
      expect(result.value).toContain('日');
    });

    it('should handle invalid natural language', () => {
      const result = processNaturalDate('invalid date string');
      expect(result.error).not.toBeNull();
    });

    it('should handle regular date strings', () => {
      const result = processNaturalDate('2025-01-15');
      expect(result.error).toBeNull();
      expect(result.parsedDate).toBeInstanceOf(Date);
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2025-01-15T14:30:00');

    it('should use default format when no format provided', () => {
      const result = formatDate(testDate);
      expect(result).toBe('2025/01/15');
    });

    it('should format with custom format', () => {
      const result = formatDate(testDate, 'YYYY-MM-DD');
      expect(result).toBe('2025-01-15');
    });

    it('should format with Japanese format', () => {
      const result = formatDate(testDate, 'YYYY年MM月DD日');
      expect(result).toBe('2025年01月15日');
    });
  });

  describe('validateDateFormat', () => {
    it('should validate empty format as invalid', () => {
      const result = validateDateFormat('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Format cannot be empty');
    });

    it('should validate whitespace-only format as invalid', () => {
      const result = validateDateFormat('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Format cannot be empty');
    });

    it('should validate valid formats', () => {
      const validFormats = [
        'YYYY/MM/DD',
        'YYYY-MM-DD',
        'MM/DD/YYYY',
        'YYYY年MM月DD日',
        'YYYY/MM/DD HH:mm'
      ];

      validFormats.forEach(format => {
        const result = validateDateFormat(format);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe('getFormatExamples', () => {
    it('should return array of format examples', () => {
      const examples = getFormatExamples();
      
      expect(Array.isArray(examples)).toBe(true);
      expect(examples.length).toBeGreaterThan(0);
      
      examples.forEach(example => {
        expect(example).toHaveProperty('format');
        expect(example).toHaveProperty('example');
        expect(example).toHaveProperty('description');
        expect(typeof example.format).toBe('string');
        expect(typeof example.example).toBe('string');
        expect(typeof example.description).toBe('string');
      });
    });

    it('should include common date formats', () => {
      const examples = getFormatExamples();
      const formats = examples.map(ex => ex.format);
      
      expect(formats).toContain('YYYY/MM/DD');
      expect(formats).toContain('YYYY-MM-DD');
      expect(formats).toContain('MM/DD/YYYY');
      expect(formats).toContain('YYYY年MM月DD日');
    });
  });
});