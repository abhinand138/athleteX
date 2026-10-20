import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Chat from '../pages/Chat';

vi.mock('../services/chatService', () => ({
  default: {
    getConversations: vi.fn().mockResolvedValue([
      {
        conversationId: "conv_coach_mike",
        otherUserId: "coach_mike",
        otherUserName: "Coach Mike",
        otherUserRole: "COACH",
        otherUserSport: "Track & Field",
        lastMessage: "Great form on your 100m sprint today!",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 1,
        isOnline: true
      }
    ]),
    getMessages: vi.fn().mockResolvedValue([]),
    sendMessage: vi.fn().mockResolvedValue({ id: 'msg_new' })
  }
}));

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

    expect(screen.getByPlaceholderText(/Search conversations.../i)).toBeInTheDocument();

    // findAllByText automatically waits for async state resolution
    const coachElements = await screen.findAllByText(/Coach Mike/i);
    expect(coachElements.length).toBeGreaterThan(0);
  });
});
