import { useCallback } from 'react';
import type { VariableValue } from '../types/template';

export function useHandlebars() {
  const compileTemplate = useCallback((template: string, variables: VariableValue): string => {
    try {
      if (!window.Handlebars) {
        throw new Error('Handlebars is not loaded');
      }
      
      if (!template || template.trim() === '') {
        return '';
      }
      
      const hasIncompleteHandlebars = /\{\{(?![^{}]*\}\})/.test(template);
      if (hasIncompleteHandlebars) {
        return template;
      }
      
      const handlebars = window.Handlebars as { compile: (template: string) => (context: unknown) => string };
      const compiled = handlebars.compile(template);
      return compiled(variables);
    } catch (error) {
      console.error('Template compilation error:', error);
      return template;
    }
  }, []);

  return { compileTemplate };
}