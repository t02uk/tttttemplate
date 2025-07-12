import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

// Test utilities for component testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock template for testing
export const mockTemplate = {
  id: 'test-template-1',
  name: 'Test Template',
  content: 'Hello {{name}}, today is {{date}}',
  variables: [
    {
      name: 'name',
      defaultFunction: '"John Doe"',
      uiType: 'text' as const,
      currentValue: 'John Doe',
    },
    {
      name: 'date',
      defaultFunction: 'new Date().toLocaleDateString()',
      uiType: 'text' as const,
      currentValue: '2025-01-15',
    }
  ],
  createdAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-01-15'),
}

// Mock variable config for testing
export const mockVariableConfig = {
  name: 'testVar',
  defaultFunction: '"test value"',
  uiType: 'text' as const,
  currentValue: 'test value',
}

// Mock variable values for testing
export const mockVariableValues = {
  name: 'John Doe',
  date: '2025-01-15',
  weather: 'sunny',
}