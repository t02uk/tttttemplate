import { useState } from 'react';
import type { Template } from '../types/template';

interface TemplateListProps {
  templates: Template[];
  currentTemplate: Template | null;
  onSelectTemplate: (template: Template) => void;
  onDeleteTemplate: (templateId: string) => void;
  onNewTemplate: () => void;
  onUpdateTemplate: (template: Template) => void;
  onMaximizeTemplate?: (template: Template) => void;
}

export function TemplateList({ 
  templates, 
  currentTemplate, 
  onSelectTemplate, 
  onDeleteTemplate, 
  onNewTemplate,
  onUpdateTemplate,
  onMaximizeTemplate
}: TemplateListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const handleStartEdit = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(template.id);
    setEditingName(template.name);
  };

  const handleSaveEdit = (template: Template) => {
    if (editingName.trim() && editingName !== template.name) {
      const updatedTemplate = {
        ...template,
        name: editingName.trim(),
        updatedAt: new Date()
      };
      onUpdateTemplate(updatedTemplate);
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, template: Template) => {
    if (e.key === 'Enter') {
      handleSaveEdit(template);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };
  return (
    <div className="template-list">
      <div className="template-list-header">
        <h3>Saved Templates</h3>
        <button onClick={onNewTemplate} className="new-template-btn">
          New Template
        </button>
      </div>
      <div className="template-list-content">
        {templates.length === 0 ? (
          <p className="no-templates">No templates saved</p>
        ) : (
          templates.map(template => (
            <div 
              key={template.id} 
              className={`template-item ${currentTemplate?.id === template.id ? 'active' : ''}`}
              onClick={() => onSelectTemplate(template)}
            >
              <div className="template-item-header">
                {editingId === template.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleSaveEdit(template)}
                    onKeyDown={(e) => handleKeyDown(e, template)}
                    className="template-name-input"
                    autoFocus
                  />
                ) : (
                  <h4 onClick={(e) => handleStartEdit(template, e)}>{template.name}</h4>
                )}
                <div className="template-item-actions">
                  {onMaximizeTemplate && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMaximizeTemplate(template);
                      }}
                      className="maximize-btn"
                      title="Show in 2-pane view"
                    >
                      ⤢
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
                        onDeleteTemplate(template.id);
                      }
                    }}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}