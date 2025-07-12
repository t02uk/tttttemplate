import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import { VariableForm } from '../VariableForm'
import { mockVariableConfig, mockVariableValues } from '../../test/test-utils'

describe('VariableForm', () => {
  const mockProps = {
    variables: [mockVariableConfig],
    variableValues: mockVariableValues,
    onVariableChange: vi.fn(),
    onConfigureVariable: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render variables header', () => {
      render(<VariableForm {...mockProps} />)
      
      expect(screen.getByText('Variables')).toBeInTheDocument()
    })

    it('should render variable items', () => {
      render(<VariableForm {...mockProps} />)
      
      expect(screen.getByText('testVar:')).toBeInTheDocument()
      expect(screen.getByText('⚙️')).toBeInTheDocument()
    })

    it('should show empty message when no variables', () => {
      render(<VariableForm {...mockProps} variables={[]} />)
      
      expect(screen.getByText('No variables found in template')).toBeInTheDocument()
    })
  })

  describe('input types', () => {
    it('should render text input for text type', () => {
      const textVariable = {
        ...mockVariableConfig,
        uiType: 'text' as const,
        currentValue: 'test value'
      }
      
      render(<VariableForm {...mockProps} variables={[textVariable]} />)
      
      const input = screen.getByDisplayValue('test value')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render number input for number type', () => {
      const numberVariable = {
        ...mockVariableConfig,
        uiType: 'number' as const,
        currentValue: 42
      }
      
      render(<VariableForm {...mockProps} variables={[numberVariable]} />)
      
      const input = screen.getByDisplayValue('42')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render checkbox for boolean type', () => {
      const booleanVariable = {
        ...mockVariableConfig,
        uiType: 'checkbox' as const,
        currentValue: true
      }
      
      render(<VariableForm {...mockProps} variables={[booleanVariable]} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('should render radio buttons for radio type', () => {
      const radioVariable = {
        ...mockVariableConfig,
        uiType: 'radio' as const,
        options: ['option1', 'option2', 'option3'],
        currentValue: 'option1'
      }
      
      render(<VariableForm {...mockProps} variables={[radioVariable]} />)
      
      const radio1 = screen.getByDisplayValue('option1')
      const radio2 = screen.getByDisplayValue('option2')
      const radio3 = screen.getByDisplayValue('option3')
      
      expect(radio1).toBeChecked()
      expect(radio2).not.toBeChecked()
      expect(radio3).not.toBeChecked()
    })

    it('should render select dropdown for select type', () => {
      const selectVariable = {
        ...mockVariableConfig,
        uiType: 'select' as const,
        options: [
          { value: 'val1', label: 'Option 1' },
          { value: 'val2', label: 'Option 2' }
        ],
        currentValue: 'val1'
      }
      
      render(<VariableForm {...mockProps} variables={[selectVariable]} />)
      
      const select = screen.getByDisplayValue('val1')
      expect(select.tagName).toBe('SELECT')
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onVariableChange when text input changes', () => {
      render(<VariableForm {...mockProps} />)
      
      const input = screen.getByDisplayValue('test value')
      fireEvent.change(input, { target: { value: 'new value' } })
      
      expect(mockProps.onVariableChange).toHaveBeenCalledWith('testVar', 'new value')
    })

    it('should call onVariableChange when number input changes', () => {
      const numberVariable = {
        ...mockVariableConfig,
        uiType: 'number' as const,
        currentValue: 42
      }
      
      render(<VariableForm {...mockProps} variables={[numberVariable]} />)
      
      const input = screen.getByDisplayValue('42')
      fireEvent.change(input, { target: { value: '100' } })
      
      expect(mockProps.onVariableChange).toHaveBeenCalledWith('testVar', 100)
    })

    it('should call onVariableChange when checkbox changes', () => {
      const booleanVariable = {
        ...mockVariableConfig,
        uiType: 'checkbox' as const,
        currentValue: true
      }
      
      render(<VariableForm {...mockProps} variables={[booleanVariable]} />)
      
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      
      expect(mockProps.onVariableChange).toHaveBeenCalledWith('testVar', false)
    })

    it('should call onConfigureVariable when config button is clicked', () => {
      render(<VariableForm {...mockProps} />)
      
      const configButton = screen.getByText('⚙️')
      fireEvent.click(configButton)
      
      expect(mockProps.onConfigureVariable).toHaveBeenCalledWith('testVar')
    })
  })

  describe('date input', () => {
    it('should render date picker for date type', () => {
      const dateVariable = {
        ...mockVariableConfig,
        uiType: 'date' as const,
        currentValue: '2025/01/15',
        dateFormat: 'YYYY/MM/DD'
      }
      
      render(<VariableForm {...mockProps} variables={[dateVariable]} />)
      
      expect(screen.getByText('Format: YYYY/MM/DD')).toBeInTheDocument()
      expect(screen.getByText('📅 Picker')).toBeInTheDocument()
      expect(screen.getByText('✍️ Natural')).toBeInTheDocument()
    })

    it('should use default date format when not specified', () => {
      const dateVariable = {
        ...mockVariableConfig,
        uiType: 'date' as const,
        currentValue: '2025/01/15'
      }
      
      render(<VariableForm {...mockProps} variables={[dateVariable]} />)
      
      expect(screen.getByText('Format: YYYY/MM/DD')).toBeInTheDocument()
    })

    it('should show natural language input when natural button is clicked', () => {
      const dateVariable = {
        ...mockVariableConfig,
        uiType: 'date' as const,
        currentValue: '2025/01/15',
        dateFormat: 'YYYY/MM/DD'
      }
      
      render(<VariableForm {...mockProps} variables={[dateVariable]} />)
      
      const naturalButton = screen.getByText('✍️ Natural')
      fireEvent.click(naturalButton)
      
      expect(screen.getByPlaceholderText(/Type: Today, Tomorrow/)).toBeInTheDocument()
      expect(screen.getByText(/Examples: "Today", "Tomorrow"/)).toBeInTheDocument()
    })

    it('should show current value in date format info', () => {
      const dateVariable = {
        ...mockVariableConfig,
        uiType: 'date' as const,
        currentValue: '2025/01/15',
        dateFormat: 'YYYY/MM/DD'
      }
      
      render(<VariableForm {...mockProps} variables={[dateVariable]} />)
      
      expect(screen.getByText(/Current: 2025\/01\/15/)).toBeInTheDocument()
    })

    it('should handle custom date formats', () => {
      const dateVariable = {
        ...mockVariableConfig,
        uiType: 'date' as const,
        currentValue: '2025年01月15日',
        dateFormat: 'YYYY年MM月DD日'
      }
      
      render(<VariableForm {...mockProps} variables={[dateVariable]} />)
      
      expect(screen.getByText('Format: YYYY年MM月DD日')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty variable values', () => {
      render(<VariableForm {...mockProps} variableValues={{}} />)
      
      const input = screen.getByDisplayValue('')
      expect(input).toBeInTheDocument()
    })

    it('should handle null variable values', () => {
      const variableWithNull = {
        ...mockVariableConfig,
        currentValue: null
      }
      
      render(<VariableForm {...mockProps} variables={[variableWithNull]} />)
      
      const input = screen.getByDisplayValue('')
      expect(input).toBeInTheDocument()
    })

    it('should handle undefined options for radio/select', () => {
      const radioVariable = {
        ...mockVariableConfig,
        uiType: 'radio' as const,
        options: undefined
      }
      
      render(<VariableForm {...mockProps} variables={[radioVariable]} />)
      
      // Should not crash and should render empty radio group
      expect(screen.getByText('testVar:')).toBeInTheDocument()
    })
  })
})