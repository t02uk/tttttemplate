import { useState, useEffect, useCallback } from 'react';
import type { Template } from '../types/template';

// App-specific prefix to avoid conflicts on shared domains like GitHub Pages
const APP_PREFIX = 'tttttemplate';
const TEMPLATES_KEY = `${APP_PREFIX}_templates`;
const CURRENT_TEMPLATE_KEY = `${APP_PREFIX}_currentTemplate`;

export function useLocalStorage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

  const loadTemplates = useCallback(() => {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY);
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
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templatesData));
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }, []);

  const saveCurrentTemplate = useCallback((template: Template | null) => {
    try {
      if (template) {
        localStorage.setItem(CURRENT_TEMPLATE_KEY, JSON.stringify(template));
      } else {
        localStorage.removeItem(CURRENT_TEMPLATE_KEY);
      }
      setCurrentTemplate(template);
    } catch (error) {
      console.error('Error saving current template:', error);
    }
  }, []);

  const loadCurrentTemplate = useCallback(() => {
    try {
      const stored = localStorage.getItem(CURRENT_TEMPLATE_KEY);
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
      localStorage.removeItem(CURRENT_TEMPLATE_KEY);
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