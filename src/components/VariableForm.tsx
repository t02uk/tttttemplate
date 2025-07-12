import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { VariableConfig, VariableValue } from '../types/template';
import { processNaturalDate, formatDate } from '../utils/dateProcessor';

interface VariableFormProps {
  variables: VariableConfig[];
  variableValues: VariableValue;
  onVariableChange: (name: string, value: unknown) => void;
  onConfigureVariable: (name: string) => void;
}

// DateInput component for handling both natural language and picker inputs
function DateInput({ 
  variable, 
  value, 
  onVariableChange, 
  convertDayjsToDatePickerFormat 
}: {
  variable: VariableConfig;
  value: unknown;
  onVariableChange: (name: string, value: unknown) => void;
  convertDayjsToDatePickerFormat: (format?: string) => string;
}) {
  const [naturalInput, setNaturalInput] = useState(String(value || ''));
  const [parseError, setParseError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // Update naturalInput when value changes
  React.useEffect(() => {
    setNaturalInput(String(value || ''));
  }, [value]);

  const handleNaturalInputChange = (input: string) => {
    setNaturalInput(input);
    
    if (!input.trim()) {
      setParseError(null);
      return;
    }

    const result = processNaturalDate(input, variable.dateFormat);
    if (result.error) {
      setParseError(result.error);
    } else {
      setParseError(null);
      onVariableChange(variable.name, result.value);
    }
  };

  const handleDatePickerChange = (date: Date | null) => {
    if (date) {
      const format = variable.dateFormat || 'YYYY/MM/DD';
      const formattedDate = formatDate(date, format);
      onVariableChange(variable.name, formattedDate);
      setNaturalInput(''); // Clear natural input when using picker
    }
  };

  return (
    <div className="date-input-container">
      <div className="date-input-toggle">
        <button 
          type="button"
          className={!showPicker ? 'active' : ''}
          onClick={() => setShowPicker(false)}
        >
          ✍️ Natural
        </button>
        <button 
          type="button"
          className={showPicker ? 'active' : ''}
          onClick={() => setShowPicker(true)}
        >
          📅 Picker
        </button>
      </div>

      {showPicker ? (
        <DatePicker
          selected={value && !isNaN(new Date(String(value)).getTime()) ? new Date(String(value)) : null}
          onChange={handleDatePickerChange}
          dateFormat={convertDayjsToDatePickerFormat(variable.dateFormat)}
          className="variable-input date-picker"
          placeholderText={`Enter date (${variable.dateFormat || 'YYYY/MM/DD'})`}
        />
      ) : (
        <div className="natural-date-input">
          <input
            type="text"
            value={naturalInput}
            onChange={(e) => handleNaturalInputChange(e.target.value)}
            className="variable-input natural-input"
            placeholder="Type: Today, Tomorrow, Next Monday, Today + 3 days..."
          />
          {parseError && (
            <div className="parse-error">
              {parseError}
            </div>
          )}
          <div className="natural-examples">
            Examples: "Today", "Tomorrow", "Next Week", "Today + 3 days"
          </div>
        </div>
      )}

      <div className="date-format-info">
        Format: {variable.dateFormat || 'YYYY/MM/DD'}
        {value != null && <span className="current-value"> | Current: {String(value)}</span>}
      </div>
    </div>
  );
}

export function VariableForm({ 
  variables, 
  variableValues, 
  onVariableChange, 
  onConfigureVariable 
}: VariableFormProps) {

  const convertDayjsToDatePickerFormat = (format?: string): string => {
    if (!format) return 'yyyy/MM/dd';
    
    // Convert common dayjs formats to react-datepicker formats
    return format
      .replace(/YYYY/g, 'yyyy')
      .replace(/MM/g, 'MM')
      .replace(/DD/g, 'dd')
      .replace(/HH/g, 'HH')
      .replace(/mm/g, 'mm')
      .replace(/ss/g, 'ss');
  };

  const renderInput = (variable: VariableConfig) => {
    const value = variableValues[variable.name] || variable.currentValue;
    
    switch (variable.uiType) {
      case 'text':
        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => onVariableChange(variable.name, e.target.value)}
            className="variable-input"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={String(value || '')}
            onChange={(e) => onVariableChange(variable.name, Number(e.target.value))}
            className="variable-input"
          />
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onVariableChange(variable.name, e.target.checked)}
            className="variable-checkbox"
          />
        );
      
      case 'radio':
        return (
          <div className="radio-group">
            {variable.options?.map((option, index) => (
              <label key={index} className="radio-label">
                <input
                  type="radio"
                  name={variable.name}
                  value={String(option)}
                  checked={value === option}
                  onChange={() => onVariableChange(variable.name, option)}
                  className="radio-input"
                />
                {String(option)}
              </label>
            ))}
          </div>
        );
      
      case 'select':
        return (
          <select
            value={String(value || '')}
            onChange={(e) => onVariableChange(variable.name, e.target.value)}
            className="variable-select"
          >
            <option value="">Select...</option>
            {variable.options?.map((option, index) => {
              const optionObj = option as { value: string; label?: string };
              return (
                <option key={index} value={optionObj.value}>
                  {optionObj.label || optionObj.value}
                </option>
              );
            })}
          </select>
        );
      
      case 'date':
        return <DateInput 
          variable={variable} 
          value={value} 
          onVariableChange={onVariableChange} 
          convertDayjsToDatePickerFormat={convertDayjsToDatePickerFormat}
        />;
      
      default:
        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => onVariableChange(variable.name, e.target.value)}
            className="variable-input"
          />
        );
    }
  };

  return (
    <div className="variable-form">
      <h3>Variables</h3>
      <div className="variable-form-content">
        {variables.length === 0 ? (
          <p className="no-variables">No variables found in template</p>
        ) : (
          variables.map(variable => (
            <div key={variable.name} className="variable-item">
              <div className="variable-header">
                <label className="variable-label">
                  {variable.name}:
                </label>
                <button 
                  onClick={() => onConfigureVariable(variable.name)}
                  className="config-btn"
                >
                  ⚙️
                </button>
              </div>
              <div className="variable-input-container">
                {renderInput(variable)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}