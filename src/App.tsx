import { useState } from "react";
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

  const handleNewTemplate = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: "New Template",
      content: "",
      variables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentTemplate(newTemplate);
    setVariables([]);
    setVariableValues({});
  };

  const handleSelectTemplate = (template: Template) => {
    setCurrentTemplate(template);
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
      saveTemplate(updatedTemplate);
      setCurrentTemplate(updatedTemplate);
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

  return (
    <div className="app">
      <div className="app-header">
        <h1>tttttemplate</h1>
        <div className="app-actions">
          <button onClick={handleSaveTemplate} disabled={!currentTemplate}>
            Save Template
          </button>
        </div>
      </div>

      <div className="app-content">
        <div className="app-grid">
          <div className="panel template-list-panel">
            <TemplateList
              templates={templates}
              currentTemplate={currentTemplate}
              onSelectTemplate={handleSelectTemplate}
              onDeleteTemplate={deleteTemplate}
              onNewTemplate={handleNewTemplate}
            />
          </div>

          <div className="panel template-editor-panel">
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
