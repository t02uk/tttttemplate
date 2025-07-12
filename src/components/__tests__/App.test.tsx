import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import App from '../../App'

// Mock the hooks
vi.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: () => ({
    templates: [],
    currentTemplate: null,
    saveTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
    setCurrentTemplate: vi.fn(),
  })
}))

vi.mock('../../hooks/useDynamicVariables', () => ({
  useDynamicVariables: () => ({
    variables: [],
    variableValues: {},
    updateVariableConfig: vi.fn(),
    updateVariableValue: vi.fn(),
    refreshVariableDefaults: vi.fn(),
    setVariables: vi.fn(),
    setVariableValues: vi.fn(),
  })
}))

describe('App', () => {
  describe('rendering', () => {
    it('should render main app components', () => {
      render(<App />)
      
      expect(screen.getByText('Template Engine App')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('should render all four panels', () => {
      render(<App />)
      
      expect(screen.getByText('Saved Templates')).toBeInTheDocument()
      expect(screen.getByText('Template Editor')).toBeInTheDocument()
      expect(screen.getByText('Variables')).toBeInTheDocument()
      expect(screen.getByText('Preview')).toBeInTheDocument()
    })

    it('should disable save button when no current template', () => {
      render(<App />)
      
      const saveButton = screen.getByText('Save')
      expect(saveButton).toBeDisabled()
    })
  })

  describe('interactions', () => {
    it('should handle clear button click', () => {
      render(<App />)
      
      const clearButton = screen.getByText('Clear')
      fireEvent.click(clearButton)
      
      // Should not crash
      expect(screen.getByText('Template Engine App')).toBeInTheDocument()
    })

    it('should handle new template creation', () => {
      render(<App />)
      
      const newTemplateButton = screen.getByText('New Template')
      fireEvent.click(newTemplateButton)
      
      // Should not crash and should enable save button
      expect(screen.getByText('Save')).not.toBeDisabled()
    })
  })

  describe('responsive design', () => {
    it('should have proper grid layout classes', () => {
      render(<App />)
      
      const appGrid = document.querySelector('.app-grid')
      expect(appGrid).toBeInTheDocument()
      
      const panels = document.querySelectorAll('.panel')
      expect(panels).toHaveLength(4)
    })

    it('should have proper panel classes', () => {
      render(<App />)
      
      expect(document.querySelector('.template-list-panel')).toBeInTheDocument()
      expect(document.querySelector('.template-editor-panel')).toBeInTheDocument()
      expect(document.querySelector('.variable-form-panel')).toBeInTheDocument()
      expect(document.querySelector('.template-preview-panel')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<App />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Template Engine App')
      
      const subHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(subHeadings).toHaveLength(4)
    })

    it('should have proper button roles', () => {
      render(<App />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Check specific buttons
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    })
  })
})