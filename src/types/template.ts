export interface Template {
  id: string;
  name: string;
  content: string;
  variables: VariableConfig[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VariableConfig {
  name: string;
  defaultFunction: string; // JavaScript関数のコード
  uiType: 'text' | 'number' | 'radio' | 'select' | 'checkbox' | 'date';
  currentValue: unknown;
  options?: unknown[]; // radio/selectの選択肢
  dateFormat?: string; // 日付フォーマット（日付タイプの場合）
  naturalLanguageInput?: string; // 自然言語の日付入力（"Today", "Tomorrow"など）
}

export type UIType = 'text' | 'number' | 'radio' | 'select' | 'checkbox' | 'date';

export interface VariableValue {
  [key: string]: unknown;
}

declare global {
  interface Window {
    Handlebars: unknown;
  }
}