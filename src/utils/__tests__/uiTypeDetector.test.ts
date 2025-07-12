import { describe, it, expect } from 'vitest'
import { detectUIType, getUITypeOptions } from '../uiTypeDetector'

describe('uiTypeDetector', () => {
  describe('detectUIType', () => {
    it('should detect text type for string values', () => {
      expect(detectUIType('hello')).toBe('text')
      expect(detectUIType('')).toBe('text')
      expect(detectUIType('123')).toBe('text')
    })

    it('should detect number type for numeric values', () => {
      expect(detectUIType(42)).toBe('number')
      expect(detectUIType(0)).toBe('number')
      expect(detectUIType(-10)).toBe('number')
      expect(detectUIType(3.14)).toBe('number')
    })

    it('should detect checkbox type for boolean values', () => {
      expect(detectUIType(true)).toBe('checkbox')
      expect(detectUIType(false)).toBe('checkbox')
    })

    it('should detect date type for date values', () => {
      expect(detectUIType(new Date())).toBe('date')
      expect(detectUIType('2025/01/15')).toBe('date')
      expect(detectUIType('2025-01-15')).toBe('date')
    })

    it('should detect date type for natural language date expressions', () => {
      expect(detectUIType('today')).toBe('date')
      expect(detectUIType('tomorrow')).toBe('date')
      expect(detectUIType('yesterday')).toBe('date')
      expect(detectUIType('next week')).toBe('date')
      expect(detectUIType('last month')).toBe('date')
      expect(detectUIType('today + 3 days')).toBe('date')
    })

    it('should handle case insensitive natural language dates', () => {
      expect(detectUIType('TODAY')).toBe('date')
      expect(detectUIType('Tomorrow')).toBe('date')
      expect(detectUIType('NEXT WEEK')).toBe('date')
    })

    it('should detect radio type for primitive arrays', () => {
      expect(detectUIType(['apple', 'banana', 'orange'])).toBe('radio')
      expect(detectUIType([1, 2, 3])).toBe('radio')
      expect(detectUIType([true, false])).toBe('radio')
    })

    it('should detect select type for object arrays', () => {
      expect(detectUIType([
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' }
      ])).toBe('select')
    })

    it('should handle empty arrays', () => {
      expect(detectUIType([])).toBe('radio')
    })

    it('should handle null values', () => {
      expect(detectUIType(null)).toBe('text')
    })

    it('should handle undefined values', () => {
      expect(detectUIType(undefined)).toBe('text')
    })

    it('should handle object values', () => {
      expect(detectUIType({ key: 'value' })).toBe('text')
    })

    it('should handle mixed arrays with objects', () => {
      expect(detectUIType([
        { value: 'a', label: 'Option A' },
        'plain string'
      ])).toBe('select')
    })

    it('should handle arrays with null objects', () => {
      expect(detectUIType([null, undefined])).toBe('radio')
    })
  })

  describe('getUITypeOptions', () => {
    it('should return array options for arrays', () => {
      const options = ['apple', 'banana', 'orange']
      expect(getUITypeOptions(options)).toEqual(options)
    })

    it('should return object array options', () => {
      const options = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' }
      ]
      expect(getUITypeOptions(options)).toEqual(options)
    })

    it('should return undefined for non-array values', () => {
      expect(getUITypeOptions('string')).toBeUndefined()
      expect(getUITypeOptions(42)).toBeUndefined()
      expect(getUITypeOptions(true)).toBeUndefined()
      expect(getUITypeOptions(null)).toBeUndefined()
      expect(getUITypeOptions(undefined)).toBeUndefined()
      expect(getUITypeOptions({ key: 'value' })).toBeUndefined()
    })

    it('should return empty array for empty arrays', () => {
      expect(getUITypeOptions([])).toEqual([])
    })
  })
})