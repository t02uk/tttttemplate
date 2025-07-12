export function extractVariables(template: string): string[] {
  const regex = /\{\{\s*([^{}]+)\s*\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const variableName = match[1].trim();
    if (!variables.includes(variableName)) {
      variables.push(variableName);
    }
  }

  return variables;
}