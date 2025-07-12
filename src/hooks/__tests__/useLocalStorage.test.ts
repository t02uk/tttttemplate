import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'
import { mockTemplate } from '../../test/test-utils'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty arrays when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage())
      
      expect(result.current.templates).toEqual([])
      expect(result.current.currentTemplate).toBeNull()
    })

    it('should load templates from localStorage on initialization', () => {
      const mockTemplates = [mockTemplate]
      localStorage.setItem('templates', JSON.stringify(mockTemplates))
      
      const { result } = renderHook(() => useLocalStorage())
      
      expect(result.current.templates).toEqual(mockTemplates)
    })

    it('should load current template from localStorage on initialization', () => {
      localStorage.setItem('currentTemplate', JSON.stringify(mockTemplate))
      
      const { result } = renderHook(() => useLocalStorage())
      
      expect(result.current.currentTemplate).toEqual(mockTemplate)
    })
  })

  describe('saveTemplate', () => {
    it('should save new template to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage())
      
      act(() => {
        result.current.saveTemplate(mockTemplate)
      })
      
      expect(result.current.templates).toContain(mockTemplate)
      expect(localStorage.setItem).toHaveBeenCalledWith('templates', JSON.stringify([mockTemplate]))
    })

    it('should update existing template', () => {
      const { result } = renderHook(() => useLocalStorage())
      
      // Save initial template
      act(() => {
        result.current.saveTemplate(mockTemplate)
      })
      
      // Update template
      const updatedTemplate = { ...mockTemplate, name: 'Updated Template' }
      act(() => {
        result.current.saveTemplate(updatedTemplate)
      })
      
      expect(result.current.templates).toHaveLength(1)
      expect(result.current.templates[0].name).toBe('Updated Template')
    })
  })

  describe('deleteTemplate', () => {
    it('should delete template from localStorage', () => {
      const { result } = renderHook(() => useLocalStorage())
      
      // Save template first
      act(() => {
        result.current.saveTemplate(mockTemplate)
      })
      
      // Delete template
      act(() => {
        result.current.deleteTemplate(mockTemplate.id)
      })
      
      expect(result.current.templates).toHaveLength(0)
    })

    it('should clear current template when deleting current template', () => {
      const { result } = renderHook(() => useLocalStorage())
      
      // Save and set as current
      act(() => {
        result.current.saveTemplate(mockTemplate)
        result.current.setCurrentTemplate(mockTemplate)
      })
      
      expect(result.current.currentTemplate).toEqual(mockTemplate)
      
      // Delete current template
      act(() => {
        result.current.deleteTemplate(mockTemplate.id)
      })
      
      expect(result.current.currentTemplate).toBeNull()
    })
  })

  describe('setCurrentTemplate', () => {
    it('should set current template in localStorage', () => {
      const { result } = renderHook(() => useLocalStorage())
      
      act(() => {
        result.current.setCurrentTemplate(mockTemplate)
      })
      
      expect(result.current.currentTemplate).toEqual(mockTemplate)
      expect(localStorage.setItem).toHaveBeenCalledWith('currentTemplate', JSON.stringify(mockTemplate))
    })

    it('should clear current template when setting to null', () => {
      const { result } = renderHook(() => useLocalStorage())
      
      // Set template first
      act(() => {
        result.current.setCurrentTemplate(mockTemplate)
      })
      
      expect(result.current.currentTemplate).toEqual(mockTemplate)
      
      // Clear template
      act(() => {
        result.current.setCurrentTemplate(null)
      })
      
      expect(result.current.currentTemplate).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('currentTemplate')
    })
  })

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const { result } = renderHook(() => useLocalStorage())
      
      // Should not throw error
      expect(() => {
        act(() => {
          result.current.saveTemplate(mockTemplate)
        })
      }).not.toThrow()
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('templates', 'invalid json')
      
      const { result } = renderHook(() => useLocalStorage())
      
      // Should initialize with empty array instead of crashing
      expect(result.current.templates).toEqual([])
    })
  })
})