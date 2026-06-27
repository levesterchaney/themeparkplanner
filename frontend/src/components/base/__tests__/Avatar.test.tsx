import React from 'react';
import { render } from '@testing-library/react';
import Avatar from '../Avatar';

describe('Avatar', () => {
  it('renders without crashing', () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders a div element', () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });
});
