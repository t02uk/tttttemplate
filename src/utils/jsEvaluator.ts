export function evaluateJavaScript(functionCode: string): { value: unknown; error: string | null } {
  try {
    const func = new Function('return ' + functionCode);
    const result = func();
    return { value: result, error: null };
  } catch (error) {
    return { 
      value: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export function safeEvaluate(functionCode: string, fallbackValue: unknown = ''): unknown {
  const result = evaluateJavaScript(functionCode);
  return result.error ? fallbackValue : result.value;
}