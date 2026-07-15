"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatNumber, maskVin } from "@/lib/utils";

type ReportLike = {
  reportId: string;
  vin: string;
  mileage: number;
  zipCode: string;
  climate: string;
  year: number;
  make: string;
  model: string;
  engine: string | null;
  transmission: string | null;
  drivetrain: string | null;
  fuelType: string | null;
  bodyStyle: string | null;
  finalScore: number;
  riskLabel: string;
  reliabilityGrade: string;
  exposure12: number;
  exposure24: number;
  worstCase: number;
  underwriterClass: number;
  createdAt: string;
  repairs: Array<{
    rank: number;
    name: string;
    avgCost: number;
    mileageLow: number | null;
    mileageHigh: number | null;
    riskLevel: string;
  }>;
  riskDrivers: Array<{ name: string; percent: number; impact: string; detail: string }>;
};

export async function downloadReportPdf(report: ReportLike) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  const date = new Date(report.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Header
  doc.setFillColor(10, 28, 62);
  doc.rect(0, 0, pageW, 72, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("REPAIR RISK REVIEW", margin, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 205, 240);
  doc.text("Powered by My Road Armor", margin, 48);
  doc.setTextColor(220, 230, 245);
  doc.text(date, pageW - margin, 32, { align: "right" });
  doc.text(`Report ID: ${report.reportId}`, pageW - margin, 48, { align: "right" });

  let y = 100;
  doc.setTextColor(10, 28, 62);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`${report.year} ${report.make} ${report.model}`, margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 90, 110);
  doc.text(
    `VIN ${maskVin(report.vin)}  ·  ${formatNumber(report.mileage)} miles  ·  ZIP ${report.zipCode} (${report.climate})`,
    margin,
    y
  );

  y += 28;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageW - margin * 2, 88, 6, 6, "F");
  doc.setTextColor(10, 28, 62);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Overall Repair Risk", margin + 16, y + 22);
  doc.setFontSize(28);
  const riskColor =
    report.finalScore <= 40
      ? [22, 163, 74]
      : report.finalScore <= 60
        ? [234, 88, 12]
        : [220, 38, 38];
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.text(`${report.finalScore}`, margin + 16, y + 58);
  doc.setFontSize(12);
  doc.text(report.riskLabel.toUpperCase(), margin + 70, y + 52);

  doc.setTextColor(10, 28, 62);
  doc.setFontSize(11);
  doc.text("Reliability Grade", margin + 200, y + 22);
  doc.setFontSize(28);
  doc.text(report.reliabilityGrade, margin + 200, y + 58);

  doc.setFontSize(11);
  doc.text("Expected Exposure", margin + 340, y + 22);
  doc.setFontSize(12);
  doc.text(`12 mo: ${formatCurrency(report.exposure12)}`, margin + 340, y + 44);
  doc.text(`24 mo: ${formatCurrency(report.exposure24)}`, margin + 340, y + 62);

  y += 110;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(10, 28, 62);
  doc.text("Primary Risk Drivers", margin, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Factor", "Contribution", "Impact"]],
    body: report.riskDrivers.map((d) => [d.name, `${d.percent}%`, d.impact]),
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [10, 28, 62], textColor: 255 },
  });

  y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y) + 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Top Six Most Likely Repairs", margin, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["#", "Repair", "Avg Cost", "Typical Mileage", "Risk"]],
    body: report.repairs.map((r) => [
      String(r.rank),
      r.name,
      formatCurrency(r.avgCost),
      r.mileageLow != null && r.mileageHigh != null
        ? `${formatNumber(r.mileageLow)}–${formatNumber(r.mileageHigh)}`
        : "—",
      r.riskLevel,
    ]),
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [10, 28, 62], textColor: 255 },
  });

  doc.addPage();
  y = 50;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(10, 28, 62);
  doc.text("Financial Risk Overview", margin, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`12-Month Exposure: ${formatCurrency(report.exposure12)}`, margin, y);
  y += 16;
  doc.text(`24-Month Exposure: ${formatCurrency(report.exposure24)}`, margin, y);
  y += 16;
  doc.setTextColor(185, 28, 28);
  doc.setFont("helvetica", "bold");
  doc.text(`Worst Case Scenario (24 Months): ${formatCurrency(report.worstCase)}`, margin, y);

  y += 28;
  doc.setTextColor(10, 28, 62);
  doc.text("Potential High-Cost Repairs", margin, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Repair", "Estimated Cost"]],
    body: [
      ["Engine Replacement", "$7,900"],
      ["Transmission Replacement", "$4,600"],
      ["Turbocharger Replacement", "$2,650"],
      ["A/C System Replacement", "$1,420"],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [10, 28, 62], textColor: 255 },
  });

  y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y) + 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Risk Factor Details", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const d of report.riskDrivers) {
    doc.setFont("helvetica", "bold");
    doc.text(`${d.name} (${d.impact})`, margin, y);
    y += 13;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(d.detail, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 10;
  }

  y += 10;
  doc.setFillColor(10, 28, 62);
  doc.roundedRect(margin, y, pageW - margin * 2, 70, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Next Step", margin + 16, y + 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Visit MyRoadArmor.com to explore protection plans matched to this risk profile.",
    margin + 16,
    y + 44
  );

  doc.setTextColor(120, 130, 150);
  doc.setFontSize(8);
  doc.text(
    "Repair Risk Index is a relative Version 1 estimate — not a literal claim probability.",
    margin,
    doc.internal.pageSize.getHeight() - 24
  );

  doc.save(`${report.reportId}.pdf`);
}
