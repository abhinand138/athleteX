import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import AthleteCoaches from '../pages/athlete/AthleteCoaches';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('AthleteCoaches Marketplace Component Tests', () => {
  const mockCoaches = [
    {
      id: 'coach-1',
      fullName: 'Marcus Vance',
      email: 'marcus.vance@athletex.com',
      sport: 'Track & Field',
      title: 'Elite Performance Director',
      specialization: 'Sprint Biomechanics',
      experienceYears: 12,
      certifications: 'USATF Level 3',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      bio: 'Olympic trials finalist',
      isAssignedToAthlete: false,
      monthlyRate: 4999.0,
      consultationRate: 1999.0,
      currency: 'INR'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({
      id: 'athlete-1',
      fullName: 'Alex Rivera',
      email: 'alex@athletex.com',
      role: 'ATHLETE'
    }));

    api.get.mockImplementation((url) => {
      if (url.includes('/coaches/directory')) {
        return Promise.resolve({ data: mockCoaches });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('renders marketplace coaches with pricing badges', async () => {
    render(
      <MemoryRouter>
        <AthleteCoaches />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
      expect(screen.getAllByText(/₹4[,.]?999/)[0]).toBeInTheDocument();
      expect(screen.getByText('Hire Coach')).toBeInTheDocument();
    });
  });

  it('opens checkout modal with Razorpay tab active and triggers order flow', async () => {
    api.post.mockImplementation((url) => {
      if (url.includes('/razorpay/create-order')) {
        return Promise.resolve({
          data: {
            orderId: 'order_test_123',
            amountInPaise: 499900,
            displayAmount: 4999.0,
            currency: 'INR',
            keyId: 'rzp_test_SonD1t5pBjHTet',
            coachId: 'coach-1',
            coachName: 'Marcus Vance'
          }
        });
      }
      if (url.includes('/razorpay/verify')) {
        return Promise.resolve({
          data: {
            transactionId: 'tx-rzp-1',
            receiptNumber: 'REC-RZP-998877',
            athleteName: 'Alex Rivera',
            coachName: 'Marcus Vance',
            amount: 4999.0,
            currency: 'INR',
            status: 'COMPLETED',
            paymentType: 'COACH_MONTHLY_SUBSCRIPTION',
            gatewayReferenceId: 'pay_test_456',
            message: 'Razorpay payment verified!'
          }
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <AthleteCoaches />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Hire Coach')).toBeInTheDocument();
    });

    // Click Hire Coach to open checkout modal
    fireEvent.click(screen.getByText('Hire Coach'));

    // Checkout modal is visible with Razorpay options
    expect(screen.getByText('Coach Marketplace Checkout')).toBeInTheDocument();
    expect(screen.getByText(/Pay ₹4,999 with Razorpay/i)).toBeInTheDocument();

    // Trigger Razorpay payment
    fireEvent.click(screen.getByText(/Pay ₹4,999 with Razorpay/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/payments/razorpay/create-order',
        expect.objectContaining({
          coachId: 'coach-1',
          athleteId: 'athlete-1',
          paymentType: 'COACH_MONTHLY_SUBSCRIPTION'
        })
      );
      expect(screen.getByText('Welcome to Team Marcus Vance!')).toBeInTheDocument();
    });
  });

  it('allows switching to Direct Card Sandbox and processes payment', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        transactionId: 'tx-123',
        receiptNumber: 'REC-998877',
        athleteName: 'Alex Rivera',
        coachName: 'Marcus Vance',
        amount: 4999.0,
        currency: 'INR',
        status: 'COMPLETED',
        paymentType: 'COACH_MONTHLY_SUBSCRIPTION',
        gatewayReferenceId: 'atx_sim_123',
        message: 'Coaching access activated!'
      }
    });

    render(
      <MemoryRouter>
        <AthleteCoaches />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Hire Coach')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Hire Coach'));

    // Switch to Card Sandbox
    fireEvent.click(screen.getByText(/Test Card/i));

    await waitFor(() => {
      expect(screen.getByText(/Confirm & Pay ₹4999\.00 INR/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Confirm & Pay ₹4999\.00 INR/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/payments/checkout',
        expect.objectContaining({
          coachId: 'coach-1',
          athleteId: 'athlete-1',
          paymentType: 'COACH_MONTHLY_SUBSCRIPTION'
        })
      );
      expect(screen.getByText('Welcome to Team Marcus Vance!')).toBeInTheDocument();
    });
  });
});
