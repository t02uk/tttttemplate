import { useState, useCallback, useEffect } from 'react';
import type { VariableConfig, VariableValue } from '../types/template';
import { extractVariables } from '../utils/variableExtractor';
import { safeEvaluate } from '../utils/jsEvaluator';
import { detectUIType, getUITypeOptions } from '../utils/uiTypeDetector';

export function useDynamicVariables(templateContent: string) {
  const [variables, setVariables] = useState<VariableConfig[]>([]);
  const [variableValues, setVariableValues] = useState<VariableValue>({});

  const updateVariableConfig = useCallback((variableName: string, config: Partial<VariableConfig>) => {
    console.log('updateVariableConfig called:', { variableName, config });
    
    setVariables(prev => prev.map(v => 
      v.name === variableName 
        ? { ...v, ...config }
        : v
    ));
    
    // Update variable value if currentValue is included in config
    if (config.currentValue !== undefined) {
      console.log('Updating variable value:', { variableName, value: config.currentValue });
      setVariableValues(prev => {
        const updated = {
          ...prev,
          [variableName]: config.currentValue
        };
        console.log('Updated variableValues:', updated);
        return updated;
      });
    }
  }, []);

  const updateVariableValue = useCallback((variableName: string, value: unknown) => {
    setVariableValues(prev => ({
      ...prev,
      [variableName]: value
    }));
  }, []);

  const refreshVariableDefaults = useCallback(() => {
    const updatedValues: VariableValue = {};
    
    variables.forEach(variable => {
      if (variable.defaultFunction) {
        const defaultValue = safeEvaluate(variable.defaultFunction, variable.currentValue);
        updatedValues[variable.name] = defaultValue;
        
        const newUIType = detectUIType(defaultValue);
        const newOptions = getUITypeOptions(defaultValue);
        
        if (newUIType !== variable.uiType || JSON.stringify(newOptions) !== JSON.stringify(variable.options)) {
          updateVariableConfig(variable.name, {
            uiType: newUIType,
            options: newOptions,
            currentValue: defaultValue
          });
        }
      }
    });
    
    setVariableValues(prev => ({ ...prev, ...updatedValues }));
  }, [variables, updateVariableConfig]);

  const syncVariables = useCallback(() => {
    const extractedVariables = extractVariables(templateContent);
    const currentVariableNames = variables.map(v => v.name);
    
    const newVariables = extractedVariables.filter(name => 
      !currentVariableNames.includes(name)
    );
    
    const removedVariables = currentVariableNames.filter(name => 
      !extractedVariables.includes(name)
    );
    
    if (newVariables.length > 0 || removedVariables.length > 0) {
      setVariables(prev => {
        const updated = prev.filter(v => extractedVariables.includes(v.name));
        
        newVariables.forEach(name => {
          const defaultValue = '';
          updated.push({
            name,
            defaultFunction: `"${name}"`,
            uiType: 'text',
            currentValue: defaultValue,
            options: undefined
          });
        });
        
        return updated;
      });
      
      const updatedValues = { ...variableValues };
      removedVariables.forEach(name => {
        delete updatedValues[name];
      });
      
      newVariables.forEach(name => {
        updatedValues[name] = name;
      });
      
      setVariableValues(updatedValues);
    }
  }, [templateContent, variables, variableValues]);

  useEffect(() => {
    syncVariables();
  }, [syncVariables]);

  return {
    variables,
    variableValues,
    updateVariableConfig,
    updateVariableValue,
    refreshVariableDefaults,
    syncVariables,
    setVariables,
    setVariableValues,
  };
}