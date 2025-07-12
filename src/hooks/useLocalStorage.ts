import { useState, useEffect, useCallback } from 'react';
import type { Template } from '../types/template';

export function useLocalStorage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

  const loadTemplates = useCallback(() => {
    try {
      const stored = localStorage.getItem('templates');
      if (stored) {
        const parsedTemplates = JSON.parse(stored);
        setTemplates(parsedTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }, []);

  const saveTemplates = useCallback((templatesData: Template[]) => {
    try {
      localStorage.setItem('templates', JSON.stringify(templatesData));
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }, []);

  const saveCurrentTemplate = useCallback((template: Template | null) => {
    try {
      if (template) {
        localStorage.setItem('currentTemplate', JSON.stringify(template));
      } else {
        localStorage.removeItem('currentTemplate');
      }
      setCurrentTemplate(template);
    } catch (error) {
      console.error('Error saving current template:', error);
    }
  }, []);

  const loadCurrentTemplate = useCallback(() => {
    try {
      const stored = localStorage.getItem('currentTemplate');
      if (stored) {
        const parsedTemplate = JSON.parse(stored);
        setCurrentTemplate(parsedTemplate);
      }
    } catch (error) {
      console.error('Error loading current template:', error);
    }
  }, []);

  const saveTemplate = useCallback((template: Template) => {
    const updatedTemplates = templates.filter(t => t.id !== template.id);
    updatedTemplates.push(template);
    saveTemplates(updatedTemplates);
  }, [templates, saveTemplates]);

  const deleteTemplate = useCallback((templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(updatedTemplates);
    
    if (currentTemplate?.id === templateId) {
      setCurrentTemplate(null);
      localStorage.removeItem('currentTemplate');
    }
  }, [templates, currentTemplate, saveTemplates]);

  useEffect(() => {
    loadTemplates();
    loadCurrentTemplate();
  }, [loadTemplates, loadCurrentTemplate]);

  return {
    templates,
    currentTemplate,
    saveTemplate,
    deleteTemplate,
    setCurrentTemplate: saveCurrentTemplate,
    loadTemplates,
    loadCurrentTemplate,
  };
}