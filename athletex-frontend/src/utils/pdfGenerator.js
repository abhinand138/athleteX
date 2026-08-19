import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generatePdfReport(type, data, coachName = "Coach", range = "30d") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Colors
  const primaryColor = [15, 23, 42]; // #0F172A
  const accentColor = [238, 155, 116]; // #EE9B74
  const slateDark = [30, 41, 59]; // #1E293B
  const slateLight = [248, 250, 252]; // #F8FAFC
  const slateBorder = [226, 232, 240]; // #E2E8F0
  const textDark = [15, 23, 42];
  const textMuted = [100, 116, 139];

  // =========================================================================
  // HEADER BANNER
  // =========================================================================
  const drawHeader = (title, subtitle) => {
    // Top banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 28, "F");

    // Accent line
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 28, pageWidth, 1.5, "F");

    // Logo & Brand
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("ATHLETEX", margin, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text("PERFORMANCE INTELLIGENCE & EVALUATION SYSTEM", margin, 17);

    // Title on right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), pageWidth - margin, 12, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(subtitle, pageWidth - margin, 17, { align: "right" });

    // Meta details bar
    doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
    doc.rect(margin, 34, pageWidth - margin * 2, 10, "F");
    doc.setDrawColor(slateBorder[0], slateBorder[1], slateBorder[2]);
    doc.rect(margin, 34, pageWidth - margin * 2, 10, "S");

    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Supervising Coach: `, margin + 3, 40.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont("helvetica", "bold");
    doc.text(coachName, margin + 31, 40.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Date Generated: `, margin + 85, 40.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont("helvetica", "bold");
    doc.text(new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }), margin + 109, 40.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Period: `, pageWidth - margin - 35, 40.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(range.toUpperCase(), pageWidth - margin - 22, 40.5);
  };

  // Footer for each page
  const addFooter = (docInstance) => {
    const totalPages = docInstance.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      docInstance.setPage(i);
      docInstance.setDrawColor(slateBorder[0], slateBorder[1], slateBorder[2]);
      docInstance.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      docInstance.setFont("helvetica", "normal");
      docInstance.setFontSize(7.5);
      docInstance.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      docInstance.text("AthleteX Coaching Intelligence • Official Confidential Assessment", margin, pageHeight - 7);
      docInstance.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    }
  };

  // Section Header helper
  const addSectionHeading = (yPos, title) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(title, margin, yPos);

    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(margin, yPos + 1.5, 18, 1, "F");
    return yPos + 6;
  };

  // =========================================================================
  // 1. INDIVIDUAL ATHLETE REPORT
  // =========================================================================
  if (type === "INDIVIDUAL" && data) {
    drawHeader("Athlete Performance Evaluation", "OFFICIAL EVALUATION DOSSIER");

    let curY = 48;
    curY = addSectionHeading(curY, "1. ATHLETE PROFILE & BIOMETRICS");

    // Profile Table
    autoTable(doc, {
      startY: curY,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2.5, textColor: textDark, lineColor: slateBorder },
      head: [["Athlete Full Name", "Sport & Discipline", "Position", "Age", "Gender", "Height", "Weight", "Location"]],
      body: [[
        data.athleteName || "N/A",
        data.sport || "N/A",
        data.position || "N/A",
        data.age ? `${data.age} yrs` : "N/A",
        data.gender || "N/A",
        data.height ? `${data.height} cm` : "N/A",
        data.weight ? `${data.weight} kg` : "N/A",
        [data.city, data.state].filter(Boolean).join(", ") || "N/A"
      ]],
    });

    curY = doc.lastAutoTable.finalY + 7;
    curY = addSectionHeading(curY, "2. PERFORMANCE ASSESSMENT & PHYSICAL CAPACITIES");

    // Overall Score + 4 Metrics
    autoTable(doc, {
      startY: curY,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: slateBorder },
      head: [["Overall Calculated Score", "Speed Rating", "Strength Rating", "Endurance Rating", "Agility Rating", "Previous Score", "Trend Direction"]],
      body: [[
        `${data.overallScore || 0}%`,
        `${data.speed || 0}%`,
        `${data.strength || 0}%`,
        `${data.endurance || 0}%`,
        `${data.agility || 0}%`,
        `${data.previousScore || 0}%`,
        data.trend || "NEUTRAL"
      ]],
    });

    curY = doc.lastAutoTable.finalY + 7;
    curY = addSectionHeading(curY, "3. TRAINING WORKLOAD & COMPLETION STATISTICS");

    autoTable(doc, {
      startY: curY,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: slateBorder },
      head: [["Total Sessions Assigned", "Completed Workouts", "Scheduled Workouts", "Cancelled Workouts", "Completion Efficiency Rate"]],
      body: [[
        `${data.totalTrainings || 0}`,
        `${data.completedTrainings || 0}`,
        `${data.scheduledTrainings || 0}`,
        `${data.cancelledTrainings || 0}`,
        `${data.trainingCompletionRate || 0}%`
      ]],
    });

    curY = doc.lastAutoTable.finalY + 7;
    curY = addSectionHeading(curY, "4. ATHLETIC MILESTONES & ACHIEVEMENTS");

    if (data.achievementsList && data.achievementsList.length > 0) {
      const achRows = data.achievementsList.map((a, idx) => [
        `#${idx + 1}`,
        a.title || "Achievement",
        a.category || "General",
        a.level || "Regional",
        a.date ? new Date(a.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "N/A",
        a.description || "N/A"
      ]);

      autoTable(doc, {
        startY: curY,
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 7.5, cellPadding: 2.5, textColor: textDark, lineColor: slateBorder },
        head: [["No.", "Milestone Title", "Category", "Level", "Date Achieved", "Description / Notes"]],
        body: achRows,
      });
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text("No achievements recorded for this athlete during this evaluation period.", margin, curY + 4);
    }
  }

  // =========================================================================
  // 2. TEAM ROSTER REPORT
  // =========================================================================
  else if (type === "TEAM" && data) {
    drawHeader("Team Performance Evaluation", "ROSTER READINESS & RANKING SUMMARY");

    let curY = 48;
    curY = addSectionHeading(curY, "1. SQUAD SUMMARY METRICS");

    autoTable(doc, {
      startY: curY,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: slateBorder },
      head: [["Total Active Athletes", "Average Performance", "Squad Training Completion", "Total Achievements Logged"]],
      body: [[
        `${data.teamSummary?.totalAthletes || 0}`,
        `${data.teamSummary?.averagePerformance || 0}%`,
        `${data.teamSummary?.trainingCompletionRate || 0}%`,
        `${data.teamSummary?.totalAchievements || 0}`
      ]],
    });

    curY = doc.lastAutoTable.finalY + 7;
    curY = addSectionHeading(curY, "2. ATHLETE PERFORMANCE LEADERBOARD");

    if (data.athleteRankings && data.athleteRankings.length > 0) {
      const rows = data.athleteRankings.map((a) => [
        `#${a.rank}`,
        a.name || "Athlete",
        a.sport || "N/A",
        `${a.performanceScore || 0}%`,
        `${a.trainingCompletionRate || 0}%`,
        `${a.achievementCount || 0}`,
        a.trend || "NEUTRAL"
      ]);

      autoTable(doc, {
        startY: curY,
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 2.5, textColor: textDark, lineColor: slateBorder },
        head: [["Rank", "Athlete Full Name", "Sport", "Performance Score", "Training Completion", "Achievements", "Trend"]],
        body: rows,
      });
    }
  }

  // =========================================================================
  // 3. TRAINING REPORT
  // =========================================================================
  else if (type === "TRAINING" && data) {
    drawHeader("Comprehensive Training Report", "WORKLOAD & SESSION EFFICIENCY OVERVIEW");

    let curY = 48;
    curY = addSectionHeading(curY, "1. WORKLOAD OVERVIEW");

    autoTable(doc, {
      startY: curY,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: slateBorder },
      head: [["Total Sessions Assigned", "Completed Workouts", "Scheduled Workouts", "Cancelled Workouts", "Completion Efficiency Rate"]],
      body: [[
        `${data.totalTrainings || 0}`,
        `${data.completed || 0}`,
        `${data.scheduled || 0}`,
        `${data.cancelled || 0}`,
        `${data.completionRate || 0}%`
      ]],
    });

    curY = doc.lastAutoTable.finalY + 7;
    curY = addSectionHeading(curY, "2. ATHLETE TRAINING BREAKDOWN");

    if (data.athleteTrainingStats && data.athleteTrainingStats.length > 0) {
      const rows = data.athleteTrainingStats.map((s) => [
        s.athleteName || "Athlete",
        s.sport || "N/A",
        `${s.totalSessions || 0}`,
        `${s.completed || 0}`,
        `${s.scheduled || 0}`,
        `${s.cancelled || 0}`,
        `${s.completionRate || 0}%`
      ]);

      autoTable(doc, {
        startY: curY,
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 2.5, textColor: textDark, lineColor: slateBorder },
        head: [["Athlete Full Name", "Sport", "Total Sessions", "Completed", "Scheduled", "Cancelled", "Completion Rate"]],
        body: rows,
      });
    }
  }

  // =========================================================================
  // 4. ACHIEVEMENT REPORT
  // =========================================================================
  else if (type === "ACHIEVEMENT" && data) {
    drawHeader("Athletic Achievements Report", "MILESTONE TRACKER & RECORD DOSSIER");

    let curY = 48;
    curY = addSectionHeading(curY, "1. CATEGORY METRICS");

    autoTable(doc, {
      startY: curY,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: slateBorder },
      head: [["Total Achievements", "Championships", "Medals", "Records", "Milestones", "Awards"]],
      body: [[
        `${data.totalAchievements || 0}`,
        `${data.championships || 0}`,
        `${data.medals || 0}`,
        `${data.records || 0}`,
        `${data.milestones || 0}`,
        `${data.awards || 0}`
      ]],
    });

    curY = doc.lastAutoTable.finalY + 7;
    curY = addSectionHeading(curY, "2. ACHIEVEMENT LEADERBOARD");

    if (data.leaderboard && data.leaderboard.length > 0) {
      const rows = data.leaderboard.map((l) => [
        `#${l.rank}`,
        l.athleteName || "Athlete",
        l.sport || "N/A",
        `${l.totalAchievements || 0}`,
        `${l.records || 0}`,
        `${l.awards || 0}`
      ]);

      autoTable(doc, {
        startY: curY,
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 2.5, textColor: textDark, lineColor: slateBorder },
        head: [["Rank", "Athlete Full Name", "Sport", "Total Achievements", "Records", "Awards"]],
        body: rows,
      });
    }
  }

  // =========================================================================
  // 5. ANALYTICS REPORT
  // =========================================================================
  else if (type === "ANALYTICS" && data) {
    drawHeader("Performance Analytics Report", "MACRO PROGRESSION & INSIGHTS DOSSIER");

    let curY = 48;
    curY = addSectionHeading(curY, "1. SQUAD PERFORMANCE SUMMARY");

    autoTable(doc, {
      startY: curY,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: slateBorder },
      head: [["Total Athletes", "Average Performance", "Training Completion Rate", "Total Achievements Logged"]],
      body: [[
        `${data.summary?.totalAthletes || 0}`,
        `${data.summary?.averagePerformance || 0}%`,
        `${data.summary?.trainingCompletionRate || 0}%`,
        `${data.summary?.totalAchievements || 0}`
      ]],
    });

    curY = doc.lastAutoTable.finalY + 7;
    curY = addSectionHeading(curY, "2. CATEGORY AVERAGE & PEAK BENCHMARKS");

    if (data.categoryAnalysis && data.categoryAnalysis.length > 0) {
      const rows = data.categoryAnalysis.map((c) => [
        c.category || "N/A",
        `${c.avgScore || 0}%`,
        `${c.topScore || 0}%`,
        `${c.testedAthletes || 0} athletes`
      ]);

      autoTable(doc, {
        startY: curY,
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 2.5, textColor: textDark, lineColor: slateBorder },
        head: [["Physical Disciplinary Area", "Roster Average Score", "Peak Performer Score", "Athletes Tested"]],
        body: rows,
      });
    }
  }

  // =========================================================================
  // 6. COMPARISON REPORT
  // =========================================================================
  else if (type === "COMPARISON" && Array.isArray(data)) {
    drawHeader("Head-to-Head Athlete Comparison", "SIDE-BY-SIDE EVALUATION MATRIX");

    let curY = 48;
    curY = addSectionHeading(curY, "1. METRIC COMPARISON MATRIX");

    const athleteNames = data.map((a) => `${a.athleteName} (${a.sport})`);
    const headers = ["Evaluation Attribute", ...athleteNames];

    const rows = [
      ["Overall Performance Score", ...data.map((a) => `${a.overallScore}%`)],
      ["Speed Rating", ...data.map((a) => `${a.speed}%`)],
      ["Strength Rating", ...data.map((a) => `${a.strength}%`)],
      ["Endurance Rating", ...data.map((a) => `${a.endurance}%`)],
      ["Agility Rating", ...data.map((a) => `${a.agility}%`)],
      ["Training Completion Rate", ...data.map((a) => `${a.completionRate}%`)],
      ["Total Achievements", ...data.map((a) => `${a.achievementCount}`)],
    ];

    autoTable(doc, {
      startY: curY,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: { fillColor: slateDark, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: slateBorder },
      head: [headers],
      body: rows,
    });
  }

  // Add footers & page numbers
  addFooter(doc);

  // Generate filename and save
  const filename = `${type.toLowerCase()}-performance-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
