import { jsPDF } from "jspdf";

export function generateAchievementCertificate(achievement, athleteName, coachName) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // 1. Background
  doc.setFillColor(11, 13, 19); // #0b0d13
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // 2. Decorative Outer Border (Double Gold/Peach lines)
  doc.setDrawColor(238, 155, 116); // #ee9b74
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(0.5);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // 3. Corner Accent Blocks
  const corners = [
    [10, 10],
    [pageWidth - 16, 10],
    [10, pageHeight - 16],
    [pageWidth - 16, pageHeight - 16]
  ];
  doc.setFillColor(238, 155, 116);
  corners.forEach(([x, y]) => {
    doc.rect(x, y, 6, 6, "F");
  });

  // 4. Header: Platform Brand
  doc.setTextColor(238, 155, 116);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ATHLETEX SPORTS PERFORMANCE PLATFORM", pageWidth / 2, 28, { align: "center" });

  doc.setTextColor(160, 170, 190);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("OFFICIAL ATHLETIC MERIT & PERFORMANCE ACCREDITATION", pageWidth / 2, 34, { align: "center" });

  // Divider line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.line(pageWidth / 2 - 40, 38, pageWidth / 2 + 40, 38);

  // 5. Certificate Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("CERTIFICATE OF ACHIEVEMENT", pageWidth / 2, 52, { align: "center" });

  // 6. Presentation Text
  doc.setTextColor(180, 190, 205);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.text("This prestigious accreditation is proudly presented to", pageWidth / 2, 65, { align: "center" });

  // 7. Athlete Name (Hero typography)
  doc.setTextColor(238, 155, 116);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(32);
  doc.text(athleteName || "Athlete", pageWidth / 2, 80, { align: "center" });

  // Underline beneath name
  doc.setDrawColor(238, 155, 116);
  doc.setLineWidth(0.8);
  const nameWidth = doc.getTextWidth(athleteName || "Athlete");
  doc.line(pageWidth / 2 - (nameWidth / 2) - 10, 83, pageWidth / 2 + (nameWidth / 2) + 10, 83);

  // 8. Reason / Description
  doc.setTextColor(220, 225, 235);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("In official recognition of athletic distinction, discipline, and outstanding milestone:", pageWidth / 2, 96, { align: "center" });

  // Achievement Title Box
  doc.setFillColor(20, 24, 35);
  doc.setDrawColor(238, 155, 116);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth / 2 - 80, 103, 160, 18, 3, 3, "FD");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(achievement.title || "Milestone Award", pageWidth / 2, 115, { align: "center" });

  // Category & Level
  doc.setTextColor(170, 180, 195);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const metaText = `CATEGORY: ${achievement.category || "GENERAL"}  •  LEVEL: ${achievement.level || "GOLD"}  •  AWARD DATE: ${achievement.date || new Date().toISOString().split("T")[0]}`;
  doc.text(metaText, pageWidth / 2, 131, { align: "center" });

  if (achievement.description) {
    doc.setTextColor(140, 150, 165);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    const splitDesc = doc.splitTextToSize(`"${achievement.description}"`, 180);
    doc.text(splitDesc, pageWidth / 2, 140, { align: "center" });
  }

  // 9. Official Seal (Center-bottom)
  const sealX = pageWidth / 2;
  const sealY = 162;
  doc.setFillColor(238, 155, 116);
  doc.circle(sealX, sealY, 12, "F");
  doc.setFillColor(11, 13, 19);
  doc.circle(sealX, sealY, 10.5, "F");

  doc.setTextColor(238, 155, 116);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("VERIFIED", sealX, sealY - 2, { align: "center" });
  doc.text("ATHLETEX", sealX, sealY + 2, { align: "center" });
  doc.text("★ EXCELLENCE ★", sealX, sealY + 5.5, { align: "center" });

  // 10. Signatures
  // Left: Coach Signature
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(35, 182, 95, 182);

  doc.setTextColor(238, 155, 116);
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.text(coachName ? `Coach ${coachName}` : "Assigned Coach", 65, 178, { align: "center" });

  doc.setTextColor(160, 170, 185);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("OFFICIAL COACHING ATTESTATION", 65, 187, { align: "center" });

  // Right: Platform Director Signature
  doc.line(pageWidth - 95, 182, pageWidth - 35, 182);

  doc.setTextColor(238, 155, 116);
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.text("Dr. Marcus Vance", pageWidth - 65, 178, { align: "center" });

  doc.setTextColor(160, 170, 185);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DIRECTOR OF ATHLETIC DEVELOPMENT", pageWidth - 65, 187, { align: "center" });

  // 11. Footer Verification Code & Anti-Counterfeit Hash
  const certId = `AX-${achievement.id ? achievement.id.substring(0, 8).toUpperCase() : Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  doc.setTextColor(100, 110, 125);
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text(`VERIFICATION ID: ${certId} • ISSUED VIA ATHLETEX PERFORMANCE ENGINE • SECURE DIGITAL ACCREDITATION`, pageWidth / 2, 202, { align: "center" });

  // 12. Save File
  const safeName = (athleteName || "Athlete").replace(/[^a-zA-Z0-9]/g, "_");
  const safeTitle = (achievement.title || "Achievement").replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`${safeName}_Certificate_${safeTitle}.pdf`);
}
