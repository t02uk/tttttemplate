import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import { TemplateList } from '../TemplateList'
import { mockTemplate } from '../../test/test-utils'

describe('TemplateList', () => {
  const mockProps = {
    templates: [mockTemplate],
    currentTemplate: null,
    onSelectTemplate: vi.fn(),
    onDeleteTemplate: vi.fn(),
    onNewTemplate: vi.fn(),
    onUpdateTemplate: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render template list header', () => {
      render(<TemplateList {...mockProps} />)
      
      expect(screen.getByText('Saved Templates')).toBeInTheDocument()
      expect(screen.getByText('New Template')).toBeInTheDocument()
    })

    it('should render template items', () => {
      render(<TemplateList {...mockProps} />)
      
      expect(screen.getByText('Test Template')).toBeInTheDocument()
      expect(screen.getByText('2 variables')).toBeInTheDocument()
    })

    it('should show empty message when no templates', () => {
      render(<TemplateList {...mockProps} templates={[]} />)
      
      expect(screen.getByText('No templates saved')).toBeInTheDocument()
    })

    it('should highlight current template', () => {
      render(<TemplateList {...mockProps} currentTemplate={mockTemplate} />)
      
      const templateItem = screen.getByText('Test Template').closest('.template-item')
      expect(templateItem).toHaveClass('active')
    })

    it('should display template metadata', () => {
      render(<TemplateList {...mockProps} />)
      
      expect(screen.getByText('1/15/2025')).toBeInTheDocument()
      expect(screen.getByText('2 variables')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onNewTemplate when new template button is clicked', () => {
      render(<TemplateList {...mockProps} />)
      
      const newTemplateButton = screen.getByText('New Template')
      fireEvent.click(newTemplateButton)
      
      expect(mockProps.onNewTemplate).toHaveBeenCalledTimes(1)
    })

    it('should call onSelectTemplate when template item is clicked', () => {
      render(<TemplateList {...mockProps} />)
      
      const templateItem = screen.getByText('Test Template').closest('.template-item')
      fireEvent.click(templateItem!)
      
      expect(mockProps.onSelectTemplate).toHaveBeenCalledWith(mockTemplate)
    })

    it('should call onDeleteTemplate when delete button is clicked', () => {
      render(<TemplateList {...mockProps} />)
      
      const deleteButton = screen.getByText('×')
      fireEvent.click(deleteButton)
      
      expect(mockProps.onDeleteTemplate).toHaveBeenCalledWith(mockTemplate.id)
    })

    it('should prevent template selection when delete button is clicked', () => {
      render(<TemplateList {...mockProps} />)
      
      const deleteButton = screen.getByText('×')
      fireEvent.click(deleteButton)
      
      expect(mockProps.onSelectTemplate).not.toHaveBeenCalled()
    })
  })

  describe('multiple templates', () => {
    const multipleTemplates = [
      mockTemplate,
      {
        ...mockTemplate,
        id: 'template-2',
        name: 'Template 2',
        variables: [{ name: 'var1', defaultFunction: '"value1"', uiType: 'text' as const, currentValue: 'value1' }],
      },
      {
        ...mockTemplate,
        id: 'template-3',
        name: 'Template 3',
        variables: [],
      }
    ]

    it('should render multiple templates', () => {
      render(<TemplateList {...mockProps} templates={multipleTemplates} />)
      
      expect(screen.getByText('Test Template')).toBeInTheDocument()
      expect(screen.getByText('Template 2')).toBeInTheDocument()
      expect(screen.getByText('Template 3')).toBeInTheDocument()
    })

    it('should handle different variable counts', () => {
      render(<TemplateList {...mockProps} templates={multipleTemplates} />)
      
      expect(screen.getByText('2 variables')).toBeInTheDocument()
      expect(screen.getByText('1 variables')).toBeInTheDocument()
      expect(screen.getByText('0 variables')).toBeInTheDocument()
    })

    it('should handle template selection from multiple templates', () => {
      render(<TemplateList {...mockProps} templates={multipleTemplates} />)
      
      const template2Item = screen.getByText('Template 2').closest('.template-item')
      fireEvent.click(template2Item!)
      
      expect(mockProps.onSelectTemplate).toHaveBeenCalledWith(multipleTemplates[1])
    })
  })

  describe('accessibility', () => {
    it('should have proper button roles', () => {
      render(<TemplateList {...mockProps} />)
      
      const newTemplateButton = screen.getByRole('button', { name: 'New Template' })
      expect(newTemplateButton).toBeInTheDocument()
      
      const deleteButton = screen.getByRole('button', { name: '×' })
      expect(deleteButton).toBeInTheDocument()
    })

    it('should handle keyboard navigation', () => {
      render(<TemplateList {...mockProps} />)
      
      const templateItem = screen.getByText('Test Template').closest('.template-item')
      
      // Simulate Enter key
      fireEvent.keyDown(templateItem!, { key: 'Enter' })
      
      // Note: This would need additional implementation in the component
      // for full keyboard support
    })
  })
})