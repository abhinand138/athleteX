import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import AiWorkoutGeneratorModal from '../components/coach/AiWorkoutGeneratorModal';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('AiWorkoutGeneratorModal Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 'coach_123', fullName: 'Coach Mike', role: 'COACH' })
    );

    api.get.mockResolvedValue({
      data: [
        { athleteId: 'athlete_1', fullName: 'Sarah Sprint', sport: 'Track & Field' }
      ]
    });

    api.post.mockResolvedValue({
      data: {
        title: 'AI Explosive Speed Program (Track & Field)',
        summary: 'Custom 45-minute AI program.',
        sport: 'Track & Field',
        focusArea: 'Explosive Speed',
        targetIntensity: 'ADVANCED',
        totalDurationMinutes: 45,
        estimatedCaloriesBurned: 428,
        warmupExercises: [{ name: 'Dynamic Leg Swings', sets: '2 Sets', repsOrDuration: '30s', restInterval: '15s', coachingNotes: 'Warmup note' }],
        mainDrills: [{ name: 'Resisted Acceleration Sprints', sets: '4 Sets', repsOrDuration: '20m', restInterval: '90s', coachingNotes: 'Main drill note' }],
        cooldownExercises: [{ name: 'Diaphragmatic Breathing', sets: '1 Set', repsOrDuration: '5 mins', restInterval: 'None', coachingNotes: 'Cooldown note' }],
        aiCoachTip: 'Maintain optimal ground contact time.'
      }
    });
  });

  it('renders modal controls and generates AI workout plan upon action', async () => {
    render(
      <AiWorkoutGeneratorModal isOpen={true} onClose={vi.fn()} />
    );

    expect(screen.getByText(/AI Workout & Drill Generator/i)).toBeInTheDocument();
    
    const generateBtn = screen.getByRole('button', { name: /Generate AI Workout Routine/i });
    expect(generateBtn).toBeInTheDocument();

    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/AI Explosive Speed Program/i)).toBeInTheDocument();
      expect(screen.getByText(/Resisted Acceleration Sprints/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
