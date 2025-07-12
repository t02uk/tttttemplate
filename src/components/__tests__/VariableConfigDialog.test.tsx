import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import { VariableConfigDialog } from '../VariableConfigDialog'
import type { VariableConfig } from '../../types/template'

// Mock the date processor
vi.mock('../../utils/dateProcessor', () => ({
  validateDateFormat: vi.fn((format: string) => {
    if (!format.trim()) return { isValid: false, error: 'Format cannot be empty' }
    if (format === 'invalid') return { isValid: false, error: 'Invalid format' }
    return { isValid: true }
  }),
  getFormatExamples: vi.fn(() => [
    { format: 'YYYY/MM/DD', example: '2025/01/15', description: '年/月/日' },
    { format: 'YYYY-MM-DD', example: '2025-01-15', description: '年-月-日' },
    { format: 'YYYY年MM月DD日', example: '2025年01月15日', description: '日本語形式' }
  ]),
  processNaturalDate: vi.fn((_input: string, format?: string) => ({
    value: format === 'YYYY年MM月DD日' ? '2025年01月15日' : '2025/01/15',
    error: null,
    parsedDate: new Date('2025-01-15')
  }))
}))

// Mock the js evaluator
vi.mock('../../utils/jsEvaluator', () => ({
  evaluateJavaScript: vi.fn((code: string) => {
    if (code === '"today"') return { value: 'today', error: null }
    if (code === 'invalid code') return { value: null, error: 'Syntax error' }
    if (code === 'new Date()') return { value: new Date('2025-01-15'), error: null }
    return { value: code, error: null }
  })
}))

