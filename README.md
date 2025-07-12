# tttttemplate

A dynamic template engine application built with React + TypeScript + Vite that uses Handlebars.js for template processing.

## 🌐 Live Demo

**[https://t02uk.github.io/tttttemplate/](https://t02uk.github.io/tttttemplate/)**

## ✨ Features

- **Dynamic Template Processing**: Create templates with `{{variable}}` syntax
- **Smart Variable Configuration**: JavaScript functions determine UI element types automatically
- **Multiple Input Types**: Text, Number, Date, Radio buttons, Select dropdowns, Checkboxes
- **Natural Language Date Processing**: Supports "tomorrow", "next Monday", "today + 3 days", etc.
- **Real-time Preview**: Live template rendering with Handlebars.js
- **Local Storage**: Automatic saving and loading of templates
- **Type-based UI Generation**: Automatic UI element creation based on function return types

## 🚀 UI Type Detection

JavaScript functions determine UI elements based on return types:

- **String** → Text input
- **Number** → Number input
- **Array** → Radio buttons
- **Object array** → Select dropdown
- **Boolean** → Checkbox
- **Date string** → Date picker with natural language support

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/t02uk/tttttemplate.git
cd tttttemplate

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - TypeScript compilation + production build
- `npm run lint` - ESLint checking
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run deploy` - Build for deployment

## 📝 Example JavaScript Functions

```javascript
// String → Text input
"田中太郎";
new Date().getFullYear().toString();

// Number → Number input
2025;
Math.floor(Math.random() * 100)[
  // Array → Radio buttons
  ("晴れ", "曇り", "雨", "雪")
][
  // Object array → Select dropdown
  ({ value: "sunny", label: "晴れ" },
  { value: "cloudy", label: "曇り" },
  { value: "rainy", label: "雨" })
];

// Boolean → Checkbox
true;
Math.random() > 0.5;

// Date → Date picker (with natural language support)
("tomorrow");
("next Monday");
("today + 3 days");
new Date().toLocaleDateString();
```

## 🏗️ Architecture

- **4-panel Layout**: Template list, editor, variable form, and preview
- **Hook-based State Management**: Custom hooks for core functionality
- **TypeScript**: Strong typing throughout the application
- **External Dependencies**: Handlebars.js (CDN), LocalStorage for persistence

## 🔒 Security Note

⚠️ This application uses `eval()` or `Function` constructor to execute JavaScript code for dynamic defaults. This is acceptable for development/testing environments but introduces security risks in production.

## 📦 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Handlebars.js** - Template processing
- **Day.js** - Date manipulation
- **Chrono-node** - Natural language date parsing
- **React DatePicker** - Date input component

## 🚀 Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. Every push to the main branch triggers a new deployment.

## 📄 License

MIT License
