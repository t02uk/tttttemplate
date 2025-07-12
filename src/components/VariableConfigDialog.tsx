import React, { useState } from 'react';
import type { VariableConfig } from '../types/template';
import { evaluateJavaScript } from '../utils/jsEvaluator';
import { detectUIType, getUITypeOptions } from '../utils/uiTypeDetector';
import { validateDateFormat, processNaturalDate } from '../utils/dateProcessor';

interface VariableConfigDialogProps {
  variable: VariableConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: VariableConfig) => void;
}

export function VariableConfigDialog({ 
  variable, 
  isOpen, 
  onClose, 
  onSave 
}: VariableConfigDialogProps) {
  const [defaultFunction, setDefaultFunction] = useState(variable?.defaultFunction || '');
  const [dateFormat, setDateFormat] = useState(variable?.dateFormat || 'YYYY/MM/DD');
  const [testResult, setTestResult] = useState<{ value: unknown; error: string | null } | null>(null);
  const [formatError, setFormatError] = useState<string | null>(null);
  const [formatPreview, setFormatPreview] = useState<string>('');

  React.useEffect(() => {
    if (variable) {
      setDefaultFunction(variable.defaultFunction);
      setDateFormat(variable.dateFormat || 'YYYY/MM/DD');
      setTestResult(null);
      setFormatError(null);
      setFormatPreview('');
    }
  }, [variable]);

  // Update format preview when date format changes
  React.useEffect(() => {
    if (dateFormat) {
      const validation = validateDateFormat(dateFormat);
      if (validation.isValid) {
        setFormatError(null);
        // Generate preview with current date
        const preview = processNaturalDate('today', dateFormat);
        setFormatPreview(preview.value);
      } else {
        setFormatError(validation.error || 'Invalid format');
        setFormatPreview('');
      }
    }
  }, [dateFormat]);

  const handleTest = () => {
    const result = evaluateJavaScript(defaultFunction);
    setTestResult(result);
  };

  const handleSave = () => {
    console.log('handleSave called', { variable: variable?.name, defaultFunction });
    
    if (!variable) {
      console.log('No variable found, returning');
      return;
    }
    
    const result = evaluateJavaScript(defaultFunction);
    console.log('JavaScript evaluation result:', result);
    
    if (result.error) {
      console.log('JavaScript error:', result.error);
      alert(`Error in function: ${result.error}`);
      return;
    }
    
    const newUIType = detectUIType(result.value);
    const newOptions = getUITypeOptions(result.value);
    
    let processedValue = result.value;
    
    // Validate date format if this is a date type
    if (newUIType === 'date' && dateFormat) {
      const validation = validateDateFormat(dateFormat);
      if (!validation.isValid) {
        alert(`Invalid date format: ${validation.error}`);
        return;
      }
      
      // Process date value for natural language dates
      if (typeof result.value === 'string') {
        const dateResult = processNaturalDate(result.value, dateFormat);
        if (dateResult.error === null && dateResult.parsedDate) {
          processedValue = dateResult.value;
        }
      }
    }
    
    const updatedConfig: VariableConfig = {
      ...variable,
      defaultFunction,
      uiType: newUIType,
      currentValue: processedValue,
      options: newOptions,
      dateFormat: newUIType === 'date' ? dateFormat : undefined,
    };
    
    console.log('Saving variable config:', {
      name: variable.name,
      defaultFunction,
      originalValue: result.value,
      processedValue,
      uiType: newUIType,
      dateFormat
    });
    
    onSave(updatedConfig);
    onClose();
  };

  if (!isOpen || !variable) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h3>Configure Variable: {variable.name}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="dialog-content">
          <div className="config-section">
            <label htmlFor="default-function">Default Function:</label>
            <textarea
              id="default-function"
              value={defaultFunction}
              onChange={(e) => setDefaultFunction(e.target.value)}
              placeholder="Enter JavaScript expression (e.g., 'Hello World', 2025, ['A', 'B', 'C'])"
              className="function-textarea"
              rows={4}
            />
          </div>
          
          <div className="config-actions">
            <button onClick={handleTest} className="test-btn">
              Test Function
            </button>
          </div>
          
          {testResult && (
            <div className="test-result">
              <h4>Test Result:</h4>
              {testResult.error ? (
                <div className="error">
                  <strong>Error:</strong> {testResult.error}
                </div>
              ) : (
                <div className="success">
                  <div><strong>Value:</strong> {JSON.stringify(testResult.value)}</div>
                  <div><strong>Type:</strong> {typeof testResult.value}</div>
                  <div><strong>UI Type:</strong> {detectUIType(testResult.value)}</div>
                </div>
              )}
            </div>
          )}
          
          {testResult && !testResult.error && detectUIType(testResult.value) === 'date' && (
            <div className="date-format-section">
              <label htmlFor="date-format">Date Format:</label>
              <input
                id="date-format"
                type="text"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="date-format-input"
                placeholder="Enter custom format (e.g., YYYY年MM月DD日)"
              />
              {formatError && (
                <div className="format-error">
                  <strong>Error:</strong> {formatError}
                </div>
              )}
              {formatPreview && !formatError && (
                <div className="format-preview">
                  <strong>Preview:</strong> {formatPreview}
                </div>
              )}
              
              <div className="format-reference">
                <h5>Format Reference:</h5>
                <div className="format-tokens">
                  <div className="token-group">
                    <h6>Year:</h6>
                    <code>YYYY</code> - 4桁年 (2025), <code>YY</code> - 2桁年 (25)
                  </div>
                  <div className="token-group">
                    <h6>Month:</h6>
                    <code>MM</code> - 2桁月 (01), <code>M</code> - 月 (1), <code>MMM</code> - 短縮名 (Jan)
                  </div>
                  <div className="token-group">
                    <h6>Day:</h6>
                    <code>DD</code> - 2桁日 (01), <code>D</code> - 日 (1)
                  </div>
                  <div className="token-group">
                    <h6>Time:</h6>
                    <code>HH</code> - 時 (24h), <code>mm</code> - 分, <code>ss</code> - 秒
                  </div>
                  <div className="token-group">
                    <h6>Examples:</h6>
                    <code>YYYY/MM/DD</code>, <code>YYYY-MM-DD HH:mm</code>, <code>YYYY年MM月DD日</code>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="function-examples">
            <h4>Function Examples:</h4>
            <ul>
              <li><code>"Hello World"</code> → Text input</li>
              <li><code>2025</code> → Number input</li>
              <li><code>["A", "B", "C"]</code> → Radio buttons</li>
              <li><code>[{`{value: "a", label: "Option A"}`}]</code> → Select dropdown</li>
              <li><code>true</code> → Checkbox</li>
              <li><code>new Date().toLocaleDateString()</code> → Date picker</li>
              <li><code>"2025/01/15"</code> → Date picker</li>
              <li><code>"Today"</code> → Date picker (natural language)</li>
              <li><code>"Tomorrow"</code> → Date picker (natural language)</li>
              <li><code>"Today + 3 days"</code> → Date picker (relative date)</li>
              <li><code>"Next Monday"</code> → Date picker (natural language)</li>
            </ul>
          </div>
        </div>
        
        <div className="dialog-footer">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleSave} className="save-btn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}