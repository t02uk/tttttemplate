import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHandlebars } from '../useHandlebars'

describe('useHandlebars', () => {
  describe('compileTemplate', () => {
    it('should compile template with variables', () => {
      const { result } = renderHook(() => useHandlebars())
      
      const template = 'Hello {{name}}, today is {{date}}'
      const variables = { name: 'John', date: '2025-01-15' }
      
      const compiled = result.current.compileTemplate(template, variables)
      
      expect(compiled).toBe('Hello John, today is 2025-01-15')
    })

    it('should handle template with no variables', () => {
      const { result } = renderHook(() => useHandlebars())
      
      const template = 'Hello world'
      const variables = {}
      
      const compiled = result.current.compileTemplate(template, variables)
      
      expect(compiled).toBe('Hello world')
    })

    it('should handle missing variables', () => {
      const { result } = renderHook(() => useHandlebars())
      
      const template = 'Hello {{name}}, today is {{date}}'
      const variables = { name: 'John' }
      
      const compiled = result.current.compileTemplate(template, variables)
      
      expect(compiled).toBe('Hello John, today is {{date}}')
    })

    it('should handle empty template', () => {
      const { result } = renderHook(() => useHandlebars())
      
      const template = ''
      const variables = { name: 'John' }
      
      const compiled = result.current.compileTemplate(template, variables)
      
      expect(compiled).toBe('')
    })

    it('should handle complex template with multiple variables', () => {
      const { result } = renderHook(() => useHandlebars())
      
      const template = `
        Name: {{firstName}} {{lastName}}
        Date: {{currentDate}}
        Weather: {{weather}}
      `
      const variables = {
        firstName: 'John',
        lastName: 'Doe',
        currentDate: '2025-01-15',
        weather: 'sunny'
      }
      
      const compiled = result.current.compileTemplate(template, variables)
      
      expect(compiled).toContain('Name: John Doe')
      expect(compiled).toContain('Date: 2025-01-15')
      expect(compiled).toContain('Weather: sunny')
    })

    it('should return error message when Handlebars is not available', () => {
      // Mock window.Handlebars to be undefined
      const originalHandlebars = (globalThis as any).window.Handlebars
      ;(globalThis as any).window.Handlebars = undefined
      
      const { result } = renderHook(() => useHandlebars())
      
      const template = 'Hello {{name}}'
      const variables = { name: 'John' }
      
      const compiled = result.current.compileTemplate(template, variables)
      
      expect(compiled).toContain('Error:')
      expect(compiled).toContain('Handlebars is not loaded')
      
      // Restore original
      ;(globalThis as any).window.Handlebars = originalHandlebars
    })
  })
})