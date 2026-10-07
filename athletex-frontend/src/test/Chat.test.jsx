import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Chat from '../pages/Chat';

describe('Chat Platform Page Component Tests', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    localStorage.setItem(
      'user',
      JSON.stringify({ id: 'user_1', fullName: 'Athlete John', role: 'ATHLETE' })
    );
  });

  it('renders chat layout header and conversation controls', async () => {
    render(
      <MemoryRouter>
        <Chat />
      </MemoryRouter>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(screen.getByPlaceholderText(/Search conversations.../i)).toBeInTheDocument();
    
    // Assert presence of Coach Mike contact name (rendered in sidebar roster and active chat header)
    const coachElements = screen.getAllByText('Coach Mike');
    expect(coachElements.length).toBeGreaterThan(0);
  });
});
