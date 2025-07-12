import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import { TemplatePreview } from '../TemplatePreview'

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn()
}

Object.assign(navigator, {
  clipboard: mockClipboard
})

describe('TemplatePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render preview header with copy button', () => {
      render(
        <TemplatePreview
          template="Hello {{name}}"
          variables={{ name: 'John' }}
        />
      )
      
      expect(screen.getByText('Preview')).toBeInTheDocument()
      expect(screen.getByText('📋 Copy')).toBeInTheDocument()
    })

    it('should render template content with variables', () => {
      render(
        <TemplatePreview
          template="Hello {{name}}, today is {{date}}"
          variables={{ name: 'John', date: '2025-01-15' }}
        />
      )
      
      expect(screen.getByText('Hello John, today is 2025-01-15')).toBeInTheDocument()
    })

    it('should show empty message for empty template', () => {
      render(
        <TemplatePreview
          template=""
          variables={{}}
        />
      )
      
      expect(screen.getByText('Enter a template to see preview')).toBeInTheDocument()
    })

    it('should render multiline template correctly', () => {
      const template = `Line 1: {{var1}}
Line 2: {{var2}}`
      const variables = { var1: 'Value1', var2: 'Value2' }
      
      render(
        <TemplatePreview
          template={template}
          variables={variables}
        />
      )
      
      expect(screen.getByText('Line 1: Value1')).toBeInTheDocument()
      expect(screen.getByText('Line 2: Value2')).toBeInTheDocument()
    })
  })

  describe('copy functionality', () => {
    it('should copy template content to clipboard', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined)
      
      render(
        <TemplatePreview
          template="Hello {{name}}"
          variables={{ name: 'John' }}
        />
      )
      
      const copyButton = screen.getByText('📋 Copy')
      fireEvent.click(copyButton)
      
      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('Hello John')
      })
      
      expect(screen.getByText('✓ Copied!')).toBeInTheDocument()
    })

    it('should disable copy button for empty template', () => {
      render(
        <TemplatePreview
          template=""
          variables={{}}
        />
      )
      
      const copyButton = screen.getByText('📋 Copy')
      expect(copyButton).toBeDisabled()
    })

    it('should handle clipboard API failure with fallback', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard API failed'))
      
      // Mock document.execCommand
      const mockExecCommand = vi.spyOn(document, 'execCommand').mockReturnValue(true)
      const mockCreateElement = vi.spyOn(document, 'createElement')
      const mockAppendChild = vi.spyOn(document.body, 'appendChild')
      const mockRemoveChild = vi.spyOn(document.body, 'removeChild')
      
      render(
        <TemplatePreview
          template="Hello {{name}}"
          variables={{ name: 'John' }}
        />
      )
      
      const copyButton = screen.getByText('📋 Copy')
      fireEvent.click(copyButton)
      
      await waitFor(() => {
        expect(mockCreateElement).toHaveBeenCalledWith('textarea')
        expect(mockExecCommand).toHaveBeenCalledWith('copy')
      })
      
      expect(screen.getByText('✓ Copied!')).toBeInTheDocument()
      
      mockExecCommand.mockRestore()
      mockCreateElement.mockRestore()
      mockAppendChild.mockRestore()
      mockRemoveChild.mockRestore()
    })

    it('should reset copy success state after timeout', async () => {
      vi.useFakeTimers()
      mockClipboard.writeText.mockResolvedValue(undefined)
      
      render(
        <TemplatePreview
          template="Hello {{name}}"
          variables={{ name: 'John' }}
        />
      )
      
      const copyButton = screen.getByText('📋 Copy')
      fireEvent.click(copyButton)
      
      await waitFor(() => {
        expect(screen.getByText('✓ Copied!')).toBeInTheDocument()
      })
      
      // Fast-forward time
      vi.advanceTimersByTime(2000)
      
      await waitFor(() => {
        expect(screen.getByText('📋 Copy')).toBeInTheDocument()
      })
      
      vi.useRealTimers()
    })
  })

  describe('error handling', () => {
    it('should display error message when template compilation fails', () => {
      // Mock Handlebars to throw error
      const originalHandlebars = (globalThis as any).window.Handlebars
      ;(globalThis as any).window.Handlebars = {
        compile: () => {
          throw new Error('Template compilation failed')
        }
      }
      
      render(
        <TemplatePreview
          template="Hello {{name}}"
          variables={{ name: 'John' }}
        />
      )
      
      expect(screen.getByText('Error rendering template:')).toBeInTheDocument()
      expect(screen.getByText('Template compilation failed')).toBeInTheDocument()
      
      // Restore original
      ;(globalThis as any).window.Handlebars = originalHandlebars
    })

    it('should handle template with missing variables gracefully', () => {
      render(
        <TemplatePreview
          template="Hello {{name}}, today is {{date}}"
          variables={{ name: 'John' }}
        />
      )
      
      expect(screen.getByText('Hello John, today is {{date}}')).toBeInTheDocument()
    })
  })
})