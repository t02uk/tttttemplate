import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDynamicVariables } from '../useDynamicVariables'

describe('useDynamicVariables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty variables for empty template', () => {
      const { result } = renderHook(() => useDynamicVariables(''))
      
      expect(result.current.variables).toEqual([])
      expect(result.current.variableValues).toEqual({})
    })

    it('should extract variables from template content', () => {
      const template = 'Hello {{name}}, today is {{date}}'
      const { result } = renderHook(() => useDynamicVariables(template))
      
      expect(result.current.variables).toHaveLength(2)
      expect(result.current.variables[0].name).toBe('name')
      expect(result.current.variables[1].name).toBe('date')
    })
  })

  describe('updateVariableConfig', () => {
    it('should update variable configuration', () => {
      const template = 'Hello {{name}}'
      const { result } = renderHook(() => useDynamicVariables(template))
      
      act(() => {
        result.current.updateVariableConfig('name', {
          uiType: 'number',
          defaultFunction: '42'
        })
      })
      
      const nameVariable = result.current.variables.find(v => v.name === 'name')
      expect(nameVariable?.uiType).toBe('number')
      expect(nameVariable?.defaultFunction).toBe('42')
    })

    it('should not update non-existent variable', () => {
      const template = 'Hello {{name}}'
      const { result } = renderHook(() => useDynamicVariables(template))
      
      const originalVariables = result.current.variables
      
      act(() => {
        result.current.updateVariableConfig('nonexistent', {
          uiType: 'number'
        })
      })
      
      expect(result.current.variables).toEqual(originalVariables)
    })
  })

  describe('updateVariableValue', () => {
    it('should update variable value', () => {
      const template = 'Hello {{name}}'
      const { result } = renderHook(() => useDynamicVariables(template))
      
      act(() => {
        result.current.updateVariableValue('name', 'John')
      })
      
      expect(result.current.variableValues['name']).toBe('John')
    })

    it('should handle multiple variable updates', () => {
      const template = 'Hello {{name}}, today is {{date}}'
      const { result } = renderHook(() => useDynamicVariables(template))
      
      act(() => {
        result.current.updateVariableValue('name', 'John')
        result.current.updateVariableValue('date', '2025-01-15')
      })
      
      expect(result.current.variableValues['name']).toBe('John')
      expect(result.current.variableValues['date']).toBe('2025-01-15')
    })
  })

  describe('syncVariables', () => {
    it('should add new variables when template changes', () => {
      const { result, rerender } = renderHook(
        ({ template }) => useDynamicVariables(template),
        { initialProps: { template: 'Hello {{name}}' } }
      )
      
      expect(result.current.variables).toHaveLength(1)
      expect(result.current.variables[0].name).toBe('name')
      
      // Update template with new variable
      rerender({ template: 'Hello {{name}}, today is {{date}}' })
      
      expect(result.current.variables).toHaveLength(2)
      expect(result.current.variables.find(v => v.name === 'date')).toBeDefined()
    })

    it('should remove variables when they are no longer in template', () => {
      const { result, rerender } = renderHook(
        ({ template }) => useDynamicVariables(template),
        { initialProps: { template: 'Hello {{name}}, today is {{date}}' } }
      )
      
      expect(result.current.variables).toHaveLength(2)
      
      // Update template to remove date variable
      rerender({ template: 'Hello {{name}}' })
      
      expect(result.current.variables).toHaveLength(1)
      expect(result.current.variables[0].name).toBe('name')
    })

    it('should preserve existing variable configurations', () => {
      const { result, rerender } = renderHook(
        ({ template }) => useDynamicVariables(template),
        { initialProps: { template: 'Hello {{name}}' } }
      )
      
      // Update variable config
      act(() => {
        result.current.updateVariableConfig('name', {
          uiType: 'number',
          defaultFunction: '42'
        })
      })
      
      // Store original config for comparison
      result.current.variables.find(v => v.name === 'name')
      
      // Update template with additional variable
      rerender({ template: 'Hello {{name}}, today is {{date}}' })
      
      // Original config should be preserved
      const updatedConfig = result.current.variables.find(v => v.name === 'name')
      expect(updatedConfig?.uiType).toBe('number')
      expect(updatedConfig?.defaultFunction).toBe('42')
    })
  })

  describe('refreshVariableDefaults', () => {
    it('should refresh variable defaults based on functions', () => {
      const template = 'Hello {{name}}'
      const { result } = renderHook(() => useDynamicVariables(template))
      
      // Update variable with function that returns a value
      act(() => {
        result.current.updateVariableConfig('name', {
          defaultFunction: '"John Doe"'
        })
      })
      
      act(() => {
        result.current.refreshVariableDefaults()
      })
      
      expect(result.current.variableValues['name']).toBe('John Doe')
    })

    it('should handle function evaluation errors', () => {
      const template = 'Hello {{name}}'
      const { result } = renderHook(() => useDynamicVariables(template))
      
      // Update variable with invalid function
      act(() => {
        result.current.updateVariableConfig('name', {
          defaultFunction: 'invalid.function()'
        })
      })
      
      act(() => {
        result.current.refreshVariableDefaults()
      })
      
      // Should fall back to current value
      const nameVariable = result.current.variables.find(v => v.name === 'name')
      expect(result.current.variableValues['name']).toBe(nameVariable?.currentValue)
    })
  })

  describe('setVariables and setVariableValues', () => {
    it('should allow direct setting of variables', () => {
      const { result } = renderHook(() => useDynamicVariables(''))
      
      const mockVariables = [
        {
          name: 'test',
          defaultFunction: '"test"',
          uiType: 'text' as const,
          currentValue: 'test'
        }
      ]
      
      act(() => {
        result.current.setVariables(mockVariables)
      })
      
      expect(result.current.variables).toEqual(mockVariables)
    })

    it('should allow direct setting of variable values', () => {
      const { result } = renderHook(() => useDynamicVariables(''))
      
      const mockValues = { name: 'John', date: '2025-01-15' }
      
      act(() => {
        result.current.setVariableValues(mockValues)
      })
      
      expect(result.current.variableValues).toEqual(mockValues)
    })
  })
})