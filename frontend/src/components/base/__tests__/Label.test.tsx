import React from 'react';
import { render, screen } from '@testing-library/react';
import Label from '../Label';

describe('Label', () => {
  it('renders the provided text', () => {
    render(<Label text="Party Size" />);
    expect(screen.getByText('Party Size')).toBeInTheDocument();
  });

  it('renders a label element', () => {
    render(<Label text="Email" />);
    expect(screen.getByText('Email').tagName).toBe('LABEL');
  });

  it('renders with different text values', () => {
    const { rerender } = render(<Label text="First Name" />);
    expect(screen.getByText('First Name')).toBeInTheDocument();

    rerender(<Label text="Last Name" />);
    expect(screen.getByText('Last Name')).toBeInTheDocument();
  });
});
