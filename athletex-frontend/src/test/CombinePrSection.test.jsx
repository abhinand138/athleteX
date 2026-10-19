import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CombinePrSection from "../components/performance/CombinePrSection";

describe("CombinePrSection Component Tests", () => {
  const mockCombineData = {
    userId: "athlete_1",
    totalAttempts: 5,
    personalRecordsCount: 2,
    personalRecords: [
      {
        drillCode: "40_YARD_DASH",
        drillName: "40-Yard Dash",
        category: "SPEED",
        bestValue: 4.42,
        unit: "s",
        lowerIsBetter: true,
        attemptCount: 3,
        percentile: 94.0,
        tierBadge: "Pro",
        isCoachVerified: true,
        verifiedByCoachName: "Coach Alex"
      },
      {
        drillCode: "VERTICAL_JUMP",
        drillName: "Vertical Jump",
        category: "STRENGTH",
        bestValue: 34.5,
        unit: "in",
        lowerIsBetter: false,
        attemptCount: 2,
        percentile: 92.0,
        tierBadge: "Pro",
        isCoachVerified: false
      }
    ],
    recentAttempts: [
      {
        id: "att_1",
        drillName: "40-Yard Dash",
        value: 4.42,
        unit: "s",
        tierBadge: "Pro",
        percentile: 94.0,
        isPersonalRecord: true,
        recordedAt: "2026-10-18T10:00:00"
      }
    ],
    benchmarkScores: {
      speed: 94.0,
      strength: 92.0,
      endurance: 0.0,
      agility: 0.0,
      overall: 93.0
    }
  };

  it("renders the combine testing section header and PR cards correctly", () => {
    render(
      <CombinePrSection
        userId="athlete_1"
        combineData={mockCombineData}
        onOpenLogModal={vi.fn()}
        onOpenHistoryModal={vi.fn()}
        onRefreshData={vi.fn()}
      />
    );

    expect(screen.getByText("Personal Records & Athletic Drills")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "40-Yard Dash" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vertical Jump" })).toBeInTheDocument();
    expect(screen.getAllByText("4.42").length).toBeGreaterThan(0);
    expect(screen.getByText("34.5")).toBeInTheDocument();
    expect(screen.getByText("Verified by Coach Alex")).toBeInTheDocument();
  });

  it("triggers onOpenLogModal when clicking '+ Log Combine Drill' button", () => {
    const handleLogMock = vi.fn();
    render(
      <CombinePrSection
        userId="athlete_1"
        combineData={mockCombineData}
        onOpenLogModal={handleLogMock}
        onOpenHistoryModal={vi.fn()}
        onRefreshData={vi.fn()}
      />
    );

    const logBtn = screen.getByRole("button", { name: /Log Combine Drill/i });
    fireEvent.click(logBtn);
    expect(handleLogMock).toHaveBeenCalled();
  });

  it("filters PR cards when clicking category filter buttons", () => {
    render(
      <CombinePrSection
        userId="athlete_1"
        combineData={mockCombineData}
        onOpenLogModal={vi.fn()}
        onOpenHistoryModal={vi.fn()}
        onRefreshData={vi.fn()}
      />
    );

    // Click Speed filter
    const speedBtn = screen.getByRole("button", { name: /⚡ Speed/i });
    fireEvent.click(speedBtn);

    // 40-Yard Dash card heading should be visible, Vertical Jump card heading should be filtered out
    expect(screen.getByRole("heading", { name: "40-Yard Dash" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Vertical Jump" })).not.toBeInTheDocument();
  });
});
