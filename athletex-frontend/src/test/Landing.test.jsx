import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../pages/Landing';

describe('Landing Page Navigation & Buttons', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders landing page hero and call-to-action buttons for guest visitors', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    // Hero buttons
    const athleteSignUpBtn = screen.getByRole('link', { name: /SIGN UP AS ATHLETE/i });
    expect(athleteSignUpBtn).toBeInTheDocument();
    expect(athleteSignUpBtn.getAttribute('href')).toBe('/register?role=ATHLETE');

    const scoutJoinBtn = screen.getByRole('link', { name: /JOIN AS SCOUT/i });
    expect(scoutJoinBtn).toBeInTheDocument();
    expect(scoutJoinBtn.getAttribute('href')).toBe('/register?role=COACH');

    // Navbar links
    const signInLinks = screen.getAllByRole('link', { name: /Sign In/i });
    expect(signInLinks.length).toBeGreaterThan(0);
    expect(signInLinks[0].getAttribute('href')).toBe('/login');

    const getStartedLinks = screen.getAllByRole('link', { name: /Get Started/i });
    expect(getStartedLinks.length).toBeGreaterThan(0);
    expect(getStartedLinks[0].getAttribute('href')).toBe('/register');

    // Rising Stars link
    const viewAllTalentLink = screen.getByRole('link', { name: /VIEW ALL TALENT/i });
    expect(viewAllTalentLink).toBeInTheDocument();
    expect(viewAllTalentLink.getAttribute('href')).toBe('/register?role=COACH');

    // Programs CTA
    const startEvaluationLink = screen.getByRole('link', { name: /START YOUR ATHLETE EVALUATION/i });
    expect(startEvaluationLink).toBeInTheDocument();
    expect(startEvaluationLink.getAttribute('href')).toBe('/register?role=ATHLETE');

    // CTA Arena buttons
    const ctaGetStarted = screen.getByRole('link', { name: /GET STARTED NOW/i });
    expect(ctaGetStarted).toBeInTheDocument();
    expect(ctaGetStarted.getAttribute('href')).toBe('/register');
  });

  it('renders dashboard access buttons when user is authenticated as coach', () => {
    localStorage.setItem('user', JSON.stringify({
      id: 'coach123',
      fullName: 'Coach Carter',
      email: 'carter@athletex.com',
      role: 'COACH',
      token: 'fake-coach-token'
    }));

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    // Hero displays ENTER DASHBOARD
    const enterDashboardBtn = screen.getByRole('link', { name: /ENTER DASHBOARD/i });
    expect(enterDashboardBtn).toBeInTheDocument();
    expect(enterDashboardBtn.getAttribute('href')).toBe('/coach/dashboard');

    // CTA Arena displays ACCESS DASHBOARD
    const accessDashboardBtn = screen.getByRole('link', { name: /ACCESS DASHBOARD/i });
    expect(accessDashboardBtn).toBeInTheDocument();
    expect(accessDashboardBtn.getAttribute('href')).toBe('/coach/dashboard');

    // Rising Stars View All Talent links directly to coach athletes
    const viewTalentLink = screen.getByRole('link', { name: /VIEW ALL TALENT/i });
    expect(viewTalentLink.getAttribute('href')).toBe('/coach/athletes');
  });
});
