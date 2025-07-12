import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Handlebars for testing
(globalThis as any).window = (globalThis as any).window || {};
((globalThis as any).window as any).Handlebars = {
  compile: (template: string) => {
    return (context: any) => {
      // Simple mock implementation for testing
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return context[key] || match;
      });
    };
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

(globalThis as any).localStorage = localStorageMock as any;