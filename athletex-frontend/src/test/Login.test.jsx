import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Login Page Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign-in header and input fields correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Enter registered full name or email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AUTHORIZE ACCESS/i })).toBeInTheDocument();
  });

  it('handles user input and updates state', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const identifierInput = screen.getByPlaceholderText(/Enter registered full name or email/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    fireEvent.change(identifierInput, { target: { value: 'coach@athletex.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });

    expect(identifierInput.value).toBe('coach@athletex.com');
    expect(passwordInput.value).toBe('Secret123!');
  });
});
