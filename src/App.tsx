import { useState, useEffect } from "react";
import "./App.css";
import type { Template, VariableConfig } from "./types/template";
import { TemplateList } from "./components/TemplateList";
import { TemplateEditor } from "./components/TemplateEditor";
import { VariableForm } from "./components/VariableForm";
import { VariableConfigDialog } from "./components/VariableConfigDialog";
import { TemplatePreview } from "./components/TemplatePreview";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useDynamicVariables } from "./hooks/useDynamicVariables";
import { evaluateJavaScript } from "./utils/jsEvaluator";
import { processNaturalDate } from "./utils/dateProcessor";

function App() {
  const {
    templates,
    currentTemplate,
    saveTemplate,
    deleteTemplate,
    setCurrentTemplate,
  } = useLocalStorage();

  const {
    variables,
    variableValues,
    updateVariableConfig,
    updateVariableValue,
    setVariables,
    setVariableValues,
  } = useDynamicVariables(currentTemplate?.content || "");

  const [configVariable, setConfigVariable] = useState<VariableConfig | null>(
    null
  );
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [savedTemplateState, setSavedTemplateState] = useState<Template | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [viewMode, setViewMode] = useState<'four-pane' | 'two-pane'>('four-pane');

  const handleNewTemplate = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: `Template ${templates.length + 1}`,
      content: "",
      variables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Immediately save the new template to the list
    saveTemplate(newTemplate);
    setCurrentTemplate(newTemplate);
    setVariables([]);
    setVariableValues({});
  };

  const handleSelectTemplate = (template: Template) => {
    setCurrentTemplate(template);
    setSavedTemplateState(template);
    setVariables(template.variables);

    const initialValues: { [key: string]: unknown } = {};
    template.variables.forEach((variable) => {
      if (variable.uiType === "date" && variable.defaultFunction) {
        // For date variables with natural language input, re-evaluate it
        if (variable.naturalLanguageInput) {
          const dateResult = processNaturalDate(
            variable.naturalLanguageInput,
            variable.dateFormat
          );
          if (dateResult.error === null) {
            initialValues[variable.name] = dateResult.value;
          } else {
            initialValues[variable.name] = variable.currentValue;
          }
        } else {
          // For date variables without natural language, re-evaluate the default function
          const result = evaluateJavaScript(variable.defaultFunction);
          if (!result.error && typeof result.value === "string") {
            const dateResult = processNaturalDate(
              result.value,
              variable.dateFormat
            );
            if (dateResult.error === null) {
              initialValues[variable.name] = dateResult.value;
            } else {
              initialValues[variable.name] = variable.currentValue;
            }
          } else {
            initialValues[variable.name] = variable.currentValue;
          }
        }
      } else {
        initialValues[variable.name] = variable.currentValue;
      }
    });
    setVariableValues(initialValues);
  };

  const handleTemplateChange = (template: Template) => {
    setCurrentTemplate(template);
  };

  const handleSaveTemplate = () => {
    if (currentTemplate) {
      const updatedTemplate: Template = {
        ...currentTemplate,
        variables: variables.map((v) => ({
          ...v,
          currentValue: variableValues[v.name] || v.currentValue,
        })),
        updatedAt: new Date(),
      };
      const saved = saveTemplate(updatedTemplate);
      if (saved) {
        setCurrentTemplate(updatedTemplate);
        setSavedTemplateState(updatedTemplate);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      }
    }
  };

  const handleConfigureVariable = (variableName: string) => {
    const variable = variables.find((v) => v.name === variableName);
    if (variable) {
      setConfigVariable(variable);
      setIsConfigDialogOpen(true);
    }
  };

  const handleSaveVariableConfig = (config: VariableConfig) => {
    updateVariableConfig(config.name, config);
  };

  const hasUnsavedChanges = () => {
    if (!currentTemplate || !savedTemplateState) return false;
    return (
      currentTemplate.name !== savedTemplateState.name ||
      currentTemplate.content !== savedTemplateState.content ||
      JSON.stringify(variables) !== JSON.stringify(savedTemplateState.variables)
    );
  };

  useEffect(() => {
    if (currentTemplate && savedTemplateState?.id === currentTemplate.id) {
      const savedVariables = savedTemplateState.variables || [];
      const currentVariables = variables.map((v) => ({
        ...v,
        currentValue: variableValues[v.name] || v.currentValue,
      }));
      if (JSON.stringify(currentVariables) !== JSON.stringify(savedVariables)) {
        setShowSaved(false);
      }
    }
  }, [variables, variableValues, currentTemplate, savedTemplateState]);

  return (
    <div className="app">
      <div className="app-header">
        <h1>tttttemplate</h1>
        <div className="app-actions">
          <div className="view-mode-toggle">
            <button 
              className={`mode-btn ${viewMode === 'four-pane' ? 'active' : ''}`}
              onClick={() => setViewMode('four-pane')}
            >
              4 Panes
            </button>
            <button 
              className={`mode-btn ${viewMode === 'two-pane' ? 'active' : ''}`}
              onClick={() => setViewMode('two-pane')}
            >
              2 Panes
            </button>
          </div>
          <button 
            onClick={handleSaveTemplate} 
            disabled={!currentTemplate || !hasUnsavedChanges()}
            className={currentTemplate && hasUnsavedChanges() ? 'save-btn' : ''}
            title={currentTemplate ? `This will update the template "${currentTemplate.name}"` : ''}
          >
            {showSaved ? 'Saved' : currentTemplate ? `Save to "${currentTemplate.name}"` : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="app-content">
        <div className={`app-grid ${viewMode}`}>
          <div className={`panel template-list-panel ${viewMode === 'two-pane' ? 'hidden' : ''}`}>
            <TemplateList
              templates={templates}
              currentTemplate={currentTemplate}
              onSelectTemplate={handleSelectTemplate}
              onDeleteTemplate={deleteTemplate}
              onNewTemplate={handleNewTemplate}
              onUpdateTemplate={saveTemplate}
              onMaximizeTemplate={(template) => {
                handleSelectTemplate(template);
                setViewMode('two-pane');
              }}
            />
          </div>

          <div className={`panel template-editor-panel ${viewMode === 'two-pane' ? 'hidden' : ''}`}>
            <TemplateEditor
              template={currentTemplate}
              onTemplateChange={handleTemplateChange}
            />
          </div>

          <div className="panel variable-form-panel">
            <VariableForm
              variables={variables}
              variableValues={variableValues}
              onVariableChange={updateVariableValue}
              onConfigureVariable={handleConfigureVariable}
            />
          </div>

          <div className="panel template-preview-panel">
            <TemplatePreview
              template={currentTemplate?.content || ""}
              variables={variableValues}
            />
          </div>
        </div>
      </div>

      <VariableConfigDialog
        variable={configVariable}
        isOpen={isConfigDialogOpen}
        onClose={() => setIsConfigDialogOpen(false)}
        onSave={handleSaveVariableConfig}
      />
    </div>
  );
}

export default App;
