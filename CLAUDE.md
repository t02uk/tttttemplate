# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development server**: `npm run dev` - Starts Vite development server with HMR
- **Build**: `npm run build` - TypeScript compilation followed by production build
- **Lint**: `npm run lint` - ESLint checking with TypeScript and React rules
- **Preview**: `npm run preview` - Preview production build locally

## Project Architecture

This is a **Template Engine Application** built with React + TypeScript + Vite that uses Handlebars.js for dynamic template processing.

### Core Concept
The application allows users to create templates with `{{variable}}` syntax and dynamically generate UI elements based on JavaScript function return types:
- **String** → Text input
- **Number** → Number input  
- **Array** → Radio buttons
- **Object array** → Select dropdown
- **Boolean** → Checkbox

### Key Features
- **Template Management**: Create, save, and load templates via LocalStorage
- **Dynamic Variable Configuration**: Each template variable can have JavaScript functions that determine default values and UI types
- **Real-time Preview**: Live template rendering with Handlebars.js
- **Type-based UI Generation**: Automatic UI element creation based on function return types

### Architecture Overview
The application follows a component-based architecture with:
- **4-panel layout**: Template list, editor, variable form, and preview
- **Hook-based state management**: Custom hooks for Handlebars, LocalStorage, and dynamic variables
- **TypeScript interfaces**: Strong typing for Template and VariableConfig
- **Utility functions**: Variable extraction, JS evaluation, and UI type detection

### Data Flow
1. User creates template with `{{variable}}` syntax
2. Variables are automatically extracted from template
3. JavaScript functions generate default values and determine UI types
4. Dynamic forms are generated based on detected types
5. Template is rendered with current variable values using Handlebars.js
6. All data persists in LocalStorage

### Security Considerations
⚠️ **Important**: This application uses `eval()` or `Function` constructor to execute JavaScript code for dynamic defaults. This is acceptable for development/testing environments but introduces security risks in production.

### File Structure
```
src/
├── App.tsx                      # Main 4-panel layout
├── components/                  # UI components for each panel
├── hooks/                       # Custom hooks for core functionality
├── utils/                       # Utility functions
└── types/template.ts            # TypeScript type definitions
```

### External Dependencies
- **Handlebars.js**: Loaded via CDN for template processing
- **LocalStorage**: For data persistence
- **React + TypeScript + Vite**: Core framework stack

## Implementation Details

### UI Type Detection Logic
JavaScript functions determine UI elements based on return types:
```javascript
function detectUIType(value) {
  if (typeof value === 'string') return 'text';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'checkbox';
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'object') {
      return 'select'; // Object array
    }
    return 'radio'; // Primitive array
  }
  return 'text'; // fallback
}
```

### Example JavaScript Functions
```javascript
// String → Text input
"田中太郎"
new Date().getFullYear().toString()

// Number → Number input
2025
Math.floor(Math.random() * 100)

// Array → Radio buttons
["晴れ", "曇り", "雨", "雪"]

// Object array → Select dropdown
[
  {value: "sunny", label: "晴れ"},
  {value: "cloudy", label: "曇り"},
  {value: "rainy", label: "雨"}
]

// Boolean → Checkbox
true
Math.random() > 0.5
```

### Data Structure
```typescript
interface Template {
  id: string;
  name: string;
  content: string;
  variables: VariableConfig[];
  createdAt: Date;
  updatedAt: Date;
}

interface VariableConfig {
  name: string;
  defaultFunction: string; // JavaScript function code
  uiType: 'text' | 'number' | 'radio' | 'select' | 'checkbox';
  currentValue: any;
  options?: any[]; // For radio/select choices
}
```

### LocalStorage Keys
- `templates`: Template[]
- `currentTemplate`: Template | null

### Expected File Structure
```
src/
├── App.tsx                      # Main 4-panel layout
├── components/
│   ├── TemplateList.tsx         # Saved templates list
│   ├── TemplateEditor.tsx       # Template editing area
│   ├── VariableForm.tsx         # Dynamic variable input form
│   ├── VariableConfigDialog.tsx # Variable configuration dialog
│   └── TemplatePreview.tsx      # Template preview
├── hooks/
│   ├── useHandlebars.ts         # Handlebars processing
│   ├── useLocalStorage.ts       # LocalStorage operations
│   └── useDynamicVariables.ts   # Dynamic variable management
├── utils/
│   ├── variableExtractor.ts     # Extract variables from templates
│   ├── jsEvaluator.ts           # JavaScript function execution
│   └── uiTypeDetector.ts        # UI type detection
└── types/
    └── template.ts              # Type definitions
```