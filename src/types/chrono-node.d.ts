declare module 'chrono-node' {
  export function parseDate(text: string, ref?: Date): Date | null;
  export function parse(text: string, ref?: Date): any[];
  
  export interface ParsedResult {
    start: ParsedComponents;
    end?: ParsedComponents;
    index: number;
    text: string;
  }
  
  export interface ParsedComponents {
    date(): Date;
    get(component: string): number | null;
  }
}