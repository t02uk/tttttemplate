import { describe, it, expect } from 'vitest'
import { extractVariables } from '../variableExtractor'

describe('variableExtractor', () => {
  describe('extractVariables', () => {
    it('should extract variables from template', () => {
      const template = 'Hello {{name}}, today is {{date}}'
      const variables = extractVariables(template)
      
      expect(variables).toEqual(['name', 'date'])
    })

    it('should handle template with no variables', () => {
      const template = 'Hello world'
      const variables = extractVariables(template)
      
      expect(variables).toEqual([])
    })

    it('should handle template with duplicate variables', () => {
      const template = 'Hello {{name}}, nice to meet you {{name}}'
      const variables = extractVariables(template)
      
      expect(variables).toEqual(['name'])
    })

    it('should handle variables with spaces', () => {
      const template = 'Hello {{ name }}, today is {{ date }}'
      const variables = extractVariables(template)
      
      expect(variables).toEqual(['name', 'date'])
    })

    it('should handle complex template with multiple variables', () => {
      const template = `
        Name: {{firstName}} {{lastName}}
        Date: {{currentDate}}
        Weather: {{weather}}
        Temperature: {{temperature}}°C
      `
      const variables = extractVariables(template)
      
      expect(variables).toEqual(['firstName', 'lastName', 'currentDate', 'weather', 'temperature'])
    })

    it('should handle empty template', () => {
      const template = ''
      const variables = extractVariables(template)
      
      expect(variables).toEqual([])
    })

    it('should handle template with malformed variables', () => {
      const template = 'Hello {name}, today is {{date}}'
      const variables = extractVariables(template)
      
      expect(variables).toEqual(['date'])
    })

    it('should handle template with nested braces', () => {
      const template = 'Hello {{name}}, {{{extra}}}'
      const variables = extractVariables(template)
      
      expect(variables).toEqual(['name'])
    })
  })
})