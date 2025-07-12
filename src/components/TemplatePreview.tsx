import { useState } from 'react';
import type { VariableValue } from '../types/template';
import { useHandlebars } from '../hooks/useHandlebars';

interface TemplatePreviewProps {
  template: string;
  variables: VariableValue;
}

export function TemplatePreview({ template, variables }: TemplatePreviewProps) {
  const { compileTemplate } = useHandlebars();
  const [copySuccess, setCopySuccess] = useState(false);
  
  const getRenderedContent = () => {
    if (!template.trim()) {
      return '';
    }
    
    try {
      return compileTemplate(template, variables);
    } catch (error) {
      return `Error rendering template: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const handleCopyToClipboard = async () => {
    const content = getRenderedContent();
    
    if (!content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };
  
  const renderPreview = () => {
    if (!template.trim()) {
      return <p className="preview-empty">Enter a template to see preview</p>;
    }
    
    try {
      const rendered = compileTemplate(template, variables);
      return (
        <div className="preview-content">
          {rendered.split('\n').map((line, index) => (
            <div key={index} className="preview-line">
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      );
    } catch (error) {
      return (
        <div className="preview-error">
          <p>Error rendering template:</p>
          <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      );
    }
  };

  return (
    <div className="template-preview">
      <div className="template-preview-header">
        <h3>Preview</h3>
        <button 
          onClick={handleCopyToClipboard}
          disabled={!template.trim()}
          className={`copy-btn ${copySuccess ? 'copy-success' : ''}`}
        >
          {copySuccess ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      <div className="template-preview-content">
        {renderPreview()}
      </div>
    </div>
  );
}