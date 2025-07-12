import React from 'react';
import type { Template } from '../types/template';

interface TemplateEditorProps {
  template: Template | null;
  onTemplateChange: (template: Template) => void;
}

export function TemplateEditor({ 
  template, 
  onTemplateChange
}: TemplateEditorProps) {
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (template) {
      onTemplateChange({
        ...template,
        content: e.target.value,
        updatedAt: new Date(),
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (template) {
      onTemplateChange({
        ...template,
        name: e.target.value,
        updatedAt: new Date(),
      });
    }
  };

  return (
    <div className="template-editor">
      <div className="template-editor-header">
        <h3>Template Editor</h3>
      </div>
      
      <div className="template-editor-content">
        <div className="template-textarea-container">
          <textarea
            value={template?.content || ''}
            onChange={handleContentChange}
            placeholder="Enter your template here using {{variable}} syntax..."
            className="template-textarea"
            rows={10}
          />
        </div>
        
        <div className="template-name-container">
          <label htmlFor="template-name">Template Name:</label>
          <input
            id="template-name"
            type="text"
            value={template?.name || ''}
            onChange={handleNameChange}
            placeholder="Enter template name"
            className="template-name-input"
          />
        </div>
      </div>
    </div>
  );
}