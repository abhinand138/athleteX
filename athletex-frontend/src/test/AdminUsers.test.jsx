import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import AdminUsers from '../pages/admin/AdminUsers';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

describe('AdminUsers Governance Component Tests', () => {
  const mockUsers = [
    {
      id: 'admin_1',
      fullName: 'System Administrator',
      email: 'admin@athletex.com',
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      sport: 'All',
      phone: '111-222-3333',
      city: 'Headquarters',
      activeAssignmentsCount: 0
    },
    {
      id: 'athlete_1',
      fullName: 'John Track',
      email: 'john@track.com',
      role: 'ATHLETE',
      accountStatus: 'SUSPENDED',
      suspensionReason: 'Terms violation',
      sport: 'Sprinting',
      phone: '999-888-7777',
      city: 'Austin',
      activeAssignmentsCount: 1
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({
      id: 'admin_1',
      email: 'admin@athletex.com',
      role: 'ADMIN',
      fullName: 'System Administrator'
    }));

    api.get.mockImplementation((url) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({ data: mockUsers });
      }
      if (url.includes('/notifications')) {
        return Promise.resolve({ data: { count: 0 } });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('renders User Directory with Role and Status filter controls', async () => {
    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User Directory')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Search by name, email, sport, or city/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Role/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Status/i).length).toBeGreaterThan(0);
  });

  it('renders user cards with account status badges and self protection badge', async () => {
    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('System Administrator')).toBeInTheDocument();
      expect(screen.getByText('John Track')).toBeInTheDocument();
    });

    // Check for "You" self-account badge
    expect(screen.getByText('You')).toBeInTheDocument();

    // Check for Status badges / filters
    expect(screen.getAllByText(/ACTIVE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/SUSPENDED/i).length).toBeGreaterThan(0);
  });

  it('opens account status governance modal when clicking status button', async () => {
    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Track')).toBeInTheDocument();
    });

    // Find governance button for the second user (John Track)
    const statusButtons = screen.getAllByTitle(/Manage Account Status/i);
    expect(statusButtons.length).toBeGreaterThan(0);

    fireEvent.click(statusButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Account Governance')).toBeInTheDocument();
      expect(screen.getByText('Target Account Status')).toBeInTheDocument();
    });
  });
});
