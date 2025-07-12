import { describe, it, expect } from 'vitest'
import { evaluateJavaScript, safeEvaluate } from '../jsEvaluator'

describe('jsEvaluator', () => {
  describe('evaluateJavaScript', () => {
    it('should evaluate simple string expression', () => {
      const result = evaluateJavaScript('"Hello World"')
      
      expect(result.value).toBe('Hello World')
      expect(result.error).toBeNull()
    })

    it('should evaluate number expression', () => {
      const result = evaluateJavaScript('42')
      
      expect(result.value).toBe(42)
      expect(result.error).toBeNull()
    })

    it('should evaluate boolean expression', () => {
      const result = evaluateJavaScript('true')
      
      expect(result.value).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should evaluate array expression', () => {
      const result = evaluateJavaScript('["apple", "banana", "orange"]')
      
      expect(result.value).toEqual(['apple', 'banana', 'orange'])
      expect(result.error).toBeNull()
    })

    it('should evaluate object array expression', () => {
      const result = evaluateJavaScript('[{value: "a", label: "Option A"}, {value: "b", label: "Option B"}]')
      
      expect(result.value).toEqual([
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' }
      ])
      expect(result.error).toBeNull()
    })

    it('should evaluate mathematical expression', () => {
      const result = evaluateJavaScript('10 + 5')
      
      expect(result.value).toBe(15)
      expect(result.error).toBeNull()
    })

    it('should handle function calls', () => {
      const result = evaluateJavaScript('Math.max(1, 2, 3)')
      
      expect(result.value).toBe(3)
      expect(result.error).toBeNull()
    })

    it('should handle date expressions', () => {
      const result = evaluateJavaScript('new Date(2025, 0, 15).getFullYear()')
      
      expect(result.value).toBe(2025)
      expect(result.error).toBeNull()
    })

    it('should return error for invalid expression', () => {
      const result = evaluateJavaScript('invalid.expression()')
      
      expect(result.value).toBeNull()
      expect(result.error).toBeTruthy()
    })

    it('should return error for syntax error', () => {
      const result = evaluateJavaScript('["unclosed array"')
      
      expect(result.value).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('safeEvaluate', () => {
    it('should return evaluated value for valid expression', () => {
      const result = safeEvaluate('"Hello World"')
      
      expect(result).toBe('Hello World')
    })

    it('should return fallback value for invalid expression', () => {
      const result = safeEvaluate('invalid.expression()', 'fallback')
      
      expect(result).toBe('fallback')
    })

    it('should use default fallback value', () => {
      const result = safeEvaluate('invalid.expression()')
      
      expect(result).toBe('')
    })

    it('should handle null fallback value', () => {
      const result = safeEvaluate('invalid.expression()', null)
      
      expect(result).toBeNull()
    })

    it('should handle undefined fallback value', () => {
      const result = safeEvaluate('invalid.expression()', undefined)
      
      expect(result).toBeUndefined()
    })
  })
})