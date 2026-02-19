import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

const TestComponent = () => <div>Hello World</div>;

describe('Simple React Component Test', () => {
  it('should render correctly', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});