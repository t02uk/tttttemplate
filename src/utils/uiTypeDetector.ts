import type { UIType } from '../types/template';
import { processNaturalDate } from './dateProcessor';

export function detectUIType(value: unknown): UIType {
  if (typeof value === 'string') {
    // Check if string looks like a date
    if (isDateString(value)) {
      return 'date';
    }
    return 'text';
  }
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'checkbox';
  if (value instanceof Date) return 'date';
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      return 'select';
    }
    return 'radio';
  }
  return 'text';
}

function isDateString(value: string): boolean {
  // Check natural language date expressions first
  const naturalDateKeywords = [
    'today', 'tomorrow', 'yesterday', 'now',
    'next monday', 'next tuesday', 'next wednesday', 'next thursday', 'next friday', 'next saturday', 'next sunday',
    'last monday', 'last tuesday', 'last wednesday', 'last thursday', 'last friday', 'last saturday', 'last sunday',
    'this monday', 'this tuesday', 'this wednesday', 'this thursday', 'this friday', 'this saturday', 'this sunday',
    'next week', 'last week', 'next month', 'last month', 'next year', 'last year'
  ];
  
  const lowerValue = value.toLowerCase().trim();
  if (naturalDateKeywords.some(keyword => lowerValue.includes(keyword))) {
    return true;
  }
  
  // Check relative date expressions (e.g., "today + 3 days", "tomorrow - 1 week")
  if (/^(today|tomorrow|yesterday)\s*[+-]\s*\d+\s*(day|week|month|year)s?$/i.test(lowerValue)) {
    return true;
  }
  
  // Check common date formats
  const dateFormats = [
    /^\d{4}\/\d{1,2}\/\d{1,2}$/,        // YYYY/MM/DD or YYYY/M/D
    /^\d{4}-\d{1,2}-\d{1,2}$/,          // YYYY-MM-DD or YYYY-M-D
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,        // MM/DD/YYYY or M/D/YYYY
    /^\d{1,2}-\d{1,2}-\d{4}$/,          // MM-DD-YYYY or M-D-YYYY
    /^\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{1,2}(:\d{1,2})?$/, // YYYY/MM/DD HH:MM(:SS)
    /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}(:\d{1,2})?(\.\d{3})?Z?$/, // ISO format
  ];
  
  // Check standard date formats
  if (dateFormats.some(format => format.test(value)) && !isNaN(new Date(value).getTime())) {
    return true;
  }
  
  // Check if the string can be parsed as a date using our date processor
  const result = processNaturalDate(value);
  if (result.error === null && result.parsedDate) {
    return true;
  }
  
  return false;
}

export function getUITypeOptions(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) {
    return value;
  }
  return undefined;
}