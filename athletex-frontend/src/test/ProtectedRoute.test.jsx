import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

describe('ProtectedRoute Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated user to /login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument();
  });

  it('renders children when user is logged in with matching role', () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'COACH' }));

    render(
      <MemoryRouter initialEntries={['/coach/dashboard']}>
        <Routes>
          <Route
            path="/coach/dashboard"
            element={
              <ProtectedRoute requiredRole="COACH">
                <div>Coach Secret Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Coach Secret Dashboard')).toBeInTheDocument();
  });

  it('redirects to role dashboard when user role does not match requiredRole', () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u2', role: 'ATHLETE' }));

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<div>Athlete Main Dashboard</div>} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <div>Admin Restricted Area</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Athlete Main Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin Restricted Area')).not.toBeInTheDocument();
  });
});