describe('VariableConfigDialog', () => {
  const mockVariable: VariableConfig = {
    name: 'testVar',
    defaultFunction: '"test value"',
    uiType: 'text',
    currentValue: 'test value',
    dateFormat: 'YYYY/MM/DD'
  }

  const mockProps = {
    variable: mockVariable,
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<VariableConfigDialog {...mockProps} isOpen={false} />)
      
      expect(screen.queryByText('Configure Variable: testVar')).not.toBeInTheDocument()
    })

    it('should not render when variable is null', () => {
      render(<VariableConfigDialog {...mockProps} variable={null} />)
      
      expect(screen.queryByText(/Configure Variable/)).not.toBeInTheDocument()
    })

    it('should render dialog when open with variable', () => {
      render(<VariableConfigDialog {...mockProps} />)
      
      expect(screen.getByText('Configure Variable: testVar')).toBeInTheDocument()
      expect(screen.getByText('Default Function:')).toBeInTheDocument()
      expect(screen.getByDisplayValue('"test value"')).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<VariableConfigDialog {...mockProps} />)
      
      expect(screen.getByText('×')).toBeInTheDocument()
    })

    it('should render test and save buttons', () => {
      render(<VariableConfigDialog {...mockProps} />)
      
      expect(screen.getByText('Test Function')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('function testing', () => {
    it('should test function and show results', async () => {
      render(<VariableConfigDialog {...mockProps} />)
      
      const testButton = screen.getByText('Test Function')
      fireEvent.click(testButton)
      
      await waitFor(() => {
        expect(screen.getByText('Test Result:')).toBeInTheDocument()
        expect(screen.getByText(/Value:/)).toBeInTheDocument()
        expect(screen.getByText(/Type:/)).toBeInTheDocument()
        expect(screen.getByText(/UI Type:/)).toBeInTheDocument()
      })
    })

    it('should show error when function fails', async () => {
      const errorVariable = {
        ...mockVariable,
        defaultFunction: 'invalid code'
      }
      
      render(<VariableConfigDialog {...mockProps} variable={errorVariable} />)
      
      const testButton = screen.getByText('Test Function')
      fireEvent.click(testButton)
      
      await waitFor(() => {
        expect(screen.getByText('Test Result:')).toBeInTheDocument()
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
        expect(screen.getByText('Syntax error')).toBeInTheDocument()
      })
    })
  })

  describe('date format configuration', () => {
    it('should show date format section for date types', async () => {
      const dateVariable = {
        ...mockVariable,
        defaultFunction: '"today"',
        uiType: 'date' as const
      }
      
      render(<VariableConfigDialog {...mockProps} variable={dateVariable} />)
      
      const testButton = screen.getByText('Test Function')
      fireEvent.click(testButton)
      
      await waitFor(() => {
        expect(screen.getByText('Date Format:')).toBeInTheDocument()
        expect(screen.getByDisplayValue('YYYY/MM/DD')).toBeInTheDocument()
      })
    })

    it('should show format examples when configuring dates', async () => {
      const dateVariable = {
        ...mockVariable,
        defaultFunction: '"today"',
        uiType: 'date' as const
      }
      
      render(<VariableConfigDialog {...mockProps} variable={dateVariable} />)
      
      const testButton = screen.getByText('Test Function')
      fireEvent.click(testButton)
      
      await waitFor(() => {
        expect(screen.getByText('Format Examples:')).toBeInTheDocument()
        expect(screen.getByText('YYYY/MM/DD')).toBeInTheDocument()
        expect(screen.getByText('YYYY-MM-DD')).toBeInTheDocument()
        expect(screen.getByText('YYYY年MM月DD日')).toBeInTheDocument()
      })
    })

    it('should allow clicking format examples to set format', async () => {
      const dateVariable = {
        ...mockVariable,
        defaultFunction: '"today"',
        uiType: 'date' as const
      }
      
      render(<VariableConfigDialog {...mockProps} variable={dateVariable} />)
      
      const testButton = screen.getByText('Test Function')
      fireEvent.click(testButton)
      
      await waitFor(() => {
        const formatExample = screen.getByText('YYYY年MM月DD日')
        fireEvent.click(formatExample)
        
        expect(screen.getByDisplayValue('YYYY年MM月DD日')).toBeInTheDocument()
      })
    })

    it('should show format preview when format is valid', async () => {
      const dateVariable = {
        ...mockVariable,
        defaultFunction: '"today"',
        uiType: 'date' as const
      }
      
      render(<VariableConfigDialog {...mockProps} variable={dateVariable} />)
      
      const testButton = screen.getByText('Test Function')
      fireEvent.click(testButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Preview:/)).toBeInTheDocument()
      })
    })

    it('should show format error when format is invalid', async () => {
      const dateVariable = {
        ...mockVariable,
        defaultFunction: '"today"',
        uiType: 'date' as const,
        dateFormat: 'invalid'
      }
      
      render(<VariableConfigDialog {...mockProps} variable={dateVariable} />)
      
      const testButton = screen.getByText('Test Function')
      fireEvent.click(testButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
        expect(screen.getByText('Invalid format')).toBeInTheDocument()
      })
    })
  })

  describe('function examples', () => {
    it('should show function examples', () => {
      render(<VariableConfigDialog {...mockProps} />)
      
      expect(screen.getByText('Function Examples:')).toBeInTheDocument()
      expect(screen.getByText('"Hello World"')).toBeInTheDocument()
      expect(screen.getByText('"Today"')).toBeInTheDocument()
      expect(screen.getByText('"Tomorrow"')).toBeInTheDocument()
      expect(screen.getByText('"Today + 3 days"')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<VariableConfigDialog {...mockProps} />)
      
      const closeButton = screen.getByText('×')
      fireEvent.click(closeButton)
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })

    it('should call onClose when cancel button is clicked', () => {
      render(<VariableConfigDialog {...mockProps} />)
      
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      expect(mockProps.onClose).toHaveBeenCalled()
    })

    it('should update function text when typing', () => {
      render(<VariableConfigDialog {...mockProps} />)
      
      const textarea = screen.getByDisplayValue('"test value"')
      fireEvent.change(textarea, { target: { value: '"new value"' } })
      
      expect(screen.getByDisplayValue('"new value"')).toBeInTheDocument()
    })

    it('should save configuration when save button is clicked', () => {
      render(<VariableConfigDialog {...mockProps} />)
      
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)
      
      expect(mockProps.onSave).toHaveBeenCalled()
      expect(mockProps.onClose).toHaveBeenCalled()
    })

    it('should prevent save with function error', () => {
      // Mock window.alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      const errorVariable = {
        ...mockVariable,
        defaultFunction: 'invalid code'
      }
      
      render(<VariableConfigDialog {...mockProps} variable={errorVariable} />)
      
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)
      
      expect(alertSpy).toHaveBeenCalledWith('Error in function: Syntax error')
      expect(mockProps.onSave).not.toHaveBeenCalled()
      
      alertSpy.mockRestore()
    })
  })
});