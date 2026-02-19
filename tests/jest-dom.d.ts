// jest-dom.d.ts
import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeInTheDocument(): T;
      toHaveClass(...classNames: string[]): T;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): T;
      toHaveStyle(css: string | object): T;
      toHaveAttribute(attr: string, value?: any): T;
      toHaveFocus(): T;
      toBeVisible(): T;
      toBeDisabled(): T;
      toContainElement(element: HTMLElement | null): T;
      toContainHTML(html: string): T;
    }
  }
}

export {};