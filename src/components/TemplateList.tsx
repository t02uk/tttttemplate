import type { Template } from '../types/template';

interface TemplateListProps {
  templates: Template[];
  currentTemplate: Template | null;
  onSelectTemplate: (template: Template) => void;
  onDeleteTemplate: (templateId: string) => void;
  onNewTemplate: () => void;
}

export function TemplateList({ 
  templates, 
  currentTemplate, 
  onSelectTemplate, 
  onDeleteTemplate, 
  onNewTemplate 
}: TemplateListProps) {
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
                <h4>{template.name}</h4>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTemplate(template.id);
                  }}
                  className="delete-btn"
                >
                  ×
                </button>
              </div>
              <div className="template-item-meta">
                <span className="template-date">
                  {new Date(template.updatedAt).toLocaleDateString()}
                </span>
                <span className="template-vars">
                  {template.variables.length} variables
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}