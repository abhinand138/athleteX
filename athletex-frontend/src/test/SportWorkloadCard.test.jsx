import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SportWorkloadCard from "../components/performance/SportWorkloadCard";
import api from "../services/api";

vi.mock("../services/api");

describe("SportWorkloadCard Component Tests", () => {
  const mockCricketData = {
    userId: "athlete_1",
    primarySport: "CRICKET",
    acute7DayOvers: 18.4,
    chronic28DayWeeklyOvers: 15.0,
    bowlingAcwr: 1.23,
    lumbarStressStatus: "OPTIMAL_LOAD",
    lumbarStressBadge: "🟢 Safe Workload Zone (0.8 - 1.3)",
    lumbarRecommendation: "Optimal fast bowling workload. Bone density and muscular capacity are adapting progressively.",
    peakBowlingSpeedKmh: 141.2,
    maxRecommendedOversToday: "10 - 12 Overs Permitted",
    recentLogs: [
      {
        id: "log_1",
        sport: "CRICKET",
        sessionType: "MATCH",
        date: "2026-10-24",
        totalOvers: 10.0,
        matchOvers: 10.0,
        practiceOvers: 0.0,
        rpe: 8
      }
    ]
  };

  const mockFootballData = {
    userId: "athlete_1",
    primarySport: "FOOTBALL",
    totalDistanceWeeklyKm: 28.5,
    highSpeedRunningWeeklyM: 780.0,
    sprintDistanceWeeklyM: 250.0,
    peakMatchVelocityKmh: 33.4,
    totalMatchMinutesWeekly: 180,
    hsrPercentageOfDistance: 8.8,
    footballLoadStatus: "MATCH_FIT",
    footballLoadBadge: "🟢 Pro High-Speed Exposure",
    footballRecommendation: "Weekly High-Speed Running provides neuromuscular inoculation against hamstring strains.",
    recentLogs: [
      {
        id: "log_2",
        sport: "FOOTBALL",
        sessionType: "MATCH",
        date: "2026-10-23",
        totalDistanceKm: 10.2,
        highSpeedRunningMeters: 750,
        rpe: 9
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Cricket Fast Bowler Workload Hub with ACWR metrics and prescription", async () => {
    api.get.mockResolvedValueOnce({ data: mockCricketData });

    render(
      <SportWorkloadCard
        userId="athlete_1"
        onOpenLogModal={vi.fn()}
        refreshTrigger={0}
      />
    );

    // Wait for data load
    await waitFor(() => {
      expect(
        screen.getByText("Cricket Fast Bowler Lumbar Workload Engine")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("18.4")).toBeInTheDocument();
    expect(screen.getAllByText("1.23").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("141.2 km/h")).toBeInTheDocument();
    expect(
      screen.getByText("🟢 Safe Workload Zone (0.8 - 1.3)")
    ).toBeInTheDocument();
  });

  it("switches to Football Match Load & GPS Hub when clicking Football tab", async () => {
    api.get
      .mockResolvedValueOnce({ data: mockCricketData })
      .mockResolvedValueOnce({ data: mockFootballData });

    render(
      <SportWorkloadCard
        userId="athlete_1"
        onOpenLogModal={vi.fn()}
        refreshTrigger={0}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText("Cricket Fast Bowler Lumbar Workload Engine")
      ).toBeInTheDocument();
    });

    const footballBtn = screen.getByRole("button", { name: /⚽ Football/i });
    fireEvent.click(footballBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Football Match Load & GPS Wearables Hub")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("780")).toBeInTheDocument();
    expect(screen.getByText("33.4 km/h")).toBeInTheDocument();
  });

  it("calls onOpenLogModal with active sport when clicking Log button", async () => {
    api.get.mockResolvedValueOnce({ data: mockCricketData });
    const mockOpenModal = vi.fn();

    render(
      <SportWorkloadCard
        userId="athlete_1"
        onOpenLogModal={mockOpenModal}
        refreshTrigger={0}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Log Bowling Spell/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Log Bowling Spell/i }));
    expect(mockOpenModal).toHaveBeenCalledWith("CRICKET");
  });
});
