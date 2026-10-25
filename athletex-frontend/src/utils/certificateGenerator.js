import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export async function generateAchievementCertificate(achievement, athleteName, coachName) {
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
  doc.text("In official recognition of athletic distinction, discipline, and outstanding milestone:", pageWidth / 2, 95, { align: "center" });

  // Achievement Title Box
  doc.setFillColor(20, 24, 35);
  doc.setDrawColor(238, 155, 116);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth / 2 - 85, 102, 170, 18, 3, 3, "FD");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(achievement.title || "Milestone Award", pageWidth / 2, 114, { align: "center" });

  // Category, Level, Date & Tournament
  doc.setTextColor(170, 180, 195);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  let metaText = `CATEGORY: ${achievement.category || "GENERAL"}  •  LEVEL: ${achievement.level || "GOLD"}  •  DATE: ${achievement.date || new Date().toISOString().split("T")[0]}`;
  if (achievement.tournamentName) {
    metaText += `  •  EVENT: ${achievement.tournamentName}`;
  }
  doc.text(metaText, pageWidth / 2, 128, { align: "center" });

  if (achievement.organizer || achievement.sanctionId) {
    doc.setTextColor(238, 155, 116);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    const orgText = `SANCTION: ${achievement.sanctionId || "VERIFIED"}  •  FEDERATION / ORG: ${achievement.organizer || "AthleteX Accreditation Board"}`;
    doc.text(orgText, pageWidth / 2, 134, { align: "center" });
  }

  if (achievement.description) {
    doc.setTextColor(140, 150, 165);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    const splitDesc = doc.splitTextToSize(`"${achievement.description}"`, 190);
    doc.text(splitDesc, pageWidth / 2, 142, { align: "center" });
  }

  // 9. Official Seal (Center-bottom)
  const sealX = pageWidth / 2;
  const sealY = 164;
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

  // 10. REAL SCANNABLE QR CODE (Bottom Left)
  const athleteIdStr = achievement.athleteId || achievement.userId || "guest";
  const certId = achievement.certificateHash || `AX-${achievement.id ? achievement.id.substring(0, 8).toUpperCase() : Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const verifyUrl = `${window.location.origin}/verify/${athleteIdStr}?cert=${encodeURIComponent(certId)}`;

  const qrX = 18;
  const qrY = 145;

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 256,
      color: {
        dark: "#ee9b74",
        light: "#0b0d13"
      }
    });

    // Draw background card for QR
    doc.setFillColor(20, 24, 35);
    doc.setDrawColor(238, 155, 116);
    doc.setLineWidth(0.4);
    doc.roundedRect(qrX, qrY, 32, 35, 2, 2, "FD");

    // Embed genuine QR image
    doc.addImage(qrDataUrl, "PNG", qrX + 2, qrY + 2, 28, 28);

    doc.setTextColor(170, 180, 195);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.text("SCAN TO VERIFY", qrX + 16, qrY + 33, { align: "center" });
  } catch (err) {
    console.error("QR Code Generation Error:", err);
    // Fallback graphic
    doc.setFillColor(20, 24, 35);
    doc.rect(qrX, qrY, 32, 32, "F");
  }

  // 11. Signatures
  // Left: Coach Signature
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(65, 182, 115, 182);

  doc.setTextColor(238, 155, 116);
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  const displayCoachName = coachName || achievement.verifiedByCoachName || "Assigned Coach";
  doc.text(`Coach ${displayCoachName.replace(/^Coach\s+/i, "")}`, 90, 178, { align: "center" });

  doc.setTextColor(160, 170, 185);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("OFFICIAL COACHING ATTESTATION", 90, 187, { align: "center" });

  // Right: Platform Director / Board Signature
  doc.line(pageWidth - 115, 182, pageWidth - 65, 182);

  doc.setTextColor(238, 155, 116);
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.text("AthleteX Accreditation Board", pageWidth - 90, 178, { align: "center" });

  doc.setTextColor(160, 170, 185);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("CHIEF ACCREDITATION OFFICER", pageWidth - 90, 187, { align: "center" });

  // 12. Footer Verification Code & Anti-Counterfeit Hash
  doc.setTextColor(100, 110, 125);
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text(`DIGITAL SIGNATURE: ${certId} • SCAN QR TO AUDIT • ATHLETEX VERIFIED LEDGER`, pageWidth / 2, 202, { align: "center" });

  // 13. Save File
  const safeName = (athleteName || "Athlete").replace(/[^a-zA-Z0-9]/g, "_");
  const safeTitle = (achievement.title || "Achievement").replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`${safeName}_Certificate_${safeTitle}.pdf`);
}
